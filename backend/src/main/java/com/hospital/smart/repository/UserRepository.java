package com.hospital.smart.repository;

import com.hospital.smart.model.User;
import com.hospital.smart.model.enums.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    Optional<User> findByPhone(String phone);

    List<User> findByIsActiveTrue();

    List<User> findByRoleAndIsActiveTrue(Role role);
}
