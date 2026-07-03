package com.campusdelivery.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryRequest {
    @NotNull(message = "Pickup address ID is required")
    private Integer pickupAddressId;

    @NotNull(message = "Dropoff address ID is required")
    private Integer dropoffAddressId;
}
