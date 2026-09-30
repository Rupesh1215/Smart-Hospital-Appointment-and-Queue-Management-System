package com.hospital.smart.repository;

import com.hospital.smart.model.Queue;
import com.hospital.smart.model.enums.QueueStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueRepository extends MongoRepository<Queue, String> {

    List<Queue> findByDoctorIdAndQueueDateOrderByQueueNumberAsc(String doctorId, LocalDate date);

    List<Queue> findByDoctorIdAndQueueDateAndStatus(
            String doctorId, LocalDate date, QueueStatus status);

    List<Queue> findByPatientIdAndQueueDate(String patientId, LocalDate date);

    List<Queue> findByPatientIdAndQueueDateOrderByQueueNumberDesc(String patientId, LocalDate date);

    Optional<Queue> findByAppointmentId(String appointmentId);

    long countByDoctorIdAndQueueDate(String doctorId, LocalDate date);

    List<Queue> findByDoctorIdAndQueueDateAndStatusIn(
            String doctorId, LocalDate date, List<QueueStatus> statuses);

    /** All queues for a specific date — used by admin monitoring */
    List<Queue> findByQueueDate(LocalDate date);

    /** Active queue entries for a patient (WAITING / CALLED / IN_CONSULTATION) */
    List<Queue> findByPatientIdAndQueueDateAndStatusIn(
            String patientId, LocalDate date, List<QueueStatus> statuses);
}
