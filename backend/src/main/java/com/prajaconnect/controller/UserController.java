package com.prajaconnect.controller;

import com.prajaconnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/users/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return userService.findById(userId)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(404).body(Map.of("error", "User profile not synchronized yet")));
    }

    @GetMapping("/users")
    public ResponseEntity<?> allUsers(@AuthenticationPrincipal Jwt jwt) {
        userService.getOrCreate(jwt.getSubject());
        return ResponseEntity.ok(userService.findAll());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(
        @PathVariable String id,
        @AuthenticationPrincipal Jwt jwt,
        @RequestBody Map<String, String> body
    ) {
        String callerId = jwt.getSubject();
        String role = body.get("role");
        List<String> valid = List.of("citizen", "politician", "moderator", "admin");
        if (!valid.contains(role)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }
        try {
            return ResponseEntity.ok(userService.updateRole(id, role, callerId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Authenticated endpoint — userId is always taken from the JWT, never from the body.
     * Only the name/avatar (display-only fields) may be passed in the body.
     */
    @PostMapping("/sync-user")
    public ResponseEntity<?> syncUser(
        @AuthenticationPrincipal Jwt jwt,
        @RequestBody Map<String, String> body
    ) {
        String userId = jwt.getSubject();
        try {
            userService.syncUser(userId, body.get("email"), body.get("name"), body.get("avatar"));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to sync user data", "details", e.getMessage()));
        }
    }
}
