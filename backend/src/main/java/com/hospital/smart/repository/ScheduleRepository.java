package com.hospital.smart.repository;

import com.hospital.smart.model.Schedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends MongoRepository<Schedule, String> {

    Optional<Schedule> findByDoctorIdAndDate(String doctorId, LocalDate date);

    List<Schedule> findByDoctorIdAndDateBetween(String doctorId, LocalDate start, LocalDate end);

    List<Schedule> findByDoctorId(String doctorId);

    List<Schedule> findByDate(LocalDate date);
}
