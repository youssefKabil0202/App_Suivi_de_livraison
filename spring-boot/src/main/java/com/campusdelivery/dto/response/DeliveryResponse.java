package com.campusdelivery.dto.response;

import com.campusdelivery.entity.Delivery;
import com.campusdelivery.entity.DeliveryStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryResponse {
    private Integer id;
    private UserResponse client;
    private UserResponse courier;
    private AddressResponse pickupAddress;
    private AddressResponse dropoffAddress;
    private DeliveryStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DeliveryResponse fromEntity(Delivery delivery) {
        if (delivery == null) return null;
        return DeliveryResponse.builder()
                .id(delivery.getId())
                .client(UserResponse.fromEntity(delivery.getClient()))
                .courier(UserResponse.fromEntity(delivery.getCourier()))
                .pickupAddress(AddressResponse.fromEntity(delivery.getPickupAddress()))
                .dropoffAddress(AddressResponse.fromEntity(delivery.getDropoffAddress()))
                .status(delivery.getStatus())
                .createdAt(delivery.getCreatedAt())
                .updatedAt(delivery.getUpdatedAt())
                .build();
    }
}
