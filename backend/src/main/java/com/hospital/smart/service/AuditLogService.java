package com.hospital.smart.service;

import com.hospital.smart.model.AuditLog;
import com.hospital.smart.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Log an audit entry.
     *
     * @param userId      ID of the user performing the action
     * @param action      Action type (e.g., LOGIN, APPOINTMENT_CREATED)
     * @param entity      Entity type (e.g., User, Appointment)
     * @param entityId    ID of the affected entity
     * @param description Human-readable description
     */
    public void log(String userId, String action, String entity,
                    String entityId, String description) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .action(action)
                    .entity(entity)
                    .entityId(entityId)
                    .description(description)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Audit logging should never break the main flow
            log.error("Failed to write audit log: {}", e.getMessage());
        }
    }

    /**
     * Convenience method for auth-related actions.
     */
    public void logAuth(String userId, String action, String description) {
        log(userId, action, "User", userId, description);
    }

    /**
     * Convenience method for appointment-related actions.
     */
    public void logAppointment(String userId, String action, String appointmentId, String description) {
        log(userId, action, "Appointment", appointmentId, description);
    }

    /**
     * Convenience method for admin actions.
     */
    public void logAdmin(String userId, String action, String entity,
                         String entityId, String description) {
        log(userId, action, entity, entityId, description);
    }
}
