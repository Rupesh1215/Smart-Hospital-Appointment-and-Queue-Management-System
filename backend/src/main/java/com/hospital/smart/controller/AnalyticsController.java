package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<AnalyticsService.AnalyticsData>> getAnalytics() {
        AnalyticsService.AnalyticsData data = analyticsService.getDashboardAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved successfully", data));
    }
}
