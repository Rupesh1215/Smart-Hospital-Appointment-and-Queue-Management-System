package com.hospital.smart.controller;

import com.hospital.smart.dto.ApiResponse;
import com.hospital.smart.dto.AppointmentDTO;
import com.hospital.smart.dto.FeedbackDTO;
import com.hospital.smart.security.CustomUserDetails;
import com.hospital.smart.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /**
     * POST /api/feedbacks — Submit feedback for a completed consultation.
     */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<FeedbackDTO.Response>> submitFeedback(
            @Valid @RequestBody FeedbackDTO.CreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        FeedbackDTO.Response response = feedbackService.submitFeedback(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", response));
    }

    /**
     * GET /api/feedbacks/pending — Get completed appointments eligible for feedback.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<AppointmentDTO.Response>>> getPendingFeedback(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<AppointmentDTO.Response> pending = feedbackService.getPendingFeedbackAppointments(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Pending feedback appointments retrieved", pending));
    }

    /**
     * GET /api/feedbacks/doctor/{doctorId} — Get all feedback entries for a specific doctor.
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<FeedbackDTO.Response>>> getDoctorFeedback(
            @PathVariable String doctorId) {
        List<FeedbackDTO.Response> feedbacks = feedbackService.getDoctorFeedback(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor feedback retrieved", feedbacks));
    }
}
