package com.hospital.smart.service;

import com.hospital.smart.dto.QueueDTO;
import com.hospital.smart.exception.ResourceNotFoundException;
import com.hospital.smart.exception.SlotUnavailableException;
import com.hospital.smart.model.*;
import com.hospital.smart.model.enums.AppointmentStatus;
import com.hospital.smart.model.enums.QueueStatus;
import com.hospital.smart.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QueueService {

    private final QueueRepository queueRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public QueueService(QueueRepository queueRepository,
                        AppointmentRepository appointmentRepository,
                        DoctorRepository doctorRepository,
                        PatientRepository patientRepository,
                        SimpMessagingTemplate messagingTemplate) {
        this.queueRepository = queueRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Check in a patient — creates a queue entry for their appointment.
     */
    public QueueDTO.Response checkIn(String appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment", "id", appointmentId));

        // Validate appointment status
        if (appointment.getStatus() != AppointmentStatus.PENDING &&
                appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new SlotUnavailableException(
                    "Appointment must be PENDING or CONFIRMED to check in. Current status: "
                            + appointment.getStatus());
        }

        // Check if already checked in
        Optional<Queue> existingQueue = queueRepository.findByAppointmentId(appointmentId);
        if (existingQueue.isPresent()) {
            throw new SlotUnavailableException("Patient is already checked in for this appointment.");
        }

        // Get next queue number for this doctor today
        long count = queueRepository.countByDoctorIdAndQueueDate(
                appointment.getDoctorId(), appointment.getAppointmentDate());
        int nextNumber = (int) count + 1;

        // Calculate estimated waiting time
        Doctor doctor = doctorRepository.findById(appointment.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor", "id", appointment.getDoctorId()));

        int waitingPatientsAhead = getWaitingCount(appointment.getDoctorId(),
                appointment.getAppointmentDate());
        int estimatedWait = waitingPatientsAhead * doctor.getAverageConsultationTime();

        // Create queue entry
        Queue queue = Queue.builder()
                .appointmentId(appointmentId)
                .doctorId(appointment.getDoctorId())
                .patientId(appointment.getPatientId())
                .queueDate(appointment.getAppointmentDate())
                .queueNumber(nextNumber)
                .status(QueueStatus.WAITING)
                .checkInTime(LocalDateTime.now())
                .estimatedWaitingTime(estimatedWait)
                .build();

        queue = queueRepository.save(queue);

        // Update appointment status
        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        appointmentRepository.save(appointment);

        // Broadcast queue update
        broadcastQueueUpdate(appointment.getDoctorId(), appointment.getAppointmentDate());

        return toResponse(queue);
    }

    /**
     * Call the next patient in the queue.
     */
    public QueueDTO.Response callNext(String doctorId) {
        LocalDate today = LocalDate.now();

        List<Queue> waiting = queueRepository.findByDoctorIdAndQueueDateAndStatus(
                doctorId, today, QueueStatus.WAITING);

        if (waiting.isEmpty()) {
            throw new ResourceNotFoundException("Queue", "status", "No waiting patients");
        }

        // Get the first waiting patient (lowest queue number)
        Queue next = waiting.stream()
                .min((a, b) -> Integer.compare(a.getQueueNumber(), b.getQueueNumber()))
                .get();

        next.setStatus(QueueStatus.CALLED);
        next.setCalledTime(LocalDateTime.now());
        next = queueRepository.save(next);

        // Update appointment status
        Appointment appointment = appointmentRepository.findById(next.getAppointmentId())
                .orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.IN_QUEUE);
            appointmentRepository.save(appointment);
        }

        // Recalculate waiting times for remaining patients
        recalculateWaitingTimes(doctorId, today);

        // Broadcast queue update
        broadcastQueueUpdate(doctorId, today);

        return toResponse(next);
    }

    /**
     * Start consultation — moves patient from CALLED to IN_CONSULTATION.
     */
    public QueueDTO.Response startConsultation(String queueId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue", "id", queueId));

        if (queue.getStatus() != QueueStatus.CALLED) {
            throw new SlotUnavailableException(
                    "Patient must be CALLED before starting consultation.");
        }

        queue.setStatus(QueueStatus.IN_CONSULTATION);
        queue.setConsultationStartTime(LocalDateTime.now());
        queue = queueRepository.save(queue);

        // Update appointment status
        Appointment appointment = appointmentRepository.findById(queue.getAppointmentId())
                .orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.IN_CONSULTATION);
            appointmentRepository.save(appointment);
        }

        broadcastQueueUpdate(queue.getDoctorId(), queue.getQueueDate());

        return toResponse(queue);
    }

    /**
     * Complete consultation — finishes the current patient.
     */
    public QueueDTO.Response completeConsultation(String queueId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue", "id", queueId));

        if (queue.getStatus() != QueueStatus.IN_CONSULTATION) {
            throw new SlotUnavailableException(
                    "Patient must be IN_CONSULTATION to complete.");
        }

        queue.setStatus(QueueStatus.COMPLETED);
        queue.setConsultationEndTime(LocalDateTime.now());
        queue = queueRepository.save(queue);

        // Update appointment status
        Appointment appointment = appointmentRepository.findById(queue.getAppointmentId())
                .orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
        }

        // Recalculate for remaining
        recalculateWaitingTimes(queue.getDoctorId(), queue.getQueueDate());
        broadcastQueueUpdate(queue.getDoctorId(), queue.getQueueDate());

        return toResponse(queue);
    }

    /**
     * Skip a patient in the queue.
     */
    public QueueDTO.Response skip(String queueId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue", "id", queueId));

        queue.setStatus(QueueStatus.SKIPPED);
        queue = queueRepository.save(queue);

        Appointment appointment = appointmentRepository.findById(queue.getAppointmentId())
                .orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.NO_SHOW);
            appointmentRepository.save(appointment);
        }

        recalculateWaitingTimes(queue.getDoctorId(), queue.getQueueDate());
        broadcastQueueUpdate(queue.getDoctorId(), queue.getQueueDate());

        return toResponse(queue);
    }

    /**
     * Get the queue for a doctor on a given date.
     */
    public List<QueueDTO.Response> getByDoctor(String doctorId, LocalDate date) {
        return queueRepository.findByDoctorIdAndQueueDateOrderByQueueNumberAsc(doctorId, date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get the queue for a doctor today.
     */
    public List<QueueDTO.Response> getByDoctorToday(String doctorId) {
        return getByDoctor(doctorId, LocalDate.now());
    }

    /**
     * Get queue entry for a patient on a given date.
     */
    public QueueDTO.Response getByPatient(String patientId, LocalDate date) {
        Queue queue = queueRepository.findByPatientIdAndQueueDate(patientId, date)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Queue", "patientId", patientId));
        return toResponse(queue);
    }

    /**
     * Get queue position for a patient — how many people are ahead.
     */
    public int getPatientPosition(String patientId, LocalDate date) {
        Queue patientQueue = queueRepository.findByPatientIdAndQueueDate(patientId, date)
                .orElse(null);

        if (patientQueue == null || patientQueue.getStatus() != QueueStatus.WAITING) {
            return -1;
        }

        List<Queue> allWaiting = queueRepository.findByDoctorIdAndQueueDateAndStatus(
                patientQueue.getDoctorId(), date, QueueStatus.WAITING);

        return (int) allWaiting.stream()
                .filter(q -> q.getQueueNumber() < patientQueue.getQueueNumber())
                .count() + 1;
    }

    // --- Helpers ---

    private int getWaitingCount(String doctorId, LocalDate date) {
        List<QueueStatus> activeStatuses = Arrays.asList(
                QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_CONSULTATION);
        return queueRepository.findByDoctorIdAndQueueDateAndStatusIn(
                doctorId, date, activeStatuses).size();
    }

    private void recalculateWaitingTimes(String doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        if (doctor == null) return;

        List<Queue> waitingList = queueRepository.findByDoctorIdAndQueueDateAndStatus(
                doctorId, date, QueueStatus.WAITING);

        // Sort by queue number
        waitingList.sort((a, b) -> Integer.compare(a.getQueueNumber(), b.getQueueNumber()));

        for (int i = 0; i < waitingList.size(); i++) {
            Queue q = waitingList.get(i);
            q.setEstimatedWaitingTime((i + 1) * doctor.getAverageConsultationTime());
            queueRepository.save(q);
        }
    }

    /**
     * Broadcast queue update to WebSocket subscribers.
     * Clients subscribe to /topic/queue/{doctorId}
     */
    private void broadcastQueueUpdate(String doctorId, LocalDate date) {
        List<QueueDTO.Response> queueList = getByDoctor(doctorId, date);
        messagingTemplate.convertAndSend("/topic/queue/" + doctorId, queueList);
    }

    private QueueDTO.Response toResponse(Queue queue) {
        String doctorName = doctorRepository.findById(queue.getDoctorId())
                .map(Doctor::getDoctorName)
                .orElse(null);

        String patientName = patientRepository.findById(queue.getPatientId())
                .map(Patient::getPatientName)
                .orElse(null);

        return QueueDTO.Response.builder()
                .id(queue.getId())
                .appointmentId(queue.getAppointmentId())
                .doctorId(queue.getDoctorId())
                .doctorName(doctorName)
                .patientId(queue.getPatientId())
                .patientName(patientName)
                .queueDate(queue.getQueueDate())
                .queueNumber(queue.getQueueNumber())
                .status(queue.getStatus().name())
                .estimatedWaitingTime(queue.getEstimatedWaitingTime())
                .checkInTime(queue.getCheckInTime() != null
                        ? queue.getCheckInTime().toString() : null)
                .calledTime(queue.getCalledTime() != null
                        ? queue.getCalledTime().toString() : null)
                .consultationStartTime(queue.getConsultationStartTime() != null
                        ? queue.getConsultationStartTime().toString() : null)
                .consultationEndTime(queue.getConsultationEndTime() != null
                        ? queue.getConsultationEndTime().toString() : null)
                .build();
    }
}
