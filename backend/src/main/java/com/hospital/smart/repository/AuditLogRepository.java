package com.hospital.smart.repository;

import com.hospital.smart.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    List<AuditLog> findByUserIdOrderByTimestampDesc(String userId);

    List<AuditLog> findByAction(String action);

    List<AuditLog> findByEntity(String entity);

    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
