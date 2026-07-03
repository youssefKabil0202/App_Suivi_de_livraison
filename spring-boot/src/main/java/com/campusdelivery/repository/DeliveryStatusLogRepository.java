package com.campusdelivery.repository;

import com.campusdelivery.entity.DeliveryStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeliveryStatusLogRepository extends JpaRepository<DeliveryStatusLog, Integer> {
    List<DeliveryStatusLog> findByDeliveryIdOrderByChangedAtAsc(Integer deliveryId);
}
