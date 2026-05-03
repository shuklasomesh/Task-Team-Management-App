package com.taskmanager.controller;

import com.taskmanager.model.Notification;
import com.taskmanager.model.User;
import com.taskmanager.service.NotificationService;
import com.taskmanager.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        User user = userService.getCurrentUser();
        List<Notification> notifications = notificationService.getNotifications(user);
        List<Map<String, Object>> result = notifications.stream().map(this::toMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = userService.getCurrentUser();
        Map<String, Long> result = new HashMap<>();
        result.put("count", notificationService.getUnreadCount(user));
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        User user = userService.getCurrentUser();
        notificationService.markRead(id, user);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        User user = userService.getCurrentUser();
        notificationService.markAllRead(user);
        return ResponseEntity.ok().build();
    }

    private Map<String, Object> toMap(Notification n) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", n.getId());
        map.put("type", n.getType());
        map.put("message", n.getMessage());
        map.put("relatedEntityId", n.getRelatedEntityId());
        map.put("read", n.isRead());
        map.put("createdAt", n.getCreatedAt());
        return map;
    }
}
