package com.hospital.smart.config;

import com.hospital.smart.model.User;
import com.hospital.smart.model.enums.Role;
import com.hospital.smart.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default admin account on first startup if no admin exists.
 * Default credentials: admin@smarthospital.com / admin123
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed default admin if none exists
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == Role.ADMIN);

        if (!adminExists) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@smarthospital.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();

            userRepository.save(admin);
            log.info("✅ Default admin account created: admin@smarthospital.com / admin123");
        } else {
            log.info("✅ Admin account already exists — skipping seed.");
        }
    }
}
