package com.campusdelivery.dto.response;

import com.campusdelivery.entity.DeliveryStatusLog;
import com.campusdelivery.entity.DeliveryStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryStatusLogResponse {
    private Integer id;
    private Integer deliveryId;
    private DeliveryStatus status;
    private UserResponse changedBy;
    private LocalDateTime changedAt;
    private String notes;

    public static DeliveryStatusLogResponse fromEntity(DeliveryStatusLog log) {
        if (log == null) return null;
        return DeliveryStatusLogResponse.builder()
                .id(log.getId())
                .deliveryId(log.getDelivery().getId())
                .status(log.getStatus())
                .changedBy(UserResponse.fromEntity(log.getChangedBy()))
                .changedAt(log.getChangedAt())
                .notes(log.getNotes())
                .build();
    }
}
