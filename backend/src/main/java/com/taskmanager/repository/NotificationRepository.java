package com.taskmanager.repository;

import com.taskmanager.model.Notification;
import com.taskmanager.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);

    long countByRecipientAndReadFalse(User recipient);

    boolean existsByRecipientAndTypeAndRelatedEntityId(User recipient, String type, Long relatedEntityId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient = :recipient AND n.read = false")
    void markAllReadForRecipient(@Param("recipient") User recipient);
}
