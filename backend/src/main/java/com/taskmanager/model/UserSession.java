package com.taskmanager.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_sessions")
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime loginTime;

    private LocalDateTime logoutTime;

    private LocalDateTime lastHeartbeat;

    @Column(nullable = false)
    private boolean active = true;

    private String ipAddress;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public UserSession() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User user;
        private LocalDateTime loginTime;
        private String ipAddress;

        public Builder user(User user) { this.user = user; return this; }
        public Builder loginTime(LocalDateTime loginTime) { this.loginTime = loginTime; return this; }
        public Builder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }

        public UserSession build() {
            UserSession s = new UserSession();
            s.user = this.user;
            s.loginTime = this.loginTime;
            s.lastHeartbeat = this.loginTime;
            s.ipAddress = this.ipAddress;
            return s;
        }
    }

    public long getWorkingSeconds() {
        LocalDateTime end = (logoutTime != null) ? logoutTime : LocalDateTime.now();
        return java.time.Duration.between(loginTime, end).getSeconds();
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getLoginTime() { return loginTime; }
    public void setLoginTime(LocalDateTime loginTime) { this.loginTime = loginTime; }
    public LocalDateTime getLogoutTime() { return logoutTime; }
    public void setLogoutTime(LocalDateTime logoutTime) { this.logoutTime = logoutTime; }
    public LocalDateTime getLastHeartbeat() { return lastHeartbeat; }
    public void setLastHeartbeat(LocalDateTime lastHeartbeat) { this.lastHeartbeat = lastHeartbeat; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
