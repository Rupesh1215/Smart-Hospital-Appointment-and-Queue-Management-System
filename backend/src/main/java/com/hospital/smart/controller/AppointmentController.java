package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.dto.AppointmentDTO;
import com.hospital.smart.security.CustomUserDetails;
import com.hospital.smart.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    /**
     * POST /api/appointments — Book an appointment (patient or receptionist).
     */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT') or hasRole('RECEPTIONIST')")
    public ResponseEntity<ApiResponse<AppointmentDTO.Response>> book(
            @Valid @RequestBody AppointmentDTO.BookRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AppointmentDTO.Response apt = appointmentService.book(
                request, userDetails.getId(), userDetails.getRole());
        return ResponseEntity.ok(
                ApiResponse.success("Appointment booked", apt));
    }

    /**
     * GET /api/appointments — List appointments.
     * PATIENT: sees their own; DOCTOR: sees their own; ADMIN/RECEPTIONIST: sees all.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentDTO.Response>>> getAppointments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<AppointmentDTO.Response> appointments;
        String role = userDetails.getRole();

        if ("PATIENT".equals(role)) {
            appointments = appointmentService.getByPatientUserId(userDetails.getId());
        } else if ("DOCTOR".equals(role)) {
            if (doctorId != null && date != null) {
                appointments = appointmentService.getByDoctorAndDate(doctorId, date);
            } else if (doctorId != null) {
                appointments = appointmentService.getByDoctor(doctorId);
            } else {
                // Doctor viewing their own — will be enhanced when doctor profile lookup is added
                appointments = appointmentService.getAll();
            }
        } else {
            // ADMIN or RECEPTIONIST — can view all or filter
            if (doctorId != null && date != null) {
                appointments = appointmentService.getByDoctorAndDate(doctorId, date);
            } else if (doctorId != null) {
                appointments = appointmentService.getByDoctor(doctorId);
            } else {
                appointments = appointmentService.getAll();
            }
        }

        return ResponseEntity.ok(
                ApiResponse.success("Appointments retrieved", appointments));
    }

    /**
     * GET /api/appointments/{id} — Get appointment details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO.Response>> getById(@PathVariable String id) {
        AppointmentDTO.Response apt = appointmentService.getById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Appointment retrieved", apt));
    }

    /**
     * PUT /api/appointments/{id}/cancel — Cancel an appointment.
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDTO.Response>> cancel(
            @PathVariable String id,
            @RequestParam(required = false) String reason) {
        AppointmentDTO.Response apt = appointmentService.cancel(id, reason);
        return ResponseEntity.ok(
                ApiResponse.success("Appointment cancelled", apt));
    }

    /**
     * PUT /api/appointments/{id}/reschedule — Reschedule an appointment.
     */
    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('PATIENT') or hasRole('RECEPTIONIST')")
    public ResponseEntity<ApiResponse<AppointmentDTO.Response>> reschedule(
            @PathVariable String id,
            @Valid @RequestBody AppointmentDTO.RescheduleRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AppointmentDTO.Response apt = appointmentService.reschedule(
                id, request, userDetails.getId(), userDetails.getRole());
        return ResponseEntity.ok(
                ApiResponse.success("Appointment rescheduled", apt));
    }

    /**
     * DELETE /api/appointments/{id} — Cancel an appointment (used by frontend).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO.Response>> deleteCancel(@PathVariable String id) {
        AppointmentDTO.Response apt = appointmentService.cancel(id, null);
        return ResponseEntity.ok(
                ApiResponse.success("Appointment cancelled", apt));
    }

    /**
     * PUT /api/appointments/{id} — Update an appointment.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('RECEPTIONIST') or hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentDTO.Response>> update(
            @PathVariable String id,
            @Valid @RequestBody AppointmentDTO.StatusUpdateRequest request) {
        AppointmentDTO.Response apt = appointmentService.updateStatus(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Appointment updated", apt));
    }

    /**
     * PUT /api/appointments/{id}/status — Update appointment status (doctor/receptionist).
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentDTO.Response>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody AppointmentDTO.StatusUpdateRequest request) {
        AppointmentDTO.Response apt = appointmentService.updateStatus(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Appointment status updated", apt));
    }
}
