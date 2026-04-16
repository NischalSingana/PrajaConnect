package com.prajaconnect.controller;

import com.prajaconnect.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal Jwt jwt) {
        return userService.findById(jwt.getSubject())
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(404).body(Map.of("error", "User profile not synchronized yet")));
    }

    @GetMapping("/users")
    public ResponseEntity<?> allUsers(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.findAll());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable String id,
                                         @AuthenticationPrincipal Jwt jwt,
                                         @RequestBody Map<String, String> body) {
        String role = body.get("role");
        if (!List.of("citizen", "politician", "moderator", "admin").contains(role)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }
        try {
            return ResponseEntity.ok(userService.updateRole(id, role, jwt.getSubject()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sync-user")
    public ResponseEntity<?> syncUser(@AuthenticationPrincipal Jwt jwt,
                                       @RequestBody Map<String, String> body) {
        String userId = jwt.getSubject();
        try {
            var saved = userService.syncUser(userId, body.get("email"), body.get("name"), body.get("avatar"), body.get("role"));
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to sync user", "details", e.getMessage()));
        }
    }
}
