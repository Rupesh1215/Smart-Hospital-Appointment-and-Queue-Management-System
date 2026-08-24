package com.hospital.smart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "consultations")
public class Consultation {

    @Id
    private String id;

    @Indexed
    private String appointmentId;

    @Indexed
    private String doctorId;

    @Indexed
    private String patientId;

    private String diagnosis;

    private String prescription;

    private String notes;

    /** Actual duration of the consultation in minutes */
    private int durationMinutes;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
