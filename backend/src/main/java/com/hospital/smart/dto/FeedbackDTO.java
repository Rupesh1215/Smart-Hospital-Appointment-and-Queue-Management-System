package com.hospital.smart.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class FeedbackDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "Appointment ID is required")
        private String appointmentId;

        @NotBlank(message = "Doctor ID is required")
        private String doctorId;

        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating cannot exceed 5")
        private int rating;

        private String emoji;

        private String comment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        private String id;
        private String patientId;
        private String patientName;
        private String doctorId;
        private String doctorName;
        private String appointmentId;
        private int rating;
        private String emoji;
        private String comment;
        private LocalDateTime createdAt;
    }
}
