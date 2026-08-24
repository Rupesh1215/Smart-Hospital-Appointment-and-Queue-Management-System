package com.hospital.smart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
@CompoundIndexes({
    @CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "user_read_idx", def = "{'userId': 1, 'isRead': 1}")
})
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;

    private String message;

    /** e.g., APPOINTMENT_BOOKED, QUEUE_UPDATED, APPOINTMENT_REMINDER */
    private String type;

    /** Reference to related entity (appointmentId, queueId, etc.) */
    private String referenceId;

    @Builder.Default
    private boolean isRead = false;

    @CreatedDate
    private LocalDateTime createdAt;
}
