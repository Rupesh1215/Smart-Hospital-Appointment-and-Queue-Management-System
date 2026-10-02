package com.hospital.smart.dto;

import com.hospital.smart.model.enums.AppointmentStatus;
import com.hospital.smart.model.enums.BookingType;
import com.hospital.smart.model.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookRequest {

        @NotBlank(message = "Doctor ID is required")
        private String doctorId;

        private String departmentId;

        @NotNull(message = "Appointment date is required")
        private LocalDate appointmentDate;

        @NotNull(message = "Start time is required")
        private LocalTime startTime;

        private String reason;
        private String notes;

        @Builder.Default
        private Priority priority = Priority.NORMAL;

        @Builder.Default
        private BookingType bookingType = BookingType.ONLINE;

        /** Optional — for receptionist booking on behalf of a patient */
        private String patientId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RescheduleRequest {

        @NotNull(message = "New date is required")
        private LocalDate newDate;

        @NotNull(message = "New start time is required")
        private LocalTime newStartTime;

        private String newDoctorId;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {

        @NotNull(message = "Status is required")
        private AppointmentStatus status;

        private String notes;
        private String cancellationReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        private String id;
        private String appointmentNumber;
        private String patientId;
        private String patientName;
        private String doctorId;
        private String doctorName;
        private String departmentId;
        private String departmentName;
        private LocalDate appointmentDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String status;
        private String bookingType;
        private String reason;
        private String notes;
        private String priority;
        private String createdBy;
        private String cancellationReason;
        private String createdAt;
        private String updatedAt;
    }
}
