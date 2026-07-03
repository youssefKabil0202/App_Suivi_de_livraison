package com.campusdelivery.controller;

import com.campusdelivery.dto.request.StatusUpdateRequest;
import com.campusdelivery.dto.response.ApiResponse;
import com.campusdelivery.dto.response.DeliveryResponse;
import com.campusdelivery.entity.Delivery;
import com.campusdelivery.entity.User;
import com.campusdelivery.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courier")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CourierController {

    private final DeliveryService deliveryService;

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getMyDeliveries(@AuthenticationPrincipal User courier) {
        List<DeliveryResponse> list = deliveryService.getCourierDeliveries(courier.getId()).stream()
                .map(DeliveryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<DeliveryResponse>>builder()
                .success(true)
                .message("Courier assigned deliveries list.")
                .data(list)
                .build());
    }

    @PutMapping("/deliveries/{id}/status")
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal User courier) {
        Delivery delivery = deliveryService.updateDeliveryStatus(id, request.getStatus(), request.getNotes(), courier);
        return ResponseEntity.ok(ApiResponse.<DeliveryResponse>builder()
                .success(true)
                .message("Delivery status updated successfully.")
                .data(DeliveryResponse.fromEntity(delivery))
                .build());
    }
}
