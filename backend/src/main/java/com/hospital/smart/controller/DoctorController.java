package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.dto.DoctorDTO;
import com.hospital.smart.security.CustomUserDetails;
import com.hospital.smart.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    /**
     * GET /api/doctors — List doctors (optionally by department). Public.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDTO.Response>>> getAll(
            @RequestParam(required = false) String departmentId) {
        List<DoctorDTO.Response> doctors = doctorService.getAll(departmentId);
        return ResponseEntity.ok(
                ApiResponse.success("Doctors retrieved", doctors));
    }

    /**
     * GET /api/doctors/available — List available doctors. Public.
     */
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<DoctorDTO.Response>>> getAvailable() {
        List<DoctorDTO.Response> doctors = doctorService.getAvailable();
        return ResponseEntity.ok(
                ApiResponse.success("Available doctors retrieved", doctors));
    }

    /**
     * GET /api/doctors/{id} — Get doctor details. Public.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO.Response>> getById(@PathVariable String id) {
        DoctorDTO.Response doctor = doctorService.getById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Doctor retrieved", doctor));
    }

    /**
     * GET /api/doctors/{id}/slots — Get available time slots for a date. Public.
     */
    @GetMapping("/{id}/slots")
    public ResponseEntity<ApiResponse<List<DoctorDTO.SlotResponse>>> getSlots(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<DoctorDTO.SlotResponse> slots = doctorService.getAvailableSlots(id, date);
        return ResponseEntity.ok(
                ApiResponse.success("Slots retrieved", slots));
    }

    /**
     * GET /api/doctors/me — Get the authenticated doctor's own profile.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorDTO.Response>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DoctorDTO.Response doctor = doctorService.getByUserId(userDetails.getId());
        return ResponseEntity.ok(
                ApiResponse.success("Doctor profile retrieved", doctor));
    }

    /**
     * POST /api/doctors — Create a doctor (admin only).
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorDTO.Response>> create(
            @Valid @RequestBody DoctorDTO.CreateRequest request) {
        DoctorDTO.Response doctor = doctorService.create(request);
        return ResponseEntity.ok(
                ApiResponse.success("Doctor created", doctor));
    }

    /**
     * PUT /api/doctors/{id} — Update a doctor (admin or the doctor themselves).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorDTO.Response>> update(
            @PathVariable String id,
            @Valid @RequestBody DoctorDTO.UpdateRequest request) {
        DoctorDTO.Response doctor = doctorService.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Doctor updated", doctor));
    }

    /**
     * PATCH /api/doctors/{id}/availability — Toggle availability.
     */
    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorDTO.Response>> toggleAvailability(
            @PathVariable String id) {
        DoctorDTO.Response doctor = doctorService.toggleAvailability(id);
        return ResponseEntity.ok(
                ApiResponse.success("Availability toggled", doctor));
    }
}
