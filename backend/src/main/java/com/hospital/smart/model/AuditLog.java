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
@Document(collection = "auditLogs")
@CompoundIndexes({
    @CompoundIndex(name = "user_timestamp_idx", def = "{'userId': 1, 'timestamp': -1}"),
    @CompoundIndex(name = "action_timestamp_idx", def = "{'action': 1, 'timestamp': -1}")
})
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String userId;

    /** e.g., LOGIN, LOGOUT, APPOINTMENT_CREATED, APPOINTMENT_CANCELLED, QUEUE_UPDATED */
    @Indexed
    private String action;

    /** e.g., "Appointment", "User", "Queue" */
    private String entity;

    /** ID of the affected entity */
    private String entityId;

    private String description;

    private String ipAddress;

    /** Additional metadata as JSON string */
    private String metadata;

    @CreatedDate
    private LocalDateTime timestamp;
}
