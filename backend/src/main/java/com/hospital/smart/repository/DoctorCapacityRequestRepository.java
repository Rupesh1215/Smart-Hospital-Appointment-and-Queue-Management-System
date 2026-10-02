package com.hospital.smart.repository;

import com.hospital.smart.model.DoctorCapacityRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorCapacityRequestRepository extends MongoRepository<DoctorCapacityRequest, String> {

    List<DoctorCapacityRequest> findByDoctorIdOrderByCreatedAtDesc(String doctorId);

    List<DoctorCapacityRequest> findByStatusOrderByCreatedAtDesc(String status);

    List<DoctorCapacityRequest> findAllByOrderByCreatedAtDesc();
}
