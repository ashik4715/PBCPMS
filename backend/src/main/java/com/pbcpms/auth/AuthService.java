package com.pbcpms.auth;

import com.pbcpms.auth.dto.AuthResponse;
import com.pbcpms.auth.dto.LoginRequest;
import com.pbcpms.auth.dto.RegisterRequest;
import com.pbcpms.auth.dto.UserResponse;
import com.pbcpms.shared.enums.UserRole;
import com.pbcpms.shared.exception.BadRequestException;
import com.pbcpms.shared.exception.DuplicateResourceException;
import com.pbcpms.shared.security.JwtTokenProvider;
import com.pbcpms.user.User;
import com.pbcpms.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(UserRole.OWNER)
                .build();

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(toUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        return AuthResponse.builder()
                .token(token)
                .user(toUserResponse(user))
                .build();
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
