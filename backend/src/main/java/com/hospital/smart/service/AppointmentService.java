package com.hospital.smart.service;

import com.hospital.smart.dto.AppointmentDTO;
import com.hospital.smart.exception.ResourceNotFoundException;
import com.hospital.smart.exception.SlotUnavailableException;
import com.hospital.smart.model.*;
import com.hospital.smart.model.enums.AppointmentStatus;
import com.hospital.smart.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DepartmentRepository departmentRepository;

    /** Simple counter for appointment numbers. In production, use a database sequence. */
    private final AtomicLong counter = new AtomicLong(1);

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorRepository doctorRepository,
                              PatientRepository patientRepository,
                              DepartmentRepository departmentRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.departmentRepository = departmentRepository;
    }

    /**
     * Book a new appointment with double-booking prevention.
     *
     * @param request   the booking request
     * @param userId    the authenticated user's ID (patient or receptionist)
     * @param userRole  the authenticated user's role
     */
    public AppointmentDTO.Response book(AppointmentDTO.BookRequest request,
                                        String userId, String userRole) {
        // Determine the patient ID
        String patientId;
        if ("RECEPTIONIST".equals(userRole) && request.getPatientId() != null) {
            // Receptionist booking on behalf of a patient
            patientId = request.getPatientId();
        } else {
            // Patient booking for themselves — look up their Patient profile
            Patient patient = patientRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", userId));
            patientId = patient.getId();
        }

        // Validate doctor exists
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor", "id", request.getDoctorId()));

        // Validate department exists if provided
        if (request.getDepartmentId() != null && !request.getDepartmentId().isEmpty()) {
            departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department", "id", request.getDepartmentId()));
        }

        // --- Double-booking prevention ---
        List<AppointmentStatus> activeStatuses = Arrays.asList(
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.IN_QUEUE,
                AppointmentStatus.IN_CONSULTATION
        );

        List<Appointment> existingAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusIn(
                        request.getDoctorId(), request.getAppointmentDate(), activeStatuses);

        boolean slotTaken = existingAppointments.stream()
                .anyMatch(apt -> apt.getStartTime().equals(request.getStartTime()));

        if (slotTaken) {
            throw new SlotUnavailableException(
                    "The selected time slot is already booked. Please choose another slot.");
        }

        // Check if patient already has an appointment with this doctor on the same day
        List<Appointment> patientAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusIn(
                        request.getDoctorId(), request.getAppointmentDate(), activeStatuses)
                .stream()
                .filter(apt -> apt.getPatientId().equals(patientId))
                .collect(Collectors.toList());

        if (!patientAppointments.isEmpty()) {
            throw new SlotUnavailableException(
                    "You already have an active appointment with this doctor on this date.");
        }

        // Check daily patient limit
        long dailyCount = appointmentRepository.countByDoctorIdAndAppointmentDateAndStatusIn(
                request.getDoctorId(), request.getAppointmentDate(), activeStatuses);
        if (dailyCount >= doctor.getMaxPatientsPerDay()) {
            throw new SlotUnavailableException(
                    "This doctor has reached the maximum number of patients for this date.");
        }

        // Calculate end time
        LocalTime endTime = request.getStartTime()
                .plusMinutes(doctor.getAverageConsultationTime());

        // Generate appointment number
        String appointmentNumber = generateAppointmentNumber(request.getAppointmentDate());

        // Create appointment
        Appointment appointment = Appointment.builder()
                .appointmentNumber(appointmentNumber)
                .patientId(patientId)
                .doctorId(request.getDoctorId())
                .departmentId(request.getDepartmentId())
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .status(AppointmentStatus.PENDING)
                .bookingType(request.getBookingType())
                .reason(request.getReason())
                .notes(request.getNotes())
                .priority(request.getPriority())
                .createdBy(userId)
                .build();

        appointment = appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    /**
     * Get all appointments for a patient.
     */
    public List<AppointmentDTO.Response> getByPatient(String patientId) {
        return appointmentRepository
                .findByPatientIdOrderByAppointmentDateDescStartTimeDesc(patientId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all appointments for a patient by user ID (looks up the Patient first).
     */
    public List<AppointmentDTO.Response> getByPatientUserId(String userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", userId));
        return getByPatient(patient.getId());
    }

    /**
     * Get all appointments for a doctor.
     */
    public List<AppointmentDTO.Response> getByDoctor(String doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all appointments for a doctor on a specific date.
     */
    public List<AppointmentDTO.Response> getByDoctorAndDate(String doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get appointment by ID.
     */
    public AppointmentDTO.Response getById(String id) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return toResponse(apt);
    }

    /**
     * Cancel an appointment.
     */
    public AppointmentDTO.Response cancel(String id, String cancellationReason) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (apt.getStatus() == AppointmentStatus.COMPLETED ||
                apt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Cannot cancel an appointment that is already " + apt.getStatus());
        }

        apt.setStatus(AppointmentStatus.CANCELLED);
        apt.setCancellationReason(cancellationReason);
        apt = appointmentRepository.save(apt);
        return toResponse(apt);
    }

    /**
     * Reschedule an appointment (cancels old, creates new).
     */
    public AppointmentDTO.Response reschedule(String id, AppointmentDTO.RescheduleRequest request,
                                               String userId, String userRole) {
        Appointment oldApt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (oldApt.getStatus() == AppointmentStatus.COMPLETED ||
                oldApt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Cannot reschedule an appointment that is already " + oldApt.getStatus());
        }

        // Cancel the old appointment
        oldApt.setStatus(AppointmentStatus.RESCHEDULED);
        appointmentRepository.save(oldApt);

        // Book a new appointment
        AppointmentDTO.BookRequest bookRequest = AppointmentDTO.BookRequest.builder()
                .doctorId(oldApt.getDoctorId())
                .departmentId(oldApt.getDepartmentId())
                .appointmentDate(request.getNewDate())
                .startTime(request.getNewStartTime())
                .reason(oldApt.getReason())
                .notes(request.getReason())
                .priority(oldApt.getPriority())
                .bookingType(oldApt.getBookingType())
                .build();

        // For the new appointment, preserve the patient context
        if ("RECEPTIONIST".equals(userRole)) {
            bookRequest.setPatientId(oldApt.getPatientId());
        }

        AppointmentDTO.Response newApt = book(bookRequest, userId, userRole);

        // Link rescheduled reference
        Appointment newAppointment = appointmentRepository.findById(newApt.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", newApt.getId()));
        newAppointment.setRescheduledFrom(id);
        appointmentRepository.save(newAppointment);

        return toResponse(newAppointment);
    }

    /**
     * Update appointment status (used by doctor/receptionist during consultation workflow).
     */
    public AppointmentDTO.Response updateStatus(String id, AppointmentDTO.StatusUpdateRequest request) {
        Appointment apt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        apt.setStatus(request.getStatus());
        if (request.getNotes() != null) apt.setNotes(request.getNotes());
        if (request.getCancellationReason() != null)
            apt.setCancellationReason(request.getCancellationReason());

        apt = appointmentRepository.save(apt);
        return toResponse(apt);
    }

    /**
     * Get all appointments (admin view).
     */
    public List<AppointmentDTO.Response> getAll() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // --- Helpers ---

    private String generateAppointmentNumber(LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long sequence = counter.getAndIncrement();
        return String.format("APT-%s-%03d", dateStr, sequence);
    }

    private AppointmentDTO.Response toResponse(Appointment apt) {
        // Resolve patient name
        String patientName = patientRepository.findById(apt.getPatientId())
                .map(Patient::getPatientName)
                .orElse(null);

        // Resolve doctor name
        String doctorName = doctorRepository.findById(apt.getDoctorId())
                .map(Doctor::getDoctorName)
                .orElse(null);

        // Resolve department name
        String departmentName = null;
        if (apt.getDepartmentId() != null && !apt.getDepartmentId().isEmpty()) {
            departmentName = departmentRepository.findById(apt.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }

        return AppointmentDTO.Response.builder()
                .id(apt.getId())
                .appointmentNumber(apt.getAppointmentNumber())
                .patientId(apt.getPatientId())
                .patientName(patientName)
                .doctorId(apt.getDoctorId())
                .doctorName(doctorName)
                .departmentId(apt.getDepartmentId())
                .departmentName(departmentName)
                .appointmentDate(apt.getAppointmentDate())
                .startTime(apt.getStartTime())
                .endTime(apt.getEndTime())
                .status(apt.getStatus().name())
                .bookingType(apt.getBookingType() != null ? apt.getBookingType().name() : null)
                .reason(apt.getReason())
                .notes(apt.getNotes())
                .priority(apt.getPriority() != null ? apt.getPriority().name() : null)
                .createdBy(apt.getCreatedBy())
                .cancellationReason(apt.getCancellationReason())
                .createdAt(apt.getCreatedAt() != null ? apt.getCreatedAt().toString() : null)
                .updatedAt(apt.getUpdatedAt() != null ? apt.getUpdatedAt().toString() : null)
                .build();
    }
}
