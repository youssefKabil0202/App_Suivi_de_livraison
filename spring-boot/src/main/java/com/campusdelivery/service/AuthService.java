package com.campusdelivery.service;

import com.campusdelivery.config.JwtUtils;
import com.campusdelivery.dto.request.LoginRequest;
import com.campusdelivery.dto.request.RegisterRequest;
import com.campusdelivery.dto.response.JwtResponse;
import com.campusdelivery.entity.User;
import com.campusdelivery.exception.CustomExceptions;
import com.campusdelivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomExceptions.BadRequestException("Email address is already registered.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        return userRepository.save(user);
    }

    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomExceptions.UnauthorizedException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new CustomExceptions.UnauthorizedException("Invalid email or password.");
        }

        String token = jwtUtils.generateToken(user);

        return JwtResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
