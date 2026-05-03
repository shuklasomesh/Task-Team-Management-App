package com.taskmanager.service;

import com.taskmanager.dto.UserDto;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDto getCurrentUserDto() {
        return toDto(getCurrentUser());
    }

    public List<UserDto> searchUsers(String query) {
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<User> getAllUsersEntity() {
        return userRepository.findAll();
    }

    public UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId()).name(user.getName())
                .email(user.getEmail()).role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
