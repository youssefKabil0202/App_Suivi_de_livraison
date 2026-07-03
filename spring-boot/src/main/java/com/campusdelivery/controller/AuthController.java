package com.campusdelivery.controller;

import com.campusdelivery.dto.request.LoginRequest;
import com.campusdelivery.dto.request.RegisterRequest;
import com.campusdelivery.dto.response.ApiResponse;
import com.campusdelivery.dto.response.JwtResponse;
import com.campusdelivery.entity.User;
import com.campusdelivery.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        ApiResponse<User> response = ApiResponse.<User>builder()
                .success(true)
                .message("User registered successfully.")
                .data(user)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse jwtResponse = authService.login(request);
        ApiResponse<JwtResponse> response = ApiResponse.<JwtResponse>builder()
                .success(true)
                .message("Login successful.")
                .data(jwtResponse)
                .build();
        return ResponseEntity.ok(response);
    }
}
