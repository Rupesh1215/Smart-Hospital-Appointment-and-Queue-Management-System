package com.hospital.smart.repository;

import com.hospital.smart.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    List<Feedback> findByDoctorIdOrderByCreatedAtDesc(String doctorId);

    List<Feedback> findByPatientId(String patientId);

    Optional<Feedback> findByAppointmentId(String appointmentId);

    boolean existsByAppointmentId(String appointmentId);

    List<Feedback> findByAppointmentIdIn(List<String> appointmentIds);
}
