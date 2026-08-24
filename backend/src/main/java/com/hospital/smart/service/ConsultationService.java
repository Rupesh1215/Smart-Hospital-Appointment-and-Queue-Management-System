package com.hospital.smart.service;

import com.hospital.smart.exception.ResourceNotFoundException;
import com.hospital.smart.model.Appointment;
import com.hospital.smart.model.Consultation;
import com.hospital.smart.model.Queue;
import com.hospital.smart.model.enums.AppointmentStatus;
import com.hospital.smart.repository.AppointmentRepository;
import com.hospital.smart.repository.ConsultationRepository;
import com.hospital.smart.repository.QueueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final QueueRepository queueRepository;
    private final QueueService queueService;

    public Consultation createOrUpdateConsultation(Consultation consultation) {
        if (consultation.getAppointmentId() != null) {
            Appointment appointment = appointmentRepository.findById(consultation.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + consultation.getAppointmentId()));
            
            // Mark appointment as COMPLETED
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);

            // Set Doctor & Patient IDs from appointment if missing
            if (consultation.getDoctorId() == null) {
                consultation.setDoctorId(appointment.getDoctorId());
            }
            if (consultation.getPatientId() == null) {
                consultation.setPatientId(appointment.getPatientId());
            }

            // Also advance queue status to COMPLETED
            try {
                Optional<Queue> queueOpt = queueRepository.findByAppointmentId(appointment.getId());
                queueOpt.ifPresent(q -> queueService.completeConsultation(q.getId()));
            } catch (Exception e) {
                // Queue entry might not exist or already updated
            }
        }

        if (consultation.getEndTime() == null) {
            consultation.setEndTime(LocalDateTime.now());
        }

        return consultationRepository.save(consultation);
    }

    public Consultation getByAppointmentId(String appointmentId) {
        return consultationRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No consultation found for appointment: " + appointmentId));
    }

    public List<Consultation> getByPatientId(String patientId) {
        return consultationRepository.findByPatientId(patientId);
    }

    public List<Consultation> getByDoctorId(String doctorId) {
        return consultationRepository.findByDoctorId(doctorId);
    }
}
