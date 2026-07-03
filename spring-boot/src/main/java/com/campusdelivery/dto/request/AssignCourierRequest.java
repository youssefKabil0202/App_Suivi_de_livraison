package com.campusdelivery.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignCourierRequest {
    @NotNull(message = "Courier ID is required")
    private Integer courierId;
}
