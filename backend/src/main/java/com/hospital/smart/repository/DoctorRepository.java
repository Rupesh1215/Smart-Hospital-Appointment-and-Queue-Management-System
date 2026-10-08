package com.hospital.smart.repository;

import com.hospital.smart.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {

    List<Doctor> findByDepartmentId(String departmentId);

    List<Doctor> findBySpecialization(String specialization);

    List<Doctor> findByIsAvailableTrue();

    List<Doctor> findByDepartmentIdAndIsAvailableTrue(String departmentId);

    Optional<Doctor> findByUserId(String userId);

    Optional<Doctor> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByDoctorNameIgnoreCase(String doctorName);

    boolean existsByUserId(String userId);
}
