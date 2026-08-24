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

    Optional<Queue> findByPatientIdAndQueueDate(String patientId, LocalDate date);

    Optional<Queue> findByAppointmentId(String appointmentId);

    long countByDoctorIdAndQueueDate(String doctorId, LocalDate date);

    List<Queue> findByDoctorIdAndQueueDateAndStatusIn(
            String doctorId, LocalDate date, List<QueueStatus> statuses);
}
