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

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalTime getWorkingHoursStart() { return workingHoursStart; }
    public void setWorkingHoursStart(LocalTime workingHoursStart) { this.workingHoursStart = workingHoursStart; }
    public LocalTime getWorkingHoursEnd() { return workingHoursEnd; }
    public void setWorkingHoursEnd(LocalTime workingHoursEnd) { this.workingHoursEnd = workingHoursEnd; }
    public List<String> getWorkingDays() { return workingDays; }
    public void setWorkingDays(List<String> workingDays) { this.workingDays = workingDays; }
    public List<String> getHolidays() { return holidays; }
    public void setHolidays(List<String> holidays) { this.holidays = holidays; }
    public int getDefaultConsultationDuration() { return defaultConsultationDuration; }
    public void setDefaultConsultationDuration(int defaultConsultationDuration) { this.defaultConsultationDuration = defaultConsultationDuration; }
    public int getMaxAdvanceBookingDays() { return maxAdvanceBookingDays; }
    public void setMaxAdvanceBookingDays(int maxAdvanceBookingDays) { this.maxAdvanceBookingDays = maxAdvanceBookingDays; }
    public boolean isAllowPatientCancellation() { return allowPatientCancellation; }
    public void setAllowPatientCancellation(boolean allowPatientCancellation) { this.allowPatientCancellation = allowPatientCancellation; }
    public int getCancellationWindowHours() { return cancellationWindowHours; }
    public void setCancellationWindowHours(int cancellationWindowHours) { this.cancellationWindowHours = cancellationWindowHours; }
    public boolean isChatbotEnabled() { return chatbotEnabled; }
    public void setChatbotEnabled(boolean chatbotEnabled) { this.chatbotEnabled = chatbotEnabled; }
    public int getMaxPatientsPerSlot() { return maxPatientsPerSlot; }
    public void setMaxPatientsPerSlot(int maxPatientsPerSlot) { this.maxPatientsPerSlot = maxPatientsPerSlot; }
    public int getDefaultSlotDurationMinutes() { return defaultSlotDurationMinutes; }
    public void setDefaultSlotDurationMinutes(int defaultSlotDurationMinutes) { this.defaultSlotDurationMinutes = defaultSlotDurationMinutes; }
    public boolean isEmergencyQueueBypass() { return emergencyQueueBypass; }
    public void setEmergencyQueueBypass(boolean emergencyQueueBypass) { this.emergencyQueueBypass = emergencyQueueBypass; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
