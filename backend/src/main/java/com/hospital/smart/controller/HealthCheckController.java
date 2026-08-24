package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthCheckController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("application", "Smart Hospital Appointment Management System");
        healthData.put("version", "1.0.0");

        return ResponseEntity.ok(ApiResponse.success("Smart Hospital API is running", healthData));
    }
}
