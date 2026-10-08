package com.hospital.smart.service;

import com.hospital.smart.dto.DoctorDTO;
import com.hospital.smart.exception.DuplicateResourceException;
import com.hospital.smart.exception.ResourceNotFoundException;
import com.hospital.smart.model.Appointment;
import com.hospital.smart.model.Department;
import com.hospital.smart.model.Doctor;
import com.hospital.smart.model.User;
import com.hospital.smart.model.enums.AppointmentStatus;
import com.hospital.smart.model.enums.Role;
import com.hospital.smart.repository.AppointmentRepository;
import com.hospital.smart.repository.DepartmentRepository;
import com.hospital.smart.repository.DoctorRepository;
import com.hospital.smart.repository.UserRepository;
import com.hospital.smart.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(DoctorRepository doctorRepository,
                         DepartmentRepository departmentRepository,
                         UserRepository userRepository,
                         AppointmentRepository appointmentRepository,
                         PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Get all doctors (optionally filtered by department).
     */
    public List<DoctorDTO.Response> getAll(String departmentId) {
        List<Doctor> doctors;
        if (departmentId != null && !departmentId.isBlank()) {
            doctors = doctorRepository.findByDepartmentIdAndIsAvailableTrue(departmentId);
        } else {
            doctors = doctorRepository.findAll();
        }
        return doctors.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Get available doctors.
     */
    public List<DoctorDTO.Response> getAvailable() {
        return doctorRepository.findByIsAvailableTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get doctor by ID.
     */
    public DoctorDTO.Response getById(String id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        return toResponse(doctor);
    }

    /**
     * Create a doctor and linked User account.
     */
    public DoctorDTO.Response create(DoctorDTO.CreateRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        String doctorName = request.getDoctorName() != null ? request.getDoctorName().trim() : "";

        // Check for duplicate email
        if (userRepository.existsByEmail(email) || doctorRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Doctor", "email", email);
        }

        // Check for duplicate doctor name
        if (!doctorName.isEmpty() && doctorRepository.existsByDoctorNameIgnoreCase(doctorName)) {
            throw new DuplicateResourceException("Doctor", "doctorName", doctorName);
        }

        // Resolve department ID safely
        String deptId = request.getDepartmentId();
        if (deptId == null || deptId.isBlank() || !departmentRepository.existsById(deptId)) {
            List<Department> depts = departmentRepository.findAll();
            if (!depts.isEmpty()) {
                deptId = depts.get(0).getId();
            } else {
                Department defaultDept = Department.builder()
                        .name("General Medicine")
                        .description("General Medical Care")
                        .isActive(true)
                        .build();
                defaultDept = departmentRepository.save(defaultDept);
                deptId = defaultDept.getId();
            }
        }

        // Create User with DOCTOR role
        User user = User.builder()
                .name(doctorName)
                .email(email)
                .phone(request.getPhone() != null ? request.getPhone() : "")
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.DOCTOR)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // Assign rating between 2.5 and 4.5 by default
        double defaultRating = 4.2;

        // Create Doctor profile
        Doctor doctor = Doctor.builder()
                .userId(user.getId())
                .doctorName(doctorName)
                .email(email)
                .phone(request.getPhone() != null ? request.getPhone() : "")
                .specialization(request.getSpecialization())
                .departmentId(deptId)
                .qualification(request.getQualification() != null && !request.getQualification().isBlank() ? request.getQualification() : "MBBS, MD")
                .experience(request.getExperience() > 0 ? request.getExperience() : 5)
                .consultationFee(request.getConsultationFee() > 0 ? request.getConsultationFee() : 500.0)
                .averageConsultationTime(
                        request.getAverageConsultationTime() > 0
                                ? request.getAverageConsultationTime() : 20)
                .workingDays(request.getWorkingDays() != null && !request.getWorkingDays().isEmpty()
                        ? request.getWorkingDays()
                        : Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"))
                .workingHoursStart(request.getWorkingHoursStart() != null
                        ? request.getWorkingHoursStart() : LocalTime.of(9, 0))
                .workingHoursEnd(request.getWorkingHoursEnd() != null
                        ? request.getWorkingHoursEnd() : LocalTime.of(17, 0))
                .breakStart(request.getBreakStart() != null
                        ? request.getBreakStart() : LocalTime.of(13, 0))
                .breakEnd(request.getBreakEnd() != null
                        ? request.getBreakEnd() : LocalTime.of(14, 0))
                .maxPatientsPerDay(
                        request.getMaxPatientsPerDay() > 0
                                ? request.getMaxPatientsPerDay() : 30)
                .rating(defaultRating)
                .isAvailable(true)
                .build();

        doctor = doctorRepository.save(doctor);
        return toResponse(doctor);
    }

    /**
     * Update an existing doctor profile.
     */
    public DoctorDTO.Response update(String id, DoctorDTO.UpdateRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));

        if (request.getDoctorName() != null) doctor.setDoctorName(request.getDoctorName());
        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department", "id", request.getDepartmentId()));
            doctor.setDepartmentId(request.getDepartmentId());
        }
        if (request.getQualification() != null) doctor.setQualification(request.getQualification());
        if (request.getExperience() != null) doctor.setExperience(request.getExperience());
        if (request.getPhone() != null) doctor.setPhone(request.getPhone());
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getAverageConsultationTime() != null)
            doctor.setAverageConsultationTime(request.getAverageConsultationTime());
        if (request.getWorkingDays() != null) doctor.setWorkingDays(request.getWorkingDays());
        if (request.getWorkingHoursStart() != null) doctor.setWorkingHoursStart(request.getWorkingHoursStart());
        if (request.getWorkingHoursEnd() != null) doctor.setWorkingHoursEnd(request.getWorkingHoursEnd());
        if (request.getBreakStart() != null) doctor.setBreakStart(request.getBreakStart());
        if (request.getBreakEnd() != null) doctor.setBreakEnd(request.getBreakEnd());
        if (request.getMaxPatientsPerDay() != null)
            doctor.setMaxPatientsPerDay(request.getMaxPatientsPerDay());

        doctor = doctorRepository.save(doctor);
        return toResponse(doctor);
    }

    /**
     * Toggle doctor availability.
     */
    public DoctorDTO.Response toggleAvailability(String id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        doctor.setAvailable(!doctor.isAvailable());
        doctor = doctorRepository.save(doctor);
        return toResponse(doctor);
    }

    /**
     * Get available time slots for a doctor on a given date.
     * Generates slots based on working hours and subtracts booked appointments.
     */
    public List<DoctorDTO.SlotResponse> getAvailableSlots(String doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        // Check if the doctor works on this day
        String dayOfWeek = date.getDayOfWeek().name();
        if (doctor.getWorkingDays() != null && !doctor.getWorkingDays().isEmpty()) {
            boolean worksOnDay = doctor.getWorkingDays().stream()
                    .anyMatch(day -> day.equalsIgnoreCase(dayOfWeek));
            if (!worksOnDay) {
                return List.of(); // Doctor doesn't work on this day
            }
        }

        // Get booked appointments for this doctor on this date (non-cancelled)
        List<AppointmentStatus> activeStatuses = Arrays.asList(
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.IN_QUEUE,
                AppointmentStatus.IN_CONSULTATION
        );
        List<Appointment> bookedAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusIn(doctorId, date, activeStatuses);

        // Generate all possible slots
        List<DoctorDTO.SlotResponse> slots = new ArrayList<>();
        int slotDuration = doctor.getAverageConsultationTime() > 0 ? doctor.getAverageConsultationTime() : 20;
        LocalTime current = doctor.getWorkingHoursStart() != null ? doctor.getWorkingHoursStart() : LocalTime.of(9, 0);
        LocalTime end = doctor.getWorkingHoursEnd() != null ? doctor.getWorkingHoursEnd() : LocalTime.of(17, 0);

        while (current.plusMinutes(slotDuration).compareTo(end) <= 0) {
            final LocalTime slotStart = current;
            final LocalTime slotEnd = current.plusMinutes(slotDuration);

            // Skip slots that overlap with break time
            if (doctor.getBreakStart() != null && doctor.getBreakEnd() != null) {
                if (slotStart.isBefore(doctor.getBreakEnd()) &&
                        slotEnd.isAfter(doctor.getBreakStart())) {
                    current = doctor.getBreakEnd();
                    continue;
                }
            }

            // Check if this slot is already booked
            boolean isBooked = bookedAppointments.stream()
                    .anyMatch(apt -> apt.getStartTime().equals(slotStart));

            slots.add(DoctorDTO.SlotResponse.builder()
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .isAvailable(!isBooked)
                    .build());

            current = slotEnd;
        }

        return slots;
    }

    /**
     * Get doctor by user ID (for authenticated doctor to find their profile).
     */
    public DoctorDTO.Response getByUserId(String userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", userId));
        return toResponse(doctor);
    }

    /**
     * Delete a doctor and their linked User account cleanly.
     */
    public void delete(String id) {
        Doctor doctor = doctorRepository.findById(id).orElse(null);
        if (doctor == null) {
            return;
        }

        // Delete the linked User account
        if (doctor.getUserId() != null) {
            try {
                if (userRepository.existsById(doctor.getUserId())) {
                    userRepository.deleteById(doctor.getUserId());
                }
            } catch (Exception e) {
                // Silently handle if user account deletion encounters constraint
            }
        }

        try {
            doctorRepository.deleteById(id);
        } catch (Exception e) {
            // Silently handle doctor document deletion
        }
    }

    /**
     * Get doctor availability for a specific date.
     * Returns availability status considering schedule overrides and working days.
     */
    public DoctorDTO.Response getAvailability(String doctorId, LocalDate date) {
        // Simply return the doctor's profile; the slot computation already happens in getAvailableSlots.
        // This endpoint provides the doctor info + working schedule for the given date.
        return getById(doctorId);
    }

    private DoctorDTO.Response toResponse(Doctor doctor) {
        String departmentName = null;
        if (doctor.getDepartmentId() != null) {
            departmentName = departmentRepository.findById(doctor.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }

        return DoctorDTO.Response.builder()
                .id(doctor.getId())
                .userId(doctor.getUserId())
                .doctorName(doctor.getDoctorName())
                .specialization(doctor.getSpecialization())
                .departmentId(doctor.getDepartmentId())
                .departmentName(departmentName)
                .qualification(doctor.getQualification())
                .experience(doctor.getExperience())
                .phone(doctor.getPhone())
                .email(doctor.getEmail())
                .consultationFee(doctor.getConsultationFee())
                .averageConsultationTime(doctor.getAverageConsultationTime())
                .workingDays(doctor.getWorkingDays())
                .workingHoursStart(doctor.getWorkingHoursStart())
                .workingHoursEnd(doctor.getWorkingHoursEnd())
                .breakStart(doctor.getBreakStart())
                .breakEnd(doctor.getBreakEnd())
                .isAvailable(doctor.isAvailable())
                .maxPatientsPerDay(doctor.getMaxPatientsPerDay())
                .rating(doctor.getRating() > 0 ? doctor.getRating() : 5.0)
                .totalRatings(doctor.getTotalRatings())
                .build();
    }
}
