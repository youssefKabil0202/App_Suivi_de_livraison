package com.campusdelivery.dto.request;

import com.campusdelivery.entity.DeliveryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull(message = "Status is required")
    private DeliveryStatus status;

    private String notes;
}
