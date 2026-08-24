package com.hospital.smart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "hospitalSettings")
public class HospitalSettings {

    @Id
    private String id;

    private String hospitalName;

    private String address;

    private String phone;

    private String email;

    /** Hospital working hours start */
    @Builder.Default
    private LocalTime workingHoursStart = LocalTime.of(8, 0);

    /** Hospital working hours end */
    @Builder.Default
    private LocalTime workingHoursEnd = LocalTime.of(20, 0);

    /** Days of operation, e.g., ["MONDAY", "TUESDAY", ...] */
    private List<String> workingDays;

    /** Hospital holidays (dates stored as ISO strings for flexibility) */
    private List<String> holidays;

    /** Default consultation duration in minutes */
    @Builder.Default
    private int defaultConsultationDuration = 20;

    /** Maximum advance booking days */
    @Builder.Default
    private int maxAdvanceBookingDays = 30;

    /** Allow patient self-cancellation */
    @Builder.Default
    private boolean allowPatientCancellation = true;

    /** Minimum hours before appointment to allow cancellation */
    @Builder.Default
    private int cancellationWindowHours = 2;

    /** Chatbot enabled */
    @Builder.Default
    private boolean chatbotEnabled = true;

    /** Maximum patients per slot */
    @Builder.Default
    private int maxPatientsPerSlot = 5;

    /** Default slot duration in minutes */
    @Builder.Default
    private int defaultSlotDurationMinutes = 20;

    /** Emergency queue bypass enabled */
    @Builder.Default
    private boolean emergencyQueueBypass = true;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
