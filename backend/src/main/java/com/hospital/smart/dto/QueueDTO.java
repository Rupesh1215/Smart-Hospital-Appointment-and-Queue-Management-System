package com.hospital.smart.dto;

import com.hospital.smart.model.enums.QueueStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

public class QueueDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckInRequest {

        @NotBlank(message = "Appointment ID is required")
        private String appointmentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CallNextRequest {

        @NotBlank(message = "Doctor ID is required")
        private String doctorId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueueActionRequest {

        @NotBlank(message = "Queue ID is required")
        private String queueId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        private String id;
        private String appointmentId;
        private String doctorId;
        private String doctorName;
        private String patientId;
        private String patientName;
        private LocalDate queueDate;
        private int queueNumber;
        private String status;
        private int estimatedWaitingTime;
        private String checkInTime;
        private String calledTime;
        private String consultationStartTime;
        private String consultationEndTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueueSummary {

        private String doctorId;
        private String doctorName;
        private LocalDate date;
        private int totalInQueue;
        private int currentNumber;
        private String currentPatientName;
        private int averageWaitMinutes;
        private List<Response> entries;
    }
}
