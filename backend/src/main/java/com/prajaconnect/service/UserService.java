package com.prajaconnect.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.prajaconnect.entity.User;
import com.prajaconnect.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ClerkService clerkService;

    public UserService(UserRepository userRepository, ClerkService clerkService) {
        this.userRepository = userRepository;
        this.clerkService = clerkService;
    }

    public User getOrCreate(String userId) {
        return userRepository.findById(userId).orElseGet(() -> {
            try {
                JsonNode clerkUser = clerkService.getUser(userId);
                String email = clerkUser.path("email_addresses").get(0)
                    .path("email_address").asText(userId + "@example.com");
                String firstName = clerkUser.path("first_name").asText("");
                String lastName  = clerkUser.path("last_name").asText("");
                String name      = (firstName + " " + lastName).trim();
                if (name.isEmpty()) name = "User";
                String avatar = clerkUser.path("image_url").asText(null);

                // Re-check: another thread (e.g. syncUser) may have created the user
                // while we were calling the slow Clerk API
                Optional<User> recheck = userRepository.findById(userId);
                if (recheck.isPresent()) return recheck.get();

                User user = new User();
                user.setId(userId);
                user.setName(name);
                user.setEmail(email);
                user.setRole("citizen");
                user.setAvatar(avatar);
                return userRepository.save(user);
            } catch (Exception e) {
                throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not resolve user from Clerk: " + e.getMessage()
                );
            }
        });
    }

    public Optional<User> findById(String userId) {
        return userRepository.findById(userId);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User updateRole(String targetId, String role, String callerId) {
        User caller = userRepository.findById(callerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Caller not found"));
        if (!"admin".equals(caller.getRole())) {
            throw new SecurityException("Only admins can change user roles");
        }
        User target = userRepository.findById(targetId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        target.setRole(role);
        userRepository.save(target);
        try { clerkService.updateUserMetadata(targetId, Map.of("role", role)); }
        catch (Exception ignored) {}
        return target;
    }

    public User syncUser(String userId, String email, String name, String avatar, String role) {
        User user = userRepository.findById(userId).orElse(new User());

        user.setId(userId);
        if (name   != null) user.setName(name);
        if (email  != null) user.setEmail(email);
        if (avatar != null) user.setAvatar(avatar);

        // Set role: use provided role, or keep existing, or default to citizen
        if (role != null && !role.isBlank()) {
            user.setRole(role);
        } else if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("citizen");
        }

        User saved = userRepository.save(user);

        // Sync role to Clerk metadata (best-effort)
        try { clerkService.updateUserMetadata(userId, Map.of("role", saved.getRole())); }
        catch (Exception ignored) {}

        return saved;
    }

    public String getRoleOrDefault(String userId) {
        return userRepository.findById(userId)
            .map(User::getRole)
            .orElse("citizen");
    }
}
