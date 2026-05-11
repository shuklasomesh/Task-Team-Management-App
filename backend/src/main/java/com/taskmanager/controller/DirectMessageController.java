package com.taskmanager.controller;

import com.taskmanager.model.DirectMessage;
import com.taskmanager.model.User;
import com.taskmanager.repository.DirectMessageRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dm")
public class DirectMessageController {

    private final DirectMessageRepository dmRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public DirectMessageController(DirectMessageRepository dmRepository,
                                    UserRepository userRepository,
                                    UserService userService) {
        this.dmRepository = dmRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/users")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        User me = userService.getCurrentUser();
        List<User> all = userRepository.findAll();
        List<Map<String, Object>> result = all.stream()
                .filter(u -> !u.getId().equals(me.getId()))
                .map(u -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", u.getId());
                    map.put("name", u.getName());
                    map.put("role", u.getRole());
                    map.put("unreadCount", dmRepository.countUnread(me, u));
                    List<DirectMessage> last = dmRepository.findLastBetween(me, u, PageRequest.of(0, 1));
                    if (!last.isEmpty()) {
                        map.put("lastMessage", last.get(0).getContent());
                        map.put("lastMessageTime", last.get(0).getSentAt());
                    } else {
                        map.put("lastMessage", null);
                        map.put("lastMessageTime", null);
                    }
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{userId}/messages")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @PathVariable Long userId,
            @RequestParam(required = false) Long after) {
        User me = userService.getCurrentUser();
        User other = userRepository.findById(userId).orElse(null);
        if (other == null) return ResponseEntity.notFound().build();

        List<DirectMessage> messages;
        if (after != null) {
            messages = dmRepository.findConversationAfter(me, other, after);
        } else {
            messages = dmRepository.findConversation(me, other);
        }
        return ResponseEntity.ok(messages.stream().map(this::toMap).collect(Collectors.toList()));
    }

    @PostMapping("/{userId}/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String content = body.get("content");
        if (content == null || content.isBlank()) return ResponseEntity.badRequest().build();

        User me = userService.getCurrentUser();
        User recipient = userRepository.findById(userId).orElse(null);
        if (recipient == null) return ResponseEntity.notFound().build();

        DirectMessage msg = new DirectMessage();
        msg.setSender(me);
        msg.setRecipient(recipient);
        msg.setContent(content.trim());
        DirectMessage saved = dmRepository.save(msg);
        return ResponseEntity.ok(toMap(saved));
    }

    @PatchMapping("/{userId}/read")
    @Transactional
    public ResponseEntity<Void> markRead(@PathVariable Long userId) {
        User me = userService.getCurrentUser();
        User sender = userRepository.findById(userId).orElse(null);
        if (sender == null) return ResponseEntity.notFound().build();
        dmRepository.markAsRead(me, sender);
        return ResponseEntity.ok().build();
    }

    private Map<String, Object> toMap(DirectMessage m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("content", m.getContent());
        map.put("sentAt", m.getSentAt());
        map.put("recipientRead", m.isRecipientRead());
        if (m.getSender() != null) {
            Map<String, Object> sender = new LinkedHashMap<>();
            sender.put("id", m.getSender().getId());
            sender.put("name", m.getSender().getName());
            sender.put("role", m.getSender().getRole());
            map.put("sender", sender);
        }
        if (m.getRecipient() != null) {
            map.put("recipientId", m.getRecipient().getId());
        }
        return map;
    }
}
