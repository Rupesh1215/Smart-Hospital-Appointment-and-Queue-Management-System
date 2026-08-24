package com.hospital.smart.model;

import com.hospital.smart.model.enums.QueueStatus;
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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "queues")
@CompoundIndexes({
    @CompoundIndex(name = "doctor_date_status_idx", def = "{'doctorId': 1, 'queueDate': 1, 'status': 1}"),
    @CompoundIndex(name = "doctor_date_number_idx", def = "{'doctorId': 1, 'queueDate': 1, 'queueNumber': 1}")
})
public class Queue {

    @Id
    private String id;

    @Indexed
    private String appointmentId;

    @Indexed
    private String doctorId;

    @Indexed
    private String patientId;

    private LocalDate queueDate;

    private int queueNumber;

    @Indexed
    @Builder.Default
    private QueueStatus status = QueueStatus.WAITING;

    private LocalDateTime checkInTime;

    private LocalDateTime calledTime;

    private LocalDateTime consultationStartTime;

    private LocalDateTime consultationEndTime;

    /** Estimated waiting time in minutes */
    private int estimatedWaitingTime;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
