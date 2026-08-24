package com.hospital.smart.controller;

import com.hospital.smart.dto.*;
import com.hospital.smart.security.CustomUserDetails;
import com.hospital.smart.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register — Register a new patient user.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.ok(
                ApiResponse.success("Registration successful", authResponse));
    }

    /**
     * POST /api/auth/login — Authenticate and return JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Login successful", authResponse));
    }

    /**
     * GET /api/auth/me — Get the currently authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AuthResponse.UserInfo userInfo = authService.getCurrentUser(userDetails.getId());
        return ResponseEntity.ok(
                ApiResponse.success("User profile retrieved", userInfo));
    }
}
