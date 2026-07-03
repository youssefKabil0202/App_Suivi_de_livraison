package com.campusdelivery.service;

import com.campusdelivery.dto.request.AddressRequest;
import com.campusdelivery.entity.Address;
import com.campusdelivery.entity.User;
import com.campusdelivery.exception.CustomExceptions;
import com.campusdelivery.repository.AddressRepository;
import com.campusdelivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<Address> getAllAddresses() {
        return addressRepository.findAll();
    }

    public List<Address> getFrequentAddresses() {
        return addressRepository.findByIsFrequentTrue();
    }

    public List<Address> getUserAddresses(Integer userId) {
        return addressRepository.findByUserIdOrIsFrequentTrue(userId);
    }

    public Address getAddressById(Integer id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Address not found with ID: " + id));
    }

    @Transactional
    public Address createAddress(AddressRequest request) {
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found with ID: " + request.getUserId()));
        }

        Address address = Address.builder()
                .label(request.getLabel())
                .addressLine(request.getAddressLine())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isFrequent(request.getIsFrequent() != null ? request.getIsFrequent() : false)
                .user(user)
                .build();

        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Integer id, AddressRequest request) {
        Address address = getAddressById(id);
        
        address.setLabel(request.getLabel());
        address.setAddressLine(request.getAddressLine());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        if (request.getIsFrequent() != null) {
            address.setIsFrequent(request.getIsFrequent());
        }

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found with ID: " + request.getUserId()));
            address.setUser(user);
        } else {
            address.setUser(null);
        }

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Integer id) {
        if (!addressRepository.existsById(id)) {
            throw new CustomExceptions.ResourceNotFoundException("Address not found with ID: " + id);
        }
        addressRepository.deleteById(id);
    }
}
