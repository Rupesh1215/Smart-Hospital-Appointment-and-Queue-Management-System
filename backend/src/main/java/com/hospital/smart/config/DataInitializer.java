package com.hospital.smart.config;

import com.hospital.smart.model.Department;
import com.hospital.smart.model.Doctor;
import com.hospital.smart.model.Patient;
import com.hospital.smart.model.User;
import com.hospital.smart.model.enums.Gender;
import com.hospital.smart.model.enums.Role;
import com.hospital.smart.repository.DepartmentRepository;
import com.hospital.smart.repository.DoctorRepository;
import com.hospital.smart.repository.PatientRepository;
import com.hospital.smart.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

/**
 * Seeds default administrator, receptionist, departments, and doctors on startup.
 * Default admin: admin@gmail.com / 12345678
 * Default receptionist: receptionist@gmail.com / 12345678
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           DoctorRepository doctorRepository,
                           PatientRepository patientRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedDepartmentsAndDoctors();
    }

    private void seedUsers() {
        createOrUpdateUser("admin@gmail.com", "Administrator", "12345678", "9876543210", Role.ADMIN, Gender.MALE);
        createOrUpdateUser("receptionist@gmail.com", "Front Desk Receptionist", "12345678", "9876543211", Role.RECEPTIONIST, Gender.FEMALE);
        
        User patientUser = createOrUpdateUser("patient@gmail.com", "John Doe", "12345678", "9876543212", Role.PATIENT, Gender.MALE);
        if (patientUser != null) {
            Patient patient = patientRepository.findByUserId(patientUser.getId())
                    .orElse(Patient.builder().userId(patientUser.getId()).build());
            patient.setPatientName(patientUser.getName());
            patient.setEmail(patientUser.getEmail());
            patient.setPhone(patientUser.getPhone());
            patient.setGender(patientUser.getGender());
            patient.setActive(true);
            patientRepository.save(patient);
        }

        User doctorUser = createOrUpdateUser("doctor@gmail.com", "Dr. Arjun Mehta", "12345678", "9876543213", Role.DOCTOR, Gender.MALE);
        if (doctorUser != null && !doctorRepository.existsByUserId(doctorUser.getId())) {
            Doctor doctor = Doctor.builder()
                    .userId(doctorUser.getId())
                    .doctorName("Arjun Mehta")
                    .email(doctorUser.getEmail())
                    .phone(doctorUser.getPhone())
                    .specialization("Interventional Cardiologist")
                    .qualification("MD, DM Cardiology")
                    .experience(18)
                    .consultationFee(800.0)
                    .isAvailable(true)
                    .averageConsultationTime(20)
                    .maxPatientsPerDay(30)
                    .workingDays(Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"))
                    .workingHoursStart(LocalTime.of(9, 0))
                    .workingHoursEnd(LocalTime.of(17, 0))
                    .breakStart(LocalTime.of(13, 0))
                    .breakEnd(LocalTime.of(14, 0))
                    .build();
            doctorRepository.save(doctor);
        }
    }

    private User createOrUpdateUser(String email, String name, String rawPassword, String phone, Role role, Gender gender) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .phone(phone)
                    .role(role)
                    .gender(gender)
                    .isActive(true)
                    .build();
            log.info("✅ Created default {} account: {} / {}", role, email, rawPassword);
        } else {
            user.setName(name);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            user.setActive(true);
            log.info("🔄 Updated default {} account password: {} / {}", role, email, rawPassword);
        }
        return userRepository.save(user);
    }

    private void seedDepartmentsAndDoctors() {
        if (departmentRepository.count() > 0 && doctorRepository.count() >= 10) {
            log.info("✅ Departments & Doctors already populated — skipping seed.");
            return;
        }

        log.info("🌱 Seeding default hospital departments and doctors...");

        List<DeptSeed> depts = Arrays.asList(
            new DeptSeed("Cardiology", "Heart & Cardiovascular Care", "❤️", Arrays.asList(
                new DocSeed("Arjun Mehta", "Interventional Cardiologist", "MD, DM Cardiology", 18, 800, 4.9, 3400),
                new DocSeed("Priya Nair", "Cardiac Electrophysiologist", "MBBS, MD, DNB Cardiology", 14, 700, 4.8, 2800),
                new DocSeed("Rohan Kapoor", "Non-Invasive Cardiologist", "MD, Fellowship AIIMS", 10, 600, 4.7, 1900)
            )),
            new DeptSeed("Neurology", "Brain & Nervous System Disorders", "🧠", Arrays.asList(
                new DocSeed("Sneha Verma", "Neurologist", "MD, DM Neurology", 16, 850, 4.9, 3100),
                new DocSeed("Kiran Desai", "Epileptologist", "MBBS, MD, Johns Hopkins", 12, 750, 4.8, 2100),
                new DocSeed("Ananya Menon", "Neuro-Intensivist", "MD, DM, FIAN", 9, 650, 4.7, 1600),
                new DocSeed("Vikram Singh", "Movement Disorder Specialist", "MD Neurology, PhD", 20, 900, 5.0, 4000)
            )),
            new DeptSeed("Orthopedics", "Bone & Joint Care", "🦴", Arrays.asList(
                new DocSeed("Ravi Shankar", "Joint Replacement Surgeon", "MS Ortho, Mayo Clinic", 22, 900, 4.9, 5000),
                new DocSeed("Pooja Sharma", "Spine Surgeon", "MS Ortho, MCh Spine", 15, 800, 4.8, 2600),
                new DocSeed("Nikhil Gupta", "Sports Medicine", "MS, FJSS Edinburgh", 11, 700, 4.7, 2100)
            )),
            new DeptSeed("Dermatology", "Skin, Hair & Cosmetic Care", "🌿", Arrays.asList(
                new DocSeed("Meera Pillai", "Cosmetic Dermatologist", "MD Dermatology, FRCP", 14, 700, 4.9, 3200),
                new DocSeed("Aditya Rao", "Onco-Dermatologist", "MD, IFAAD", 10, 600, 4.7, 2100)
            )),
            new DeptSeed("General Medicine", "Primary Healthcare & Preventive Medicine", "🏥", Arrays.asList(
                new DocSeed("Rajesh Tiwari", "General Physician", "MBBS, MD General Medicine", 20, 400, 4.8, 6000),
                new DocSeed("Lakshmi Iyer", "Internal Medicine", "MBBS, MD, MRCP(UK)", 16, 500, 4.9, 4800),
                new DocSeed("Amit Joshi", "Diabetologist", "MBBS, MD, FRCP Edinburgh", 14, 500, 4.7, 3900)
            )),
            new DeptSeed("Pediatrics", "Child Healthcare & Immunization", "👶", Arrays.asList(
                new DocSeed("Sanjay Malhotra", "Paediatrician", "MBBS, MD Paediatrics", 18, 600, 4.9, 4200),
                new DocSeed("Radha Gopal", "Neonatologist", "MD, DNB Neonatology", 14, 700, 4.8, 3100)
            )),
            new DeptSeed("ENT", "Ear, Nose & Throat Care", "👂", Arrays.asList(
                new DocSeed("Mohan Prasad", "ENT Specialist", "MS ENT, DLO", 17, 600, 4.8, 3800),
                new DocSeed("Geeta Patel", "Cochlear Implant Surgeon", "MS, Diploma Otology", 13, 700, 4.9, 2500)
            )),
            new DeptSeed("Ophthalmology", "Eye Surgery & Vision Care", "👁️", Arrays.asList(
                new DocSeed("Neeraj Aggarwal", "Cornea & Refractive Surgeon", "MS Ophthalmology, FICO", 15, 700, 4.9, 3500),
                new DocSeed("Divya Menon", "Retina Specialist", "MS, Vitreoretinal Fellowship", 12, 750, 4.8, 2800)
            ))
        );

        for (DeptSeed ds : depts) {
            Department dept = departmentRepository.findByName(ds.name)
                    .orElseGet(() -> departmentRepository.save(
                            Department.builder()
                                    .name(ds.name)
                                    .description(ds.description)
                                    .icon(ds.icon)
                                    .isActive(true)
                                    .build()
                    ));

            for (DocSeed doc : ds.doctors) {
                // Ensure doctor email is unique
                String email = "dr." + doc.name.toLowerCase().replace(" ", ".") + "@smarthospital.com";
                if (!userRepository.existsByEmail(email)) {
                    User userDoc = User.builder()
                            .name("Dr. " + doc.name)
                            .email(email)
                            .password(passwordEncoder.encode("doctor123"))
                            .role(Role.DOCTOR)
                            .gender(Gender.MALE)
                            .isActive(true)
                            .build();
                    userDoc = userRepository.save(userDoc);

                    Doctor doctor = Doctor.builder()
                            .userId(userDoc.getId())
                            .doctorName(doc.name)
                            .email(email)
                            .phone("987654" + (1000 + (int)(Math.random()*8999)))
                            .specialization(doc.specialization)
                            .qualification(doc.qualification)
                            .experience(doc.experience)
                            .consultationFee(doc.fee)
                            .departmentId(dept.getId())
                            .isAvailable(true)
                            .averageConsultationTime(20)
                            .maxPatientsPerDay(30)
                            .workingDays(Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"))
                            .workingHoursStart(LocalTime.of(9, 0))
                            .workingHoursEnd(LocalTime.of(17, 0))
                            .breakStart(LocalTime.of(13, 0))
                            .breakEnd(LocalTime.of(14, 0))
                            .build();
                    doctorRepository.save(doctor);
                }
            }
        }
        log.info("✅ Successfully seeded hospital departments and doctors.");
    }

    private static class DeptSeed {
        String name;
        String description;
        String icon;
        List<DocSeed> doctors;

        DeptSeed(String name, String description, String icon, List<DocSeed> doctors) {
            this.name = name;
            this.description = description;
            this.icon = icon;
            this.doctors = doctors;
        }
    }

    private static class DocSeed {
        String name;
        String specialization;
        String qualification;
        int experience;
        double fee;
        double rating;
        int patientsServed;

        DocSeed(String name, String specialization, String qualification, int experience, double fee, double rating, int patientsServed) {
            this.name = name;
            this.specialization = specialization;
            this.qualification = qualification;
            this.experience = experience;
            this.fee = fee;
            this.rating = rating;
            this.patientsServed = patientsServed;
        }
    }
}
