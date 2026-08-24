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
@Document(collection = "chatMessages")
@CompoundIndexes({
    @CompoundIndex(name = "user_session_idx", def = "{'userId': 1, 'sessionId': 1, 'createdAt': 1}")
})
public class ChatMessage {

    @Id
    private String id;

    @Indexed
    private String userId;

    /** Groups messages into a conversation session */
    @Indexed
    private String sessionId;

    /** "USER" or "AI" */
    private String sender;

    private String message;

    /** If the AI triggered a backend action (e.g., booked an appointment) */
    private String actionType;

    /** Result of the backend action, if any */
    private String actionResult;

    @CreatedDate
    private LocalDateTime createdAt;
}
