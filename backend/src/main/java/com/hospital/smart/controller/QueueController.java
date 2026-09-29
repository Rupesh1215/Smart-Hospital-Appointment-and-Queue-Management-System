package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.dto.QueueDTO;
import com.hospital.smart.model.Doctor;
import com.hospital.smart.model.Patient;
import com.hospital.smart.repository.DoctorRepository;
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
    private final DoctorRepository doctorRepository;

    public QueueController(QueueService queueService,
                           PatientRepository patientRepository,
                           DoctorRepository doctorRepository) {
        this.queueService = queueService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE TRANSITION ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/queues/check-in — Receptionist checks in a patient.
     * RECEPTIONIST and ADMIN only.
     */
    @PostMapping("/check-in")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> checkIn(
            @Valid @RequestBody QueueDTO.CheckInRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QueueDTO.Response queue = queueService.checkIn(request.getAppointmentId(), userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Patient checked in successfully", queue));
    }

    /**
     * POST /api/queues/call-next — Doctor calls the next waiting patient.
     * DOCTOR only.
     */
    @PostMapping("/call-next")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> callNext(
            @Valid @RequestBody QueueDTO.CallNextRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QueueDTO.Response queue = queueService.callNext(request.getDoctorId(), userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Next patient called", queue));
    }

    /**
     * POST /api/queues/start — Doctor starts consultation (CALLED → IN_CONSULTATION).
     * DOCTOR only.
     */
    @PostMapping("/start")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> startConsultation(
            @Valid @RequestBody QueueDTO.QueueActionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QueueDTO.Response queue = queueService.startConsultation(request.getQueueId(), userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Consultation started", queue));
    }

    /**
     * POST /api/queues/complete — Doctor completes consultation (IN_CONSULTATION → COMPLETED).
     * DOCTOR only.
     */
    @PostMapping("/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> completeConsultation(
            @Valid @RequestBody QueueDTO.QueueActionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QueueDTO.Response queue = queueService.completeConsultation(request.getQueueId(), userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Consultation completed", queue));
    }

    /**
     * POST /api/queues/skip — Doctor or Receptionist skips a patient.
     * DOCTOR + RECEPTIONIST + ADMIN.
     */
    @PostMapping("/skip")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> skip(
            @Valid @RequestBody QueueDTO.QueueActionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QueueDTO.Response queue = queueService.skip(request.getQueueId(), userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Patient skipped", queue));
    }

    /**
     * POST /api/queues/no-show — Mark patient as no-show.
     * DOCTOR + RECEPTIONIST + ADMIN.
     */
    @PostMapping("/no-show")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> noShow(
            @Valid @RequestBody QueueDTO.QueueActionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QueueDTO.Response queue = queueService.noShow(request.getQueueId(), userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Patient marked as no-show", queue));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/queues/patient/me — Active queue status for the currently logged-in patient.
     * PATIENT only.
     */
    @GetMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<QueueDTO.Response>> getMyQueueStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Patient patient = patientRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new com.hospital.smart.exception.ResourceNotFoundException(
                        "Patient", "userId", userDetails.getId()));
        QueueDTO.Response queue = queueService.getActiveByPatient(patient.getId());
        if (queue == null) {
            return ResponseEntity.ok(ApiResponse.success("No active queue entry today", null));
        }
        return ResponseEntity.ok(ApiResponse.success("Queue status retrieved", queue));
    }

    /**
     * GET /api/queues/doctor/me — Today's queue for the currently logged-in doctor.
     * DOCTOR only.
     */
    @GetMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<QueueDTO.Response>>> getMyDoctorQueue(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Doctor doctor = doctorRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new com.hospital.smart.exception.ResourceNotFoundException(
                        "Doctor", "userId", userDetails.getId()));
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<QueueDTO.Response> queue = queueService.getByDoctor(doctor.getId(), targetDate);
        return ResponseEntity.ok(ApiResponse.success("Doctor queue retrieved", queue));
    }

    /**
     * GET /api/queues/today — All queues for today across all doctors. ADMIN only.
     */
    @GetMapping("/today")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<QueueDTO.Response>>> getAllToday(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<QueueDTO.Response> all = queueService.getAllByDate(targetDate);
        return ResponseEntity.ok(ApiResponse.success("All queues retrieved", all));
    }

    /**
     * GET /api/queues/patient/{patientId} — Queue entries for a specific patient (Receptionist/Admin).
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<QueueDTO.Response>>> getByPatient(
            @PathVariable String patientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        try {
            QueueDTO.Response queue = queueService.getByPatient(patientId, targetDate);
            return ResponseEntity.ok(ApiResponse.success("Queue retrieved", List.of(queue)));
        } catch (com.hospital.smart.exception.ResourceNotFoundException e) {
            return ResponseEntity.ok(ApiResponse.success("No queue entry found", List.of()));
        }
    }

    /**
     * GET /api/queues/{doctorId} — Queue for a doctor (today by default). Receptionist/Admin/Doctor.
     */
    @GetMapping("/{doctorId}")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<QueueDTO.Response>>> getByDoctor(
            @PathVariable String doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<QueueDTO.Response> queue = (date != null)
                ? queueService.getByDoctor(doctorId, date)
                : queueService.getByDoctorToday(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Queue retrieved", queue));
    }
}
