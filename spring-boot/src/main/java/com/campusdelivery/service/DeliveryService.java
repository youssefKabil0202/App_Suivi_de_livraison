package com.campusdelivery.service;

import com.campusdelivery.dto.request.DeliveryRequest;
import com.campusdelivery.dto.response.StatsResponse;
import com.campusdelivery.entity.*;
import com.campusdelivery.exception.CustomExceptions;
import com.campusdelivery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final DeliveryStatusLogRepository logRepository;

    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Delivery> getDeliveriesByStatus(DeliveryStatus status) {
        return deliveryRepository.findByStatus(status);
    }

    public Delivery getDeliveryById(Integer id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Delivery not found with ID: " + id));
    }

    public List<Delivery> getClientDeliveries(Integer clientId) {
        return deliveryRepository.findByClientId(clientId);
    }

    public List<Delivery> getCourierDeliveries(Integer courierId) {
        return deliveryRepository.findByCourierId(courierId);
    }

    public List<DeliveryStatusLog> getDeliveryLogs(Integer deliveryId) {
        // Verify delivery exists
        getDeliveryById(deliveryId);
        return logRepository.findByDeliveryIdOrderByChangedAtAsc(deliveryId);
    }

    @Transactional
    public Delivery createDelivery(User client, DeliveryRequest request) {
        Address pickup = addressRepository.findById(request.getPickupAddressId())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Pickup address not found."));

        Address dropoff = addressRepository.findById(request.getDropoffAddressId())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Drop-off address not found."));

        Delivery delivery = Delivery.builder()
                .client(client)
                .pickupAddress(pickup)
                .dropoffAddress(dropoff)
                .status(DeliveryStatus.CREATED)
                .build();

        Delivery savedDelivery = deliveryRepository.save(delivery);

        // Log Initial State
        createStatusLog(savedDelivery, DeliveryStatus.CREATED, client, "Delivery requested on the campus.");

        return savedDelivery;
    }

    @Transactional
    public Delivery assignCourier(Integer id, Integer courierId, User admin) {
        Delivery delivery = getDeliveryById(id);
        User courier = userRepository.findById(courierId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Courier not found."));

        if (courier.getRole() != Role.COURIER) {
            throw new CustomExceptions.BadRequestException("Assigned user must be a COURIER.");
        }

        delivery.setCourier(courier);
        Delivery savedDelivery = deliveryRepository.save(delivery);

        createStatusLog(savedDelivery, delivery.getStatus(), admin, "Courier manually assigned: " + courier.getName());

        return savedDelivery;
    }

    @Transactional
    public Delivery cancelDelivery(Integer id, User actor) {
        Delivery delivery = getDeliveryById(id);
        
        if (delivery.getStatus() == DeliveryStatus.DELIVERED || delivery.getStatus() == DeliveryStatus.CANCELED) {
            throw new CustomExceptions.BadRequestException("Cannot cancel a delivery that is already " + delivery.getStatus());
        }

        delivery.setStatus(DeliveryStatus.CANCELED);
        Delivery savedDelivery = deliveryRepository.save(delivery);

        createStatusLog(savedDelivery, DeliveryStatus.CANCELED, actor, "Delivery canceled by " + actor.getName());

        return savedDelivery;
    }

    @Transactional
    public Delivery updateDeliveryStatus(Integer id, DeliveryStatus newStatus, String notes, User courier) {
        Delivery delivery = getDeliveryById(id);

        if (delivery.getCourier() == null || !delivery.getCourier().getId().equals(courier.getId())) {
            throw new CustomExceptions.UnauthorizedException("You are not the assigned courier for this delivery.");
        }

        // Validate Status Flow
        DeliveryStatus currentStatus = delivery.getStatus();
        boolean isValid = false;

        if (currentStatus == DeliveryStatus.CREATED && newStatus == DeliveryStatus.PICKED_UP) {
            isValid = true;
        } else if (currentStatus == DeliveryStatus.PICKED_UP && newStatus == DeliveryStatus.EN_ROUTE) {
            isValid = true;
        } else if (currentStatus == DeliveryStatus.EN_ROUTE && newStatus == DeliveryStatus.DELIVERED) {
            isValid = true;
        }

        if (!isValid) {
            throw new CustomExceptions.BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        delivery.setStatus(newStatus);
        Delivery savedDelivery = deliveryRepository.save(delivery);

        createStatusLog(savedDelivery, newStatus, courier, notes != null ? notes : "Status updated to " + newStatus);

        return savedDelivery;
    }

    public StatsResponse getDashboardStats() {
        List<Delivery> allDeliveries = deliveryRepository.findAll();
        LocalDate today = LocalDate.now();

        long totalToday = allDeliveries.stream()
                .filter(d -> d.getCreatedAt().toLocalDate().isEqual(today))
                .count();

        long pending = allDeliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.CREATED || 
                             d.getStatus() == DeliveryStatus.PICKED_UP || 
                             d.getStatus() == DeliveryStatus.EN_ROUTE)
                .count();

        long completed = allDeliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.DELIVERED)
                .count();

        long canceled = allDeliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.CANCELED)
                .count();

        // Calculate Average Delivery Time (duration between createdAt and updatedAt for DELIVERED ones)
        List<Delivery> delivered = allDeliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.DELIVERED)
                .collect(Collectors.toList());

        double avgMinutes = 0.0;
        if (!delivered.isEmpty()) {
            long totalMinutes = 0;
            for (Delivery d : delivered) {
                totalMinutes += Duration.between(d.getCreatedAt(), d.getUpdatedAt()).toMinutes();
            }
            avgMinutes = (double) totalMinutes / delivered.size();
        }

        return StatsResponse.builder()
                .totalToday(totalToday)
                .pendingCount(pending)
                .completedCount(completed)
                .canceledCount(canceled)
                .avgDeliveryTimeMinutes(avgMinutes)
                .build();
    }

    private void createStatusLog(Delivery delivery, DeliveryStatus status, User user, String notes) {
        DeliveryStatusLog log = DeliveryStatusLog.builder()
                .delivery(delivery)
                .status(status)
                .changedBy(user)
                .notes(notes)
                .build();
        logRepository.save(log);
    }
}
