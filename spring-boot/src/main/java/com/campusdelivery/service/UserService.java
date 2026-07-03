package com.campusdelivery.service;

import com.campusdelivery.entity.Role;
import com.campusdelivery.entity.User;
import com.campusdelivery.exception.CustomExceptions;
import com.campusdelivery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found with ID: " + id));
    }

    @Transactional
    public User updateUserRole(Integer id, Role role) {
        User user = getUserById(id);
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new CustomExceptions.ResourceNotFoundException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }
}
