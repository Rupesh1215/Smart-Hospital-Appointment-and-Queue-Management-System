package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.model.DoctorCapacityRequest;
import com.hospital.smart.model.DoctorSlotConfig;
import com.hospital.smart.service.CapacityManagementService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/capacity")
public class CapacityManagementController {

    private final CapacityManagementService capacityService;

    public CapacityManagementController(CapacityManagementService capacityService) {
        this.capacityService = capacityService;
    }

    /**
     * GET /api/capacity/doctor/{doctorId} — Get slot capacity metrics for doctor & date.
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCapacity(
            @PathVariable String doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        Map<String, Object> metrics = capacityService.getCapacityMetrics(doctorId, targetDate);
        return ResponseEntity.ok(ApiResponse.success("Capacity metrics retrieved", metrics));
    }

    /**
     * PUT /api/capacity/doctor/{doctorId} — Update online & offline slot allocations (Receptionist).
     */
    @PutMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorSlotConfig>> updateSlotAllocation(
            @PathVariable String doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam int onlineLimit,
            @RequestParam int offlineLimit) {
        DoctorSlotConfig config = capacityService.updateSlotAllocation(doctorId, date, onlineLimit, offlineLimit);
        return ResponseEntity.ok(ApiResponse.success("Slot allocation updated", config));
    }

    /**
     * POST /api/capacity/request — Submit extra capacity notification request (Doctor).
     */
    @PostMapping("/request")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorCapacityRequest>> submitRequest(
            @RequestParam String doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam int extraSlots,
            @RequestParam(required = false) String message) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        DoctorCapacityRequest req = capacityService.submitExtraCapacityRequest(doctorId, targetDate, extraSlots, message);
        return ResponseEntity.ok(ApiResponse.success("Extra capacity request sent to receptionist", req));
    }

    /**
     * GET /api/capacity/requests — Get all doctor capacity requests (Receptionist / Admin).
     */
    @GetMapping("/requests")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<DoctorCapacityRequest>>> getRequests(
            @RequestParam(required = false) String doctorId) {
        List<DoctorCapacityRequest> list = (doctorId != null && !doctorId.isBlank())
                ? capacityService.getRequestsByDoctor(doctorId)
                : capacityService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success("Requests retrieved", list));
    }

    /**
     * PUT /api/capacity/requests/{id}/approve — Receptionist approves extra capacity.
     */
    @PutMapping("/requests/{id}/approve")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorCapacityRequest>> approveRequest(@PathVariable String id) {
        DoctorCapacityRequest req = capacityService.approveRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request approved and capacity updated", req));
    }

    /**
     * PUT /api/capacity/requests/{id}/reject — Receptionist rejects extra capacity.
     */
    @PutMapping("/requests/{id}/reject")
    @PreAuthorize("hasRole('RECEPTIONIST') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorCapacityRequest>> rejectRequest(@PathVariable String id) {
        DoctorCapacityRequest req = capacityService.rejectRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request rejected", req));
    }
}
