package com.campusdelivery.repository;

import com.campusdelivery.entity.Delivery;
import com.campusdelivery.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Integer> {
    List<Delivery> findByClientId(Integer clientId);
    List<Delivery> findByCourierId(Integer courierId);
    List<Delivery> findByStatus(DeliveryStatus status);
    
    @Query("SELECT d FROM Delivery d ORDER BY d.createdAt DESC")
    List<Delivery> findAllByOrderByCreatedAtDesc();
}
