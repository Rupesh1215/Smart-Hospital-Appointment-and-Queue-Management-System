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
    private final DepartmentRepository departmentRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public QueueService(QueueRepository queueRepository,
                        AppointmentRepository appointmentRepository,
                        DoctorRepository doctorRepository,
                        PatientRepository patientRepository,
                        DepartmentRepository departmentRepository,
                        SimpMessagingTemplate messagingTemplate,
                        AuditLogService auditLogService,
                        NotificationService notificationService) {
        this.queueRepository = queueRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.departmentRepository = departmentRepository;
        this.messagingTemplate = messagingTemplate;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE TRANSITIONS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Receptionist checks in a patient — creates a queue entry.
     */
    public QueueDTO.Response checkIn(String appointmentId, String performingUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        // Validate appointment status allows check-in
        if (appointment.getStatus() != AppointmentStatus.PENDING &&
                appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new SlotUnavailableException(
                    "Appointment must be PENDING or CONFIRMED to check in. Current status: "
                            + appointment.getStatus());
        }

        // Prevent double check-in
        Optional<Queue> existingQueue = queueRepository.findByAppointmentId(appointmentId);
        if (existingQueue.isPresent()) {
            throw new SlotUnavailableException("Patient is already checked in for this appointment.");
        }

        // Next queue number for this doctor today
        long count = queueRepository.countByDoctorIdAndQueueDate(
                appointment.getDoctorId(), appointment.getAppointmentDate());
        int nextNumber = (int) count + 1;

        // Estimated waiting time
        Doctor doctor = doctorRepository.findById(appointment.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", appointment.getDoctorId()));

        int waitingAhead = getWaitingCount(appointment.getDoctorId(), appointment.getAppointmentDate());
        int estimatedWait = waitingAhead * doctor.getAverageConsultationTime();

        // Build queue entry — snapshot departmentId and appointmentTime
        Queue queue = Queue.builder()
                .appointmentId(appointmentId)
                .doctorId(appointment.getDoctorId())
                .patientId(appointment.getPatientId())
                .departmentId(appointment.getDepartmentId())
                .appointmentTime(appointment.getStartTime())
                .queueDate(appointment.getAppointmentDate())
                .queueNumber(nextNumber)
                .status(QueueStatus.WAITING)
                .checkInTime(LocalDateTime.now())
                .estimatedWaitingTime(estimatedWait)
                .build();

        queue = queueRepository.save(queue);

        // Update appointment
        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        appointmentRepository.save(appointment);

        // Audit log
        String patientName = patientRepository.findById(appointment.getPatientId())
                .map(Patient::getPatientName).orElse("Unknown");
        auditLogService.log(performingUserId, "QUEUE_CHECK_IN", "Queue", queue.getId(),
                "Checked in patient " + patientName + " — Queue #" + nextNumber);

        // Broadcast
        broadcastQueueUpdate(appointment.getDoctorId(), appointment.getAppointmentDate());
        broadcastGlobalUpdate(appointment.getAppointmentDate());

        return toResponse(queue);
    }

    /**
     * Doctor calls the next waiting patient.
     */
    public QueueDTO.Response callNext(String doctorId, String performingUserId) {
        LocalDate today = LocalDate.now();

        // Must not have a CALLED or IN_CONSULTATION patient already
        List<Queue> already = queueRepository.findByDoctorIdAndQueueDateAndStatusIn(
                doctorId, today, Arrays.asList(QueueStatus.CALLED, QueueStatus.IN_CONSULTATION));
        if (!already.isEmpty()) {
            throw new SlotUnavailableException(
                    "There is already a patient being attended to. Complete or skip them first.");
        }

        List<Queue> waiting = queueRepository.findByDoctorIdAndQueueDateAndStatus(
                doctorId, today, QueueStatus.WAITING);

        if (waiting.isEmpty()) {
            throw new ResourceNotFoundException("Queue", "status", "No waiting patients");
        }

        Queue next = waiting.stream()
                .min((a, b) -> Integer.compare(a.getQueueNumber(), b.getQueueNumber()))
                .get();

        next.setStatus(QueueStatus.CALLED);
        next.setCalledTime(LocalDateTime.now());
        next = queueRepository.save(next);

        // Update appointment
        Appointment appointment = appointmentRepository.findById(next.getAppointmentId()).orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.IN_QUEUE);
            appointmentRepository.save(appointment);
        }

        // Audit
        String patientName = patientRepository.findById(next.getPatientId())
                .map(Patient::getPatientName).orElse("Unknown");
        auditLogService.log(performingUserId, "QUEUE_CALLED", "Queue", next.getId(),
                "Called patient " + patientName + " (Queue #" + next.getQueueNumber() + ")");

        // Notify patient
        notifyPatient(next, "Your turn is now!", "Doctor has called you. Please proceed to the consultation room.");

        recalculateWaitingTimes(doctorId, today);
        broadcastQueueUpdate(doctorId, today);
        broadcastGlobalUpdate(today);

        return toResponse(next);
    }

    /**
     * Doctor starts consultation (CALLED → IN_CONSULTATION).
     */
    public QueueDTO.Response startConsultation(String queueId, String performingUserId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue", "id", queueId));

        if (queue.getStatus() != QueueStatus.CALLED) {
            throw new SlotUnavailableException("Patient must be in CALLED state to start consultation. Current: " + queue.getStatus());
        }

        queue.setStatus(QueueStatus.IN_CONSULTATION);
        queue.setConsultationStartTime(LocalDateTime.now());
        queue = queueRepository.save(queue);

        Appointment appointment = appointmentRepository.findById(queue.getAppointmentId()).orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.IN_CONSULTATION);
            appointmentRepository.save(appointment);
        }

        String patientName = patientRepository.findById(queue.getPatientId())
                .map(Patient::getPatientName).orElse("Unknown");
        auditLogService.log(performingUserId, "CONSULTATION_STARTED", "Queue", queue.getId(),
                "Started consultation with " + patientName);

        notifyPatient(queue, "Consultation Started", "Your consultation has started. You are currently with the doctor.");

        broadcastQueueUpdate(queue.getDoctorId(), queue.getQueueDate());
        broadcastGlobalUpdate(queue.getQueueDate());

        return toResponse(queue);
    }

    /**
     * Doctor completes the consultation (IN_CONSULTATION → COMPLETED).
     */
    public QueueDTO.Response completeConsultation(String queueId, String performingUserId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue", "id", queueId));

        if (queue.getStatus() != QueueStatus.IN_CONSULTATION) {
            throw new SlotUnavailableException("Patient must be IN_CONSULTATION to complete. Current: " + queue.getStatus());
        }

        queue.setStatus(QueueStatus.COMPLETED);
        queue.setConsultationEndTime(LocalDateTime.now());
        queue = queueRepository.save(queue);

        Appointment appointment = appointmentRepository.findById(queue.getAppointmentId()).orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
        }

        String patientName = patientRepository.findById(queue.getPatientId())
                .map(Patient::getPatientName).orElse("Unknown");
        auditLogService.log(performingUserId, "CONSULTATION_COMPLETED", "Queue", queue.getId(),
                "Completed consultation with " + patientName);

        notifyPatient(queue, "Consultation Completed", "Your appointment has been completed. Thank you for visiting us.");

        recalculateWaitingTimes(queue.getDoctorId(), queue.getQueueDate());
        broadcastQueueUpdate(queue.getDoctorId(), queue.getQueueDate());
        broadcastGlobalUpdate(queue.getQueueDate());

        return toResponse(queue);
    }

    /**
     * Skip a patient (WAITING → SKIPPED). Doctor or authorised Receptionist.
     */
    public QueueDTO.Response skip(String queueId, String performingUserId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue", "id", queueId));

        if (queue.getStatus() != QueueStatus.WAITING && queue.getStatus() != QueueStatus.CALLED) {
            throw new SlotUnavailableException("Cannot skip a patient in state: " + queue.getStatus());
        }

        queue.setStatus(QueueStatus.SKIPPED);
        queue = queueRepository.save(queue);

        Appointment appointment = appointmentRepository.findById(queue.getAppointmentId()).orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.NO_SHOW);
            appointmentRepository.save(appointment);
        }

        String patientName = patientRepository.findById(queue.getPatientId())
                .map(Patient::getPatientName).orElse("Unknown");
        auditLogService.log(performingUserId, "QUEUE_SKIPPED", "Queue", queue.getId(),
                "Skipped patient " + patientName + " (Queue #" + queue.getQueueNumber() + ")");

        notifyPatient(queue, "Queue Update", "You were skipped in the queue. Please contact the reception desk.");

        recalculateWaitingTimes(queue.getDoctorId(), queue.getQueueDate());
        broadcastQueueUpdate(queue.getDoctorId(), queue.getQueueDate());
        broadcastGlobalUpdate(queue.getQueueDate());

        return toResponse(queue);
    }

    /**
     * Mark a patient as no-show (WAITING or CALLED → NO_SHOW).
     */
    public QueueDTO.Response noShow(String queueId, String performingUserId) {
        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue", "id", queueId));

        if (queue.getStatus() != QueueStatus.WAITING && queue.getStatus() != QueueStatus.CALLED) {
            throw new SlotUnavailableException("Cannot mark as NO_SHOW from state: " + queue.getStatus());
        }

        queue.setStatus(QueueStatus.NO_SHOW);
        queue = queueRepository.save(queue);

        Appointment appointment = appointmentRepository.findById(queue.getAppointmentId()).orElse(null);
        if (appointment != null) {
            appointment.setStatus(AppointmentStatus.NO_SHOW);
            appointmentRepository.save(appointment);
        }

        String patientName = patientRepository.findById(queue.getPatientId())
                .map(Patient::getPatientName).orElse("Unknown");
        auditLogService.log(performingUserId, "QUEUE_NO_SHOW", "Queue", queue.getId(),
                "Marked " + patientName + " as No-Show (Queue #" + queue.getQueueNumber() + ")");

        notifyPatient(queue, "Appointment Marked No-Show",
                "You have been marked as a no-show. Please contact reception to reschedule.");

        recalculateWaitingTimes(queue.getDoctorId(), queue.getQueueDate());
        broadcastQueueUpdate(queue.getDoctorId(), queue.getQueueDate());
        broadcastGlobalUpdate(queue.getQueueDate());

        return toResponse(queue);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // QUERIES
    // ─────────────────────────────────────────────────────────────────────────

    /** Get the full queue for a doctor on a given date. */
    public List<QueueDTO.Response> getByDoctor(String doctorId, LocalDate date) {
        return queueRepository.findByDoctorIdAndQueueDateOrderByQueueNumberAsc(doctorId, date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Get today's queue for a doctor. */
    public List<QueueDTO.Response> getByDoctorToday(String doctorId) {
        return getByDoctor(doctorId, LocalDate.now());
    }

    /** Get queue entry for a patient on a given date. */
    public QueueDTO.Response getByPatient(String patientId, LocalDate date) {
        List<Queue> list = queueRepository.findByPatientIdAndQueueDateOrderByQueueNumberDesc(patientId, date);
        if (list.isEmpty()) {
            throw new ResourceNotFoundException("Queue", "patientId", patientId);
        }
        return toResponse(list.get(0));
    }

    /**
     * Get the active queue entry for a patient today (WAITING / CALLED / IN_CONSULTATION).
     * Returns null if not currently in an active queue.
     */
    public QueueDTO.Response getActiveByPatient(String patientId) {
        List<QueueStatus> activeStatuses = Arrays.asList(
                QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_CONSULTATION);
        List<Queue> active = queueRepository.findByPatientIdAndQueueDateAndStatusIn(
                patientId, LocalDate.now(), activeStatuses);
        if (!active.isEmpty()) {
            return toResponse(active.get(0));
        }
        // Fall back to any entry today (could be COMPLETED, SKIPPED, NO_SHOW)
        List<Queue> allToday = queueRepository.findByPatientIdAndQueueDateOrderByQueueNumberDesc(patientId, LocalDate.now());
        if (!allToday.isEmpty()) {
            return toResponse(allToday.get(0));
        }
        return null;
    }

    /** Get all queues for today — admin monitoring. */
    public List<QueueDTO.Response> getAllByDate(LocalDate date) {
        return queueRepository.findByQueueDate(date)
                .stream()
                .sorted((a, b) -> {
                    int cmp = a.getDoctorId().compareTo(b.getDoctorId());
                    if (cmp != 0) return cmp;
                    return Integer.compare(a.getQueueNumber(), b.getQueueNumber());
                })
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

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
        waitingList.sort((a, b) -> Integer.compare(a.getQueueNumber(), b.getQueueNumber()));

        for (int i = 0; i < waitingList.size(); i++) {
            Queue q = waitingList.get(i);
            q.setEstimatedWaitingTime((i + 1) * doctor.getAverageConsultationTime());
            queueRepository.save(q);
        }
    }

    /**
     * Broadcast queue update to all subscribers of a specific doctor's topic.
     * Clients subscribe to /topic/queue/{doctorId}
     */
    private void broadcastQueueUpdate(String doctorId, LocalDate date) {
        List<QueueDTO.Response> queueList = getByDoctor(doctorId, date);
        messagingTemplate.convertAndSend("/topic/queue/" + doctorId, queueList);
    }

    /**
     * Broadcast all queues for a date to the admin global topic.
     * Clients subscribe to /topic/queue/all
     */
    private void broadcastGlobalUpdate(LocalDate date) {
        try {
            List<QueueDTO.Response> all = getAllByDate(date);
            messagingTemplate.convertAndSend("/topic/queue/all", all);
        } catch (Exception ignored) {
            // Global broadcast is best-effort
        }
    }

    /**
     * Send in-app WebSocket notification to the patient based on their userId.
     */
    private void notifyPatient(Queue queue, String title, String message) {
        try {
            // Look up the patient's userId for notification routing
            patientRepository.findById(queue.getPatientId()).ifPresent(patient -> {
                notificationService.sendNotification(
                        patient.getUserId(), title, message, "QUEUE", queue.getId());
            });
        } catch (Exception ignored) {
            // Notifications must never break the main queue flow
        }
    }

    /**
     * Build a QueueDTO.Response with all enriched fields.
     */
    private QueueDTO.Response toResponse(Queue queue) {
        String doctorName = doctorRepository.findById(queue.getDoctorId())
                .map(Doctor::getDoctorName)
                .orElse(null);

        String patientName = patientRepository.findById(queue.getPatientId())
                .map(Patient::getPatientName)
                .orElse(null);

        String departmentName = null;
        if (queue.getDepartmentId() != null && !queue.getDepartmentId().isEmpty()) {
            departmentName = departmentRepository.findById(queue.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }

        // Calculate patientsAhead: number of WAITING entries with lower queue number
        int patientsAhead = 0;
        if (queue.getStatus() == QueueStatus.WAITING) {
            List<Queue> allWaiting = queueRepository.findByDoctorIdAndQueueDateAndStatus(
                    queue.getDoctorId(), queue.getQueueDate(), QueueStatus.WAITING);
            patientsAhead = (int) allWaiting.stream()
                    .filter(q -> q.getQueueNumber() < queue.getQueueNumber())
                    .count();
        }

        return QueueDTO.Response.builder()
                .id(queue.getId())
                .appointmentId(queue.getAppointmentId())
                .doctorId(queue.getDoctorId())
                .doctorName(doctorName)
                .patientId(queue.getPatientId())
                .patientName(patientName)
                .departmentId(queue.getDepartmentId())
                .departmentName(departmentName)
                .queueDate(queue.getQueueDate())
                .appointmentTime(queue.getAppointmentTime() != null
                        ? queue.getAppointmentTime().toString() : null)
                .queueNumber(queue.getQueueNumber())
                .status(queue.getStatus().name())
                .estimatedWaitingTime(queue.getEstimatedWaitingTime())
                .patientsAhead(patientsAhead)
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
