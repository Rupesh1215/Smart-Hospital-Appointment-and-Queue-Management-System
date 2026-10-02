package com.hospital.smart.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

public class DoctorDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "Doctor name is required")
        private String doctorName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Specialization is required")
        private String specialization;

        @NotBlank(message = "Department ID is required")
        private String departmentId;

        private String qualification;
        private int experience;
        private String phone;
        private double consultationFee;
        private int averageConsultationTime;
        private List<String> workingDays;
        private LocalTime workingHoursStart;
        private LocalTime workingHoursEnd;
        private LocalTime breakStart;
        private LocalTime breakEnd;
        private int maxPatientsPerDay;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        private String doctorName;
        private String specialization;
        private String departmentId;
        private String qualification;
        private Integer experience;
        private String phone;
        private Double consultationFee;
        private Integer averageConsultationTime;
        private List<String> workingDays;
        private LocalTime workingHoursStart;
        private LocalTime workingHoursEnd;
        private LocalTime breakStart;
        private LocalTime breakEnd;
        private Integer maxPatientsPerDay;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        private String id;
        private String userId;
        private String doctorName;
        private String specialization;
        private String departmentId;
        private String departmentName;
        private String qualification;
        private int experience;
        private String phone;
        private String email;
        private double consultationFee;
        private int averageConsultationTime;
        private List<String> workingDays;
        private LocalTime workingHoursStart;
        private LocalTime workingHoursEnd;
        private LocalTime breakStart;
        private LocalTime breakEnd;
        private boolean isAvailable;
        private int maxPatientsPerDay;
        private double rating;
        private int totalRatings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlotResponse {

        private LocalTime startTime;
        private LocalTime endTime;
        private boolean isAvailable;
    }
}
