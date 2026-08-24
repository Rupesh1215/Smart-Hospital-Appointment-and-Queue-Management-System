package com.hospital.smart.repository;

import com.hospital.smart.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndIsReadFalse(String userId);

    long countByUserIdAndIsReadFalse(String userId);

    List<Notification> findByUserIdAndType(String userId, String type);
}
