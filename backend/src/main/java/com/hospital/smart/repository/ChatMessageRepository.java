package com.hospital.smart.repository;

import com.hospital.smart.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByUserIdAndSessionIdOrderByCreatedAtAsc(String userId, String sessionId);

    List<ChatMessage> findByUserId(String userId);

    List<ChatMessage> findBySessionId(String sessionId);
}
