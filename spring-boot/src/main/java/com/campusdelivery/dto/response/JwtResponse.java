package com.campusdelivery.dto.response;

import com.campusdelivery.entity.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    private Integer id;
    private String name;
    private String email;
    private Role role;
}
