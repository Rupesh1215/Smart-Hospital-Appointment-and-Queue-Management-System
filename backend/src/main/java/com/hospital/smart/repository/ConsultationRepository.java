package com.hospital.smart.repository;

import com.hospital.smart.model.Consultation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationRepository extends MongoRepository<Consultation, String> {

    Optional<Consultation> findByAppointmentId(String appointmentId);

    List<Consultation> findByDoctorId(String doctorId);

    List<Consultation> findByPatientId(String patientId);

    List<Consultation> findByDoctorIdAndPatientId(String doctorId, String patientId);
}
