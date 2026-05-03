package com.taskmanager.controller;

import com.taskmanager.model.UserSession;
import com.taskmanager.service.SessionService;
import com.taskmanager.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final UserService userService;

    public SessionController(SessionService sessionService, UserService userService) {
        this.sessionService = sessionService;
        this.userService = userService;
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<Void> heartbeat() {
        sessionService.heartbeat();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        sessionService.endSession();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/online")
    public ResponseEntity<List<Map<String, Object>>> getOnlineMembers() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(3);
        List<UserSession> sessions = sessionService.getOnlineSessions();
        List<Map<String, Object>> result = sessions.stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("userId", s.getUser().getId());
            m.put("name", s.getUser().getName());
            m.put("email", s.getUser().getEmail());
            m.put("loginTime", s.getLoginTime());
            m.put("lastHeartbeat", s.getLastHeartbeat());
            m.put("workingSeconds", s.getWorkingSeconds());
            m.put("online", s.getLastHeartbeat() != null && s.getLastHeartbeat().isAfter(threshold));
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/member-stats")
    public ResponseEntity<List<Map<String, Object>>> getMemberStats() {
        List<Map<String, Object>> stats = new ArrayList<>();
        List<UserSession> activeSessions = sessionService.getAllActiveSessions();
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(3);
        Map<Long, UserSession> activeByUser = new HashMap<>();
        for (UserSession s : activeSessions) activeByUser.put(s.getUser().getId(), s);

        userService.getAllUsersEntity().forEach(user -> {
            if (user.getRole() == com.taskmanager.model.User.Role.MEMBER) {
                Map<String, Object> stat = new LinkedHashMap<>();
                stat.put("userId", user.getId());
                stat.put("name", user.getName());
                stat.put("email", user.getEmail());
                long totalSeconds = sessionService.getTotalWorkingSeconds(user);
                stat.put("totalWorkingSeconds", totalSeconds);
                UserSession active = activeByUser.get(user.getId());
                boolean online = active != null && active.getLastHeartbeat() != null
                        && active.getLastHeartbeat().isAfter(threshold);
                stat.put("online", online);
                stat.put("loginTime", active != null ? active.getLoginTime() : null);
                stat.put("lastHeartbeat", active != null ? active.getLastHeartbeat() : null);
                stats.add(stat);
            }
        });
        return ResponseEntity.ok(stats);
    }
}
