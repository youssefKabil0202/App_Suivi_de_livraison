package com.campusdelivery.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsResponse {
    private long totalToday;
    private long pendingCount;
    private long completedCount;
    private long canceledCount;
    private double avgDeliveryTimeMinutes;
}
