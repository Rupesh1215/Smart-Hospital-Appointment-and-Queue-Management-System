package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.exception.ResourceNotFoundException;
import com.hospital.smart.model.AuditLog;
import com.hospital.smart.model.HospitalSettings;
import com.hospital.smart.model.User;
import com.hospital.smart.model.enums.Role;
import com.hospital.smart.repository.AuditLogRepository;
import com.hospital.smart.repository.HospitalSettingsRepository;
import com.hospital.smart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final HospitalSettingsRepository hospitalSettingsRepository;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(@PathVariable String id, @RequestParam Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setRole(role);
        User updated = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User role updated to " + role, updated));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<HospitalSettings>> getSettings() {
        HospitalSettings settings = hospitalSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> hospitalSettingsRepository.save(
                        HospitalSettings.builder()
                                .hospitalName("Smart Hospital")
                                .maxPatientsPerSlot(5)
                                .defaultSlotDurationMinutes(20)
                                .emergencyQueueBypass(true)
                                .build()
                ));
        return ResponseEntity.ok(ApiResponse.success("Settings retrieved", settings));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<HospitalSettings>> updateSettings(@RequestBody HospitalSettings settings) {
        HospitalSettings existing = hospitalSettingsRepository.findAll().stream()
                .findFirst()
                .orElse(settings);
        
        if (settings.getHospitalName() != null) existing.setHospitalName(settings.getHospitalName());
        if (settings.getMaxPatientsPerSlot() > 0) existing.setMaxPatientsPerSlot(settings.getMaxPatientsPerSlot());
        if (settings.getDefaultSlotDurationMinutes() > 0) existing.setDefaultSlotDurationMinutes(settings.getDefaultSlotDurationMinutes());
        existing.setEmergencyQueueBypass(settings.isEmergencyQueueBypass());

        HospitalSettings saved = hospitalSettingsRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success("Hospital settings updated", saved));
    }
}
