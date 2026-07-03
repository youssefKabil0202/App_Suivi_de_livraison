package com.campusdelivery.controller;

import com.campusdelivery.dto.request.DeliveryRequest;
import com.campusdelivery.dto.response.*;
import com.campusdelivery.entity.*;
import com.campusdelivery.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClientController {

    private final DeliveryService deliveryService;

    @PostMapping("/deliveries")
    public ResponseEntity<ApiResponse<DeliveryResponse>> createDelivery(
            @Valid @RequestBody DeliveryRequest request,
            @AuthenticationPrincipal User client) {
        Delivery delivery = deliveryService.createDelivery(client, request);
        return ResponseEntity.ok(ApiResponse.<DeliveryResponse>builder()
                .success(true)
                .message("Delivery request submitted successfully.")
                .data(DeliveryResponse.fromEntity(delivery))
                .build());
    }

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getHistory(@AuthenticationPrincipal User client) {
        List<DeliveryResponse> list = deliveryService.getClientDeliveries(client.getId()).stream()
                .map(DeliveryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<DeliveryResponse>>builder()
                .success(true)
                .message("Client delivery history retrieved.")
                .data(list)
                .build());
    }

    @GetMapping("/deliveries/{id}/status")
    public ResponseEntity<ApiResponse<DeliveryStatus>> getStatus(@PathVariable Integer id) {
        Delivery delivery = deliveryService.getDeliveryById(id);
        return ResponseEntity.ok(ApiResponse.<DeliveryStatus>builder()
                .success(true)
                .message("Delivery status retrieved.")
                .data(delivery.getStatus())
                .build());
    }

    @GetMapping("/deliveries/{id}/logs")
    public ResponseEntity<ApiResponse<List<DeliveryStatusLogResponse>>> getLogs(@PathVariable Integer id) {
        List<DeliveryStatusLogResponse> list = deliveryService.getDeliveryLogs(id).stream()
                .map(DeliveryStatusLogResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<DeliveryStatusLogResponse>>builder()
                .success(true)
                .message("Delivery timeline logs retrieved.")
                .data(list)
                .build());
    }
}
