package com.hospital.smart.repository;

import com.hospital.smart.model.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {

    List<Department> findByIsActiveTrue();

    Optional<Department> findByName(String name);

    boolean existsByName(String name);
}
