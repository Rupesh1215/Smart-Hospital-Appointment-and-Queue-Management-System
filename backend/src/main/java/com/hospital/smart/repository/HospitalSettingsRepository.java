package com.hospital.smart.repository;

import com.hospital.smart.model.HospitalSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalSettingsRepository extends MongoRepository<HospitalSettings, String> {

    /** Single-document pattern — retrieves the one settings document */
    Optional<HospitalSettings> findFirstByOrderByIdAsc();
}
