package com.hospital.smart.service;

import com.hospital.smart.exception.ResourceNotFoundException;
import com.hospital.smart.model.Patient;
import com.hospital.smart.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    /**
     * Get all patients.
     */
    public List<Patient> getAll() {
        return patientRepository.findAll();
    }

    /**
     * Get patient by ID.
     */
    public Patient getById(String id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
    }

    /**
     * Get patient by user ID.
     */
    public Patient getByUserId(String userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", userId));
    }

    /**
     * Update patient profile.
     */
    public Patient update(String id, Patient updateData) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        if (updateData.getPatientName() != null) patient.setPatientName(updateData.getPatientName());
        if (updateData.getPhone() != null) patient.setPhone(updateData.getPhone());
        if (updateData.getGender() != null) patient.setGender(updateData.getGender());
        if (updateData.getDateOfBirth() != null) patient.setDateOfBirth(updateData.getDateOfBirth());
        if (updateData.getBloodGroup() != null) patient.setBloodGroup(updateData.getBloodGroup());
        if (updateData.getAddress() != null) patient.setAddress(updateData.getAddress());
        if (updateData.getEmergencyContact() != null) patient.setEmergencyContact(updateData.getEmergencyContact());
        if (updateData.getEmergencyContactName() != null) patient.setEmergencyContactName(updateData.getEmergencyContactName());
        if (updateData.getAllergies() != null) patient.setAllergies(updateData.getAllergies());
        if (updateData.getMedicalConditions() != null) patient.setMedicalConditions(updateData.getMedicalConditions());

        return patientRepository.save(patient);
    }

    /**
     * Delete a patient.
     */
    public void delete(String id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient", "id", id);
        }
        patientRepository.deleteById(id);
    }
}
