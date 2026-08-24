package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.model.Consultation;
import com.hospital.smart.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Consultation>> createOrUpdateConsultation(@RequestBody Consultation consultation) {
        Consultation saved = consultationService.createOrUpdateConsultation(consultation);
        return ResponseEntity.ok(ApiResponse.success("Consultation saved successfully", saved));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<Consultation>> getByAppointmentId(@PathVariable String appointmentId) {
        Consultation consultation = consultationService.getByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Consultation retrieved successfully", consultation));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<Consultation>>> getByPatientId(@PathVariable String patientId) {
        List<Consultation> list = consultationService.getByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient consultations retrieved", list));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Consultation>>> getByDoctorId(@PathVariable String doctorId) {
        List<Consultation> list = consultationService.getByDoctorId(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor consultations retrieved", list));
    }
}
