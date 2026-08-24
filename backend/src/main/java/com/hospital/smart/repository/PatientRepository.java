package com.hospital.smart.repository;

import com.hospital.smart.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {

    Optional<Patient> findByUserId(String userId);

    Optional<Patient> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUserId(String userId);
}
