package com.campusdelivery.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank(message = "Label is required")
    private String label;

    @NotBlank(message = "Address line is required")
    private String addressLine;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private Boolean isFrequent;
    
    private Integer userId; // Optional, linked to specific user
}
