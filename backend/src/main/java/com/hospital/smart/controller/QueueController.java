package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.dto.QueueDTO;
import com.hospital.smart.model.Patient;
import com.hospital.smart.repository.PatientRepository;
import com.hospital.smart.security.CustomUserDetails;
import com.hospital.smart.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/queues")
public class QueueController {

    private final QueueService queueService;
    private final PatientRepository patientRepository;

    public QueueController(QueueService queueService, PatientRepository patientRepository) {
        this.queueService = queueService;
        this.patientRepository = patientRepository;
    }

    /**
     * POST /api/queues/check-in — Check in a patient for their appointment.
     */
    @PostMapping("/check-in")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> checkIn(
            @Valid @RequestBody QueueDTO.CheckInRequest request) {
        QueueDTO.Response queue = queueService.checkIn(request.getAppointmentId());
        return ResponseEntity.ok(
                ApiResponse.success("Patient checked in", queue));
    }

    /**
     * POST /api/queues/call-next — Doctor calls the next patient.
     */
    @PostMapping("/call-next")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> callNext(
            @Valid @RequestBody QueueDTO.CallNextRequest request) {
        QueueDTO.Response queue = queueService.callNext(request.getDoctorId());
        return ResponseEntity.ok(
                ApiResponse.success("Next patient called", queue));
    }

    /**
     * POST /api/queues/start — Start consultation.
     */
    @PostMapping("/start")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> startConsultation(
            @Valid @RequestBody QueueDTO.QueueActionRequest request) {
        QueueDTO.Response queue = queueService.startConsultation(request.getQueueId());
        return ResponseEntity.ok(
                ApiResponse.success("Consultation started", queue));
    }

    /**
     * POST /api/queues/complete — Complete consultation.
     */
    @PostMapping("/complete")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> completeConsultation(
            @Valid @RequestBody QueueDTO.QueueActionRequest request) {
        QueueDTO.Response queue = queueService.completeConsultation(request.getQueueId());
        return ResponseEntity.ok(
                ApiResponse.success("Consultation completed", queue));
    }

    /**
     * POST /api/queues/skip — Skip a patient.
     */
    @PostMapping("/skip")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> skip(
            @Valid @RequestBody QueueDTO.QueueActionRequest request) {
        QueueDTO.Response queue = queueService.skip(request.getQueueId());
        return ResponseEntity.ok(
                ApiResponse.success("Patient skipped", queue));
    }

    /**
     * GET /api/queues/{doctorId} — Get queue for a doctor (today by default).
     */
    @GetMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<List<QueueDTO.Response>>> getByDoctor(
            @PathVariable String doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        List<QueueDTO.Response> queue = (date != null)
                ? queueService.getByDoctor(doctorId, date)
                : queueService.getByDoctorToday(doctorId);
        return ResponseEntity.ok(
                ApiResponse.success("Queue retrieved", queue));
    }

    /**
     * GET /api/queues/patient/me — Get current patient's queue status.
     */
    @GetMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> getMyQueueStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Patient patient = patientRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new com.hospital.smart.exception.ResourceNotFoundException(
                        "Patient", "userId", userDetails.getId()));
        QueueDTO.Response queue = queueService.getByPatient(
                patient.getId(), LocalDate.now());
        return ResponseEntity.ok(
                ApiResponse.success("Queue status retrieved", queue));
    }
}
