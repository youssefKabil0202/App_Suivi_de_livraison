package com.campusdelivery.dto.response;

import com.campusdelivery.entity.Role;
import com.campusdelivery.entity.User;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Integer id;
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
