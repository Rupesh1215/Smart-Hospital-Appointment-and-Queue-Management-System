package com.hospital.smart.service;

import com.hospital.smart.dto.AuthResponse;
import com.hospital.smart.dto.LoginRequest;
import com.hospital.smart.dto.RegisterRequest;
import com.hospital.smart.exception.DuplicateResourceException;
import com.hospital.smart.exception.ResourceNotFoundException;
import com.hospital.smart.model.Patient;
import com.hospital.smart.model.User;
import com.hospital.smart.model.enums.Role;
import com.hospital.smart.repository.PatientRepository;
import com.hospital.smart.repository.UserRepository;
import com.hospital.smart.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Register a new user with PATIENT role.
     * Also creates a Patient profile linked to the User.
     */
    public AuthResponse register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Create User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PATIENT)
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // Create linked Patient profile
        Patient patient = Patient.builder()
                .userId(user.getId())
                .patientName(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .address(user.getAddress())
                .isActive(true)
                .build();

        patientRepository.save(patient);

        // Generate JWT
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return buildAuthResponse(user, token);
    }

    /**
     * Authenticate user with email and password, return JWT.
     */
    public AuthResponse login(LoginRequest request) {
        // Authenticate via Spring Security AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        // If authentication passes, find user and generate token
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return buildAuthResponse(user, token);
    }

    /**
     * Get the currently authenticated user's profile.
     */
    public AuthResponse.UserInfo getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return AuthResponse.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .profileImage(user.getProfileImage())
                .build();
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .profileImage(user.getProfileImage())
                .build();

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(86400000) // 24 hours in ms
                .user(userInfo)
                .build();
    }
}
