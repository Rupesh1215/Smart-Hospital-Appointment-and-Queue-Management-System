package com.hospital.smart.model;

import com.hospital.smart.model.enums.AppointmentStatus;
import com.hospital.smart.model.enums.BookingType;
import com.hospital.smart.model.enums.Priority;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
@CompoundIndexes({
    @CompoundIndex(name = "doctor_date_time_idx", def = "{'doctorId': 1, 'appointmentDate': 1, 'startTime': 1}"),
    @CompoundIndex(name = "patient_date_idx", def = "{'patientId': 1, 'appointmentDate': 1}"),
    @CompoundIndex(name = "doctor_date_status_idx", def = "{'doctorId': 1, 'appointmentDate': 1, 'status': 1}")
})
public class Appointment {

    @Id
    private String id;

    @Indexed(unique = true)
    private String appointmentNumber;

    @Indexed
    private String patientId;

    @Indexed
    private String doctorId;

    @Indexed
    private String departmentId;

    private LocalDate appointmentDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @Indexed
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Builder.Default
    private BookingType bookingType = BookingType.ONLINE;

    private String reason;

    private String notes;

    @Builder.Default
    private Priority priority = Priority.NORMAL;

    /** User ID of who created this appointment (patient, receptionist, or system) */
    private String createdBy;

    /** If rescheduled, reference to the original appointment */
    private String rescheduledFrom;

    /** Cancellation reason */
    private String cancellationReason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
