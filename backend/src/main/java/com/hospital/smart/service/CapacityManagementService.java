package com.hospital.smart.service;

import com.hospital.smart.exception.ResourceNotFoundException;
import com.hospital.smart.model.Appointment;
import com.hospital.smart.model.Doctor;
import com.hospital.smart.model.DoctorCapacityRequest;
import com.hospital.smart.model.DoctorSlotConfig;
import com.hospital.smart.model.enums.AppointmentStatus;
import com.hospital.smart.model.enums.BookingType;
import com.hospital.smart.repository.AppointmentRepository;
import com.hospital.smart.repository.DoctorCapacityRequestRepository;
import com.hospital.smart.repository.DoctorRepository;
import com.hospital.smart.repository.DoctorSlotConfigRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CapacityManagementService {

    private final DoctorRepository doctorRepository;
    private final DoctorSlotConfigRepository slotConfigRepository;
    private final DoctorCapacityRequestRepository requestRepository;
    private final AppointmentRepository appointmentRepository;

    public CapacityManagementService(DoctorRepository doctorRepository,
                                       DoctorSlotConfigRepository slotConfigRepository,
                                       DoctorCapacityRequestRepository requestRepository,
                                       AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.slotConfigRepository = slotConfigRepository;
        this.requestRepository = requestRepository;
        this.appointmentRepository = appointmentRepository;
    }

    /**
     * Get or create slot config for a doctor on a specific date.
     */
    public DoctorSlotConfig getOrCreateSlotConfig(String doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        return slotConfigRepository.findByDoctorIdAndDate(doctorId, date)
                .orElseGet(() -> {
                    int total = doctor.getMaxPatientsPerDay() > 0 ? doctor.getMaxPatientsPerDay() : 30;
                    int defaultOffline = 2; // User rule: default offline slot booking capacity is 2 per slot/window, total ~10
                    int offline = Math.min(10, total / 3);
                    if (offline < 2) offline = 2;
                    int online = total - offline;

                    DoctorSlotConfig config = DoctorSlotConfig.builder()
                            .doctorId(doctorId)
                            .date(date)
                            .totalCapacity(total)
                            .onlineLimit(online)
                            .offlineLimit(offline)
                            .build();
                    return slotConfigRepository.save(config);
                });
    }

    /**
     * Update slot allocation (onlineLimit and offlineLimit) for a doctor on a date.
     * Receptionist can adjust online/offline split without changing total doctor capacity per day.
     */
    public DoctorSlotConfig updateSlotAllocation(String doctorId, LocalDate date, int onlineLimit, int offlineLimit) {
        DoctorSlotConfig config = getOrCreateSlotConfig(doctorId, date);
        config.setOnlineLimit(onlineLimit);
        config.setOfflineLimit(offlineLimit);
        config.setTotalCapacity(onlineLimit + offlineLimit);
        return slotConfigRepository.save(config);
    }

    /**
     * Get real-time capacity and booking stats for a doctor on a date.
     */
    public Map<String, Object> getCapacityMetrics(String doctorId, LocalDate date) {
        DoctorSlotConfig config = getOrCreateSlotConfig(doctorId, date);

        List<AppointmentStatus> activeStatuses = Arrays.asList(
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.IN_QUEUE,
                AppointmentStatus.IN_CONSULTATION,
                AppointmentStatus.COMPLETED
        );

        List<Appointment> booked = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusIn(doctorId, date, activeStatuses);

        long onlineBooked = booked.stream()
                .filter(a -> a.getBookingType() == BookingType.ONLINE)
                .count();

        long offlineBooked = booked.stream()
                .filter(a -> a.getBookingType() == BookingType.OFFLINE || a.getBookingType() == BookingType.WALK_IN)
                .count();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("doctorId", doctorId);
        metrics.put("date", date);
        metrics.put("totalCapacity", config.getTotalCapacity());
        metrics.put("onlineLimit", config.getOnlineLimit());
        metrics.put("offlineLimit", config.getOfflineLimit());
        metrics.put("onlineBooked", onlineBooked);
        metrics.put("offlineBooked", offlineBooked);
        metrics.put("onlineSlotsRemaining", Math.max(0, config.getOnlineLimit() - onlineBooked));
        metrics.put("offlineSlotsRemaining", Math.max(0, config.getOfflineLimit() - offlineBooked));
        metrics.put("isFullyBooked", (onlineBooked + offlineBooked) >= config.getTotalCapacity());
        metrics.put("isOnlineFull", onlineBooked >= config.getOnlineLimit());
        metrics.put("isOfflineFull", offlineBooked >= config.getOfflineLimit());

        return metrics;
    }

    /**
     * Submit an extra capacity request from a doctor to the receptionist.
     */
    public DoctorCapacityRequest submitExtraCapacityRequest(String doctorId, LocalDate date, int extraSlots, String message) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        DoctorCapacityRequest req = DoctorCapacityRequest.builder()
                .doctorId(doctorId)
                .doctorName(doctor.getDoctorName())
                .departmentName(doctor.getSpecialization())
                .requestDate(date)
                .extraSlots(extraSlots)
                .message(message != null ? message : "Doctor willing to take extra appointments.")
                .status("PENDING")
                .build();

        return requestRepository.save(req);
    }

    /**
     * Get all doctor extra capacity requests for receptionist dashboard.
     */
    public List<DoctorCapacityRequest> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get capacity requests submitted by a specific doctor.
     */
    public List<DoctorCapacityRequest> getRequestsByDoctor(String doctorId) {
        return requestRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }

    /**
     * Receptionist approves a doctor's extra capacity request.
     * Automatically increases doctor's max capacity and offline/online limits.
     */
    public DoctorCapacityRequest approveRequest(String requestId) {
        DoctorCapacityRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorCapacityRequest", "id", requestId));

        req.setStatus("APPROVED");
        requestRepository.save(req);

        // Increase slot config for that date
        DoctorSlotConfig config = getOrCreateSlotConfig(req.getDoctorId(), req.getRequestDate());
        config.setTotalCapacity(config.getTotalCapacity() + req.getExtraSlots());
        config.setOfflineLimit(config.getOfflineLimit() + req.getExtraSlots());
        slotConfigRepository.save(config);

        // Also update doctor max patients per day
        Doctor doctor = doctorRepository.findById(req.getDoctorId()).orElse(null);
        if (doctor != null) {
            doctor.setMaxPatientsPerDay(doctor.getMaxPatientsPerDay() + req.getExtraSlots());
            doctorRepository.save(doctor);
        }

        return req;
    }

    /**
     * Receptionist rejects a doctor's extra capacity request.
     */
    public DoctorCapacityRequest rejectRequest(String requestId) {
        DoctorCapacityRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorCapacityRequest", "id", requestId));

        req.setStatus("REJECTED");
        return requestRepository.save(req);
    }
}
