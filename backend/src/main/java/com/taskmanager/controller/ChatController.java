package com.taskmanager.controller;

import com.taskmanager.model.ChatMessage;
import com.taskmanager.model.User;
import com.taskmanager.repository.ChatMessageRepository;
import com.taskmanager.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatMessageRepository chatRepository;
    private final UserService userService;

    public ChatController(ChatMessageRepository chatRepository, UserService userService) {
        this.chatRepository = chatRepository;
        this.userService = userService;
    }

    @GetMapping("/messages")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getMessages(
            @RequestParam(required = false) Long after) {
        List<ChatMessage> messages;
        if (after != null) {
            messages = chatRepository.findAfter(after);
        } else {
            List<ChatMessage> recent = chatRepository.findRecent(PageRequest.of(0, 50));
            Collections.reverse(recent);
            messages = recent;
        }
        return ResponseEntity.ok(messages.stream().map(this::toMap).collect(Collectors.toList()));
    }

    @PostMapping("/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        User sender = userService.getCurrentUser();
        ChatMessage msg = new ChatMessage();
        msg.setSender(sender);
        msg.setContent(content.trim());
        ChatMessage saved = chatRepository.save(msg);
        return ResponseEntity.ok(toMap(saved));
    }

    private Map<String, Object> toMap(ChatMessage m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("content", m.getContent());
        map.put("sentAt", m.getSentAt());
        if (m.getSender() != null) {
            Map<String, Object> sender = new LinkedHashMap<>();
            sender.put("id", m.getSender().getId());
            sender.put("name", m.getSender().getName());
            sender.put("role", m.getSender().getRole());
            map.put("sender", sender);
        }
        return map;
    }
}
