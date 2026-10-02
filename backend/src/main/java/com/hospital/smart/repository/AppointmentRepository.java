package com.hospital.smart.repository;

import com.hospital.smart.model.Appointment;
import com.hospital.smart.model.enums.AppointmentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByPatientId(String patientId);

    List<Appointment> findByDoctorId(String doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDate(String doctorId, LocalDate date);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusIn(
            String doctorId, LocalDate date, List<AppointmentStatus> statuses);

    List<Appointment> findByPatientIdAndAppointmentDateGreaterThanEqual(
            String patientId, LocalDate date);

    List<Appointment> findByPatientIdOrderByAppointmentDateDescStartTimeDesc(String patientId);

    List<Appointment> findByPatientIdAndStatusOrderByAppointmentDateDesc(String patientId, AppointmentStatus status);

    List<Appointment> findByPatientIdAndAppointmentDate(String patientId, LocalDate date);

    long countByDoctorIdAndAppointmentDateAndStatusIn(
            String doctorId, LocalDate date, List<AppointmentStatus> statuses);

    Optional<Appointment> findByAppointmentNumber(String appointmentNumber);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatus(
            String doctorId, LocalDate date, AppointmentStatus status);

    List<Appointment> findByAppointmentDateAndStatus(LocalDate date, AppointmentStatus status);

    long countByAppointmentDate(LocalDate appointmentDate);
}
