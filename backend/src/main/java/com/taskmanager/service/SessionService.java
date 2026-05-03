package com.taskmanager.service;

import com.taskmanager.model.User;
import com.taskmanager.model.UserSession;
import com.taskmanager.repository.UserSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessionService {

    private final UserSessionRepository sessionRepository;
    private final UserService userService;

    public SessionService(UserSessionRepository sessionRepository, UserService userService) {
        this.sessionRepository = sessionRepository;
        this.userService = userService;
    }

    @Transactional
    public UserSession startSession(User user, String ip) {
        // Close any lingering active sessions
        sessionRepository.findTopByUserAndActiveOrderByLoginTimeDesc(user, true)
                .ifPresent(s -> { s.setActive(false); s.setLogoutTime(LocalDateTime.now()); sessionRepository.save(s); });

        UserSession session = UserSession.builder()
                .user(user).loginTime(LocalDateTime.now()).ipAddress(ip).build();
        return sessionRepository.save(session);
    }

    @Transactional
    public void heartbeat() {
        User user = userService.getCurrentUser();
        sessionRepository.findTopByUserAndActiveOrderByLoginTimeDesc(user, true)
                .ifPresent(s -> { s.setLastHeartbeat(LocalDateTime.now()); sessionRepository.save(s); });
    }

    @Transactional
    public void endSession() {
        User user = userService.getCurrentUser();
        sessionRepository.findTopByUserAndActiveOrderByLoginTimeDesc(user, true)
                .ifPresent(s -> { s.setActive(false); s.setLogoutTime(LocalDateTime.now()); sessionRepository.save(s); });
    }

    public List<UserSession> getOnlineSessions() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(3);
        return sessionRepository.findOnlineSessions(threshold);
    }

    public List<UserSession> getAllActiveSessions() {
        return sessionRepository.findByActive(true);
    }

    public List<UserSession> getUserSessions(User user) {
        return sessionRepository.findByUserOrderByLoginTimeDesc(user);
    }

    public long getTotalWorkingSeconds(User user) {
        return sessionRepository.findAllByUser(user).stream()
                .mapToLong(UserSession::getWorkingSeconds).sum();
    }
}
