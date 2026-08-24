package com.hospital.smart.service;

import com.hospital.smart.model.Appointment;
import com.hospital.smart.model.Doctor;
import com.hospital.smart.model.enums.AppointmentStatus;
import com.hospital.smart.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    public AnalyticsData getDashboardAnalytics() {
        long totalUsers = userRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalPatients = patientRepository.count();
        long totalAppointments = appointmentRepository.count();

        List<Appointment> allAppointments = appointmentRepository.findAll();

        long completedAppointments = allAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .count();

        long pendingAppointments = allAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING || a.getStatus() == AppointmentStatus.CONFIRMED)
                .count();

        long cancelledAppointments = allAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                .count();

        // Calculate estimated revenue
        double estimatedRevenue = 0.0;
        List<Doctor> doctors = doctorRepository.findAll();
        Map<String, Double> doctorFeeMap = new HashMap<>();
        for (Doctor d : doctors) {
            doctorFeeMap.put(d.getId(), d.getConsultationFee());
        }

        for (Appointment a : allAppointments) {
            if (a.getStatus() == AppointmentStatus.COMPLETED) {
                estimatedRevenue += doctorFeeMap.getOrDefault(a.getDoctorId(), 50.0);
            }
        }

        // Department distribution
        Map<String, Integer> departmentStats = new HashMap<>();
        for (Appointment a : allAppointments) {
            String deptId = a.getDepartmentId();
            String dept = deptId != null ? departmentRepository.findById(deptId).map(d -> d.getName()).orElse("General") : "General";
            departmentStats.put(dept, departmentStats.getOrDefault(dept, 0) + 1);
        }

        return AnalyticsData.builder()
                .totalUsers(totalUsers)
                .totalDoctors(totalDoctors)
                .totalDepartments(totalDepartments)
                .totalPatients(totalPatients)
                .totalAppointments(totalAppointments)
                .completedAppointments(completedAppointments)
                .pendingAppointments(pendingAppointments)
                .cancelledAppointments(cancelledAppointments)
                .estimatedRevenue(estimatedRevenue)
                .departmentDistribution(departmentStats)
                .build();
    }

    @Data
    @Builder
    public static class AnalyticsData {
        private long totalUsers;
        private long totalDoctors;
        private long totalDepartments;
        private long totalPatients;
        private long totalAppointments;
        private long completedAppointments;
        private long pendingAppointments;
        private long cancelledAppointments;
        private double estimatedRevenue;
        private Map<String, Integer> departmentDistribution;
    }
}
