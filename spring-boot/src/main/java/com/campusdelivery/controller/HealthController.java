package com.campusdelivery.controller;

import com.campusdelivery.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        Map<String, String> statusMap = new HashMap<>();
        statusMap.put("status", "UP");
        statusMap.put("database", "CONNECTED");
        statusMap.put("version", "1.0.0-SpringBoot");

        return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                .success(true)
                .message("Campus Delivery API is healthy and operational.")
                .data(statusMap)
                .build());
    }
}
