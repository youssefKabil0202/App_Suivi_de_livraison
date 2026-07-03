package com.campusdelivery.controller;

import com.campusdelivery.dto.request.AddressRequest;
import com.campusdelivery.dto.request.AssignCourierRequest;
import com.campusdelivery.dto.response.*;
import com.campusdelivery.entity.*;
import com.campusdelivery.service.AddressService;
import com.campusdelivery.service.DeliveryService;
import com.campusdelivery.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final DeliveryService deliveryService;
    private final UserService userService;
    private final AddressService addressService;

    // --- Dashboard Stats ---
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<StatsResponse>> getStats() {
        StatsResponse stats = deliveryService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.<StatsResponse>builder()
                .success(true)
                .message("Dashboard statistics retrieved successfully.")
                .data(stats)
                .build());
    }

    // --- Deliveries Management ---
    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getDeliveries() {
        List<DeliveryResponse> list = deliveryService.getAllDeliveries().stream()
                .map(DeliveryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<DeliveryResponse>>builder()
                .success(true)
                .message("Deliveries list retrieved.")
                .data(list)
                .build());
    }

    @PutMapping("/deliveries/{id}/assign")
    public ResponseEntity<ApiResponse<DeliveryResponse>> assignCourier(
            @PathVariable Integer id,
            @Valid @RequestBody AssignCourierRequest request,
            @AuthenticationPrincipal User admin) {
        Delivery delivery = deliveryService.assignCourier(id, request.getCourierId(), admin);
        return ResponseEntity.ok(ApiResponse.<DeliveryResponse>builder()
                .success(true)
                .message("Courier assigned successfully.")
                .data(DeliveryResponse.fromEntity(delivery))
                .build());
    }

    @PutMapping("/deliveries/{id}/cancel")
    public ResponseEntity<ApiResponse<DeliveryResponse>> cancelDelivery(
            @PathVariable Integer id,
            @AuthenticationPrincipal User admin) {
        Delivery delivery = deliveryService.cancelDelivery(id, admin);
        return ResponseEntity.ok(ApiResponse.<DeliveryResponse>builder()
                .success(true)
                .message("Delivery canceled successfully.")
                .data(DeliveryResponse.fromEntity(delivery))
                .build());
    }

    // --- Users Management ---
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers() {
        List<UserResponse> list = userService.getAllUsers().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .success(true)
                .message("Users list retrieved.")
                .data(list)
                .build());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
            @PathVariable Integer id,
            @RequestParam Role role) {
        User user = userService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User role updated successfully.")
                .data(UserResponse.fromEntity(user))
                .build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("User deleted successfully.")
                .build());
    }

    // --- Addresses Management ---
    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses() {
        List<AddressResponse> list = addressService.getAllAddresses().stream()
                .map(AddressResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<AddressResponse>>builder()
                .success(true)
                .message("Addresses list retrieved.")
                .data(list)
                .build());
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(@Valid @RequestBody AddressRequest request) {
        Address address = addressService.createAddress(request);
        return ResponseEntity.ok(ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Address created successfully.")
                .data(AddressResponse.fromEntity(address))
                .build());
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Integer id,
            @Valid @RequestBody AddressRequest request) {
        Address address = addressService.updateAddress(id, request);
        return ResponseEntity.ok(ApiResponse.<AddressResponse>builder()
                .success(true)
                .message("Address updated successfully.")
                .data(AddressResponse.fromEntity(address))
                .build());
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Integer id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Address deleted successfully.")
                .build());
    }
}
