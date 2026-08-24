package com.hospital.smart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctors")
@CompoundIndexes({
    @CompoundIndex(name = "dept_available_idx", def = "{'departmentId': 1, 'isAvailable': 1}")
})
public class Doctor {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String doctorName;

    @Indexed
    private String specialization;

    @Indexed
    private String departmentId;

    private String qualification;

    private int experience;

    private String phone;

    @Indexed(unique = true)
    private String email;

    private double consultationFee;

    /** Average consultation time in minutes */
    @Builder.Default
    private int averageConsultationTime = 20;

    /** e.g., ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] */
    private List<String> workingDays;

    /** Start of working hours */
    private LocalTime workingHoursStart;

    /** End of working hours */
    private LocalTime workingHoursEnd;

    /** Break start time (e.g., lunch break) */
    private LocalTime breakStart;

    /** Break end time */
    private LocalTime breakEnd;

    @Builder.Default
    private boolean isAvailable = true;

    /** Maximum patients per day */
    @Builder.Default
    private int maxPatientsPerDay = 30;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
