package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.model.Patient;
import com.hospital.smart.security.CustomUserDetails;
import com.hospital.smart.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    /**
     * GET /api/patients — List all patients (admin/receptionist only).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<Patient>>> getAll() {
        List<Patient> patients = patientService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved", patients));
    }

    /**
     * GET /api/patients/me — Get the authenticated patient's profile.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Patient>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Patient patient = patientService.getByUserId(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Patient profile retrieved", patient));
    }

    /**
     * PUT /api/patients/me — Update the authenticated patient's profile.
     */
    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Patient>> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Patient updateData) {
        Patient patient = patientService.getByUserId(userDetails.getId());
        Patient updated = patientService.update(patient.getId(), updateData);
        return ResponseEntity.ok(ApiResponse.success("Patient profile updated", updated));
    }

    /**
     * GET /api/patients/{id} — Get patient by ID (admin/receptionist only).
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Patient>> getById(@PathVariable String id) {
        Patient patient = patientService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Patient retrieved", patient));
    }

    /**
     * PUT /api/patients/{id} — Update a patient (admin/receptionist only).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Patient>> update(@PathVariable String id,
                                                        @RequestBody Patient updateData) {
        Patient updated = patientService.update(id, updateData);
        return ResponseEntity.ok(ApiResponse.success("Patient updated", updated));
    }

    /**
     * DELETE /api/patients/{id} — Delete a patient (admin only).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        patientService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted", null));
    }
}
