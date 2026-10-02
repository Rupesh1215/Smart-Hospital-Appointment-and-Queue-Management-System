package com.hospital.smart.service;

import com.hospital.smart.dto.AppointmentDTO;
import com.hospital.smart.dto.FeedbackDTO;
import com.hospital.smart.exception.DuplicateResourceException;
import com.hospital.smart.exception.ResourceNotFoundException;
import com.hospital.smart.model.Appointment;
import com.hospital.smart.model.Doctor;
import com.hospital.smart.model.Feedback;
import com.hospital.smart.model.Patient;
import com.hospital.smart.model.enums.AppointmentStatus;
import com.hospital.smart.repository.AppointmentRepository;
import com.hospital.smart.repository.DoctorRepository;
import com.hospital.smart.repository.FeedbackRepository;
import com.hospital.smart.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentService appointmentService;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           AppointmentRepository appointmentRepository,
                           DoctorRepository doctorRepository,
                           PatientRepository patientRepository,
                           AppointmentService appointmentService) {
        this.feedbackRepository = feedbackRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentService = appointmentService;
    }

    /**
     * Submit feedback for a completed consultation.
     */
    public FeedbackDTO.Response submitFeedback(String userId, FeedbackDTO.CreateRequest request) {
        // Resolve patient by user ID
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", userId));

        // Retrieve appointment
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        // Check appointment belongs to this patient
        if (!appointment.getPatientId().equals(patient.getId())) {
            throw new IllegalArgumentException("You can only submit feedback for your own appointments.");
        }

        // Verify consultation is completed
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Feedback can only be submitted for completed consultations.");
        }

        // Check for duplicate feedback
        if (feedbackRepository.existsByAppointmentId(appointment.getId())) {
            throw new DuplicateResourceException("Feedback", "appointmentId", appointment.getId());
        }

        // Retrieve doctor
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));

        // Assign default emoji based on rating if not explicitly passed
        String emoji = request.getEmoji();
        if (emoji == null || emoji.isBlank()) {
            switch (request.getRating()) {
                case 1: emoji = "😞"; break;
                case 2: emoji = "🙁"; break;
                case 3: emoji = "😐"; break;
                case 4: emoji = "🙂"; break;
                case 5: default: emoji = "😄"; break;
            }
        }

        // Build & save feedback
        Feedback feedback = Feedback.builder()
                .patientId(patient.getId())
                .patientName(patient.getPatientName())
                .doctorId(doctor.getId())
                .doctorName(doctor.getDoctorName())
                .appointmentId(appointment.getId())
                .rating(request.getRating())
                .emoji(emoji)
                .comment(request.getComment())
                .build();

        feedback = feedbackRepository.save(feedback);

        // Recalculate Doctor average rating
        updateDoctorRating(doctor, request.getRating());

        return toResponse(feedback);
    }

    /**
     * Get completed appointments for a patient that have not been rated yet.
     */
    public List<AppointmentDTO.Response> getPendingFeedbackAppointments(String userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", userId));

        // Get all completed appointments for this patient
        List<Appointment> completed = appointmentRepository
                .findByPatientIdAndStatusOrderByAppointmentDateDesc(patient.getId(), AppointmentStatus.COMPLETED);

        if (completed.isEmpty()) {
            return List.of();
        }

        List<String> completedIds = completed.stream().map(Appointment::getId).collect(Collectors.toList());
        List<Feedback> existingFeedbacks = feedbackRepository.findByAppointmentIdIn(completedIds);
        Set<String> ratedApptIds = existingFeedbacks.stream().map(Feedback::getAppointmentId).collect(Collectors.toSet());

        // Filter out appointments already rated
        List<Appointment> pending = completed.stream()
                .filter(apt -> !ratedApptIds.contains(apt.getId()))
                .collect(Collectors.toList());

        return pending.stream().map(appointmentService::toResponse).collect(Collectors.toList());
    }

    /**
     * Get all feedback entries for a specific doctor.
     */
    public List<FeedbackDTO.Response> getDoctorFeedback(String doctorId) {
        return feedbackRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void updateDoctorRating(Doctor doctor, int newRating) {
        int count = doctor.getTotalRatings();
        double currentAvg = doctor.getRating() > 0 ? doctor.getRating() : 5.0;

        double totalSum = (count == 0) ? newRating : (currentAvg * count) + newRating;
        int newCount = count + 1;
        double newAvg = totalSum / newCount;

        // Round to 1 decimal place
        BigDecimal bd = BigDecimal.valueOf(newAvg).setScale(1, RoundingMode.HALF_UP);

        doctor.setRating(bd.doubleValue());
        doctor.setTotalRatings(newCount);
        doctorRepository.save(doctor);
    }

    private FeedbackDTO.Response toResponse(Feedback feedback) {
        return FeedbackDTO.Response.builder()
                .id(feedback.getId())
                .patientId(feedback.getPatientId())
                .patientName(feedback.getPatientName())
                .doctorId(feedback.getDoctorId())
                .doctorName(feedback.getDoctorName())
                .appointmentId(feedback.getAppointmentId())
                .rating(feedback.getRating())
                .emoji(feedback.getEmoji())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
