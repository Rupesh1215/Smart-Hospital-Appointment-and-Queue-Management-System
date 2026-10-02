package com.hospital.smart.repository;

import com.hospital.smart.model.DoctorSlotConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DoctorSlotConfigRepository extends MongoRepository<DoctorSlotConfig, String> {

    Optional<DoctorSlotConfig> findByDoctorIdAndDate(String doctorId, LocalDate date);
}
