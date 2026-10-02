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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctor_capacity_requests")
public class DoctorCapacityRequest {

    @Id
    private String id;

    @Indexed
    private String doctorId;

    private String doctorName;

    private String departmentName;

    private LocalDate requestDate;

    private int extraSlots;

    private String message;

    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
