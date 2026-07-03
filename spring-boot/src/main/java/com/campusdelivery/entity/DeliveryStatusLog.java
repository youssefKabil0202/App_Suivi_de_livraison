package com.campusdelivery.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_status_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
