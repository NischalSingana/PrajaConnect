package com.prajaconnect.controller;

import com.prajaconnect.entity.Notification;
import com.prajaconnect.repository.NotificationRepository;
import com.prajaconnect.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public NotificationController(NotificationRepository notificationRepository, UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        if (userService.findById(userId).isEmpty()) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        Optional<Notification> opt = notificationRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Notification notification = opt.get();
        if (!notification.getUserId().equals(userId)) return ResponseEntity.status(403).build();
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(notification);
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        var notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok().build();
    }
}
