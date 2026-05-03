package com.taskmanager.repository;

import com.taskmanager.model.User;
import com.taskmanager.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findTopByUserAndActiveOrderByLoginTimeDesc(User user, boolean active);
    List<UserSession> findByUserOrderByLoginTimeDesc(User user);
    List<UserSession> findByActive(boolean active);

    @Query("SELECT s FROM UserSession s WHERE s.active = true AND s.lastHeartbeat > :since")
    List<UserSession> findOnlineSessions(@Param("since") LocalDateTime since);

    @Query("SELECT s FROM UserSession s WHERE s.user = :user")
    List<UserSession> findAllByUser(@Param("user") User user);
}
