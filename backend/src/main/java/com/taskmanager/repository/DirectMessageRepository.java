package com.taskmanager.repository;

import com.taskmanager.model.DirectMessage;
import com.taskmanager.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {

    @Query("SELECT m FROM DirectMessage m WHERE (m.sender = :a AND m.recipient = :b) OR (m.sender = :b AND m.recipient = :a) ORDER BY m.sentAt ASC")
    List<DirectMessage> findConversation(@Param("a") User a, @Param("b") User b);

    @Query("SELECT m FROM DirectMessage m WHERE ((m.sender = :a AND m.recipient = :b) OR (m.sender = :b AND m.recipient = :a)) AND m.id > :after ORDER BY m.sentAt ASC")
    List<DirectMessage> findConversationAfter(@Param("a") User a, @Param("b") User b, @Param("after") Long after);

    @Query("SELECT COUNT(m) FROM DirectMessage m WHERE m.recipient = :user AND m.sender = :sender AND m.recipientRead = false")
    long countUnread(@Param("user") User user, @Param("sender") User sender);

    @Query("SELECT COUNT(m) FROM DirectMessage m WHERE m.recipient = :user AND m.recipientRead = false")
    long countAllUnread(@Param("user") User user);

    @Query("SELECT m FROM DirectMessage m WHERE ((m.sender = :a AND m.recipient = :b) OR (m.sender = :b AND m.recipient = :a)) ORDER BY m.sentAt DESC")
    List<DirectMessage> findLastBetween(@Param("a") User a, @Param("b") User b, Pageable pageable);

    @Modifying
    @Query("UPDATE DirectMessage m SET m.recipientRead = true WHERE m.recipient = :user AND m.sender = :sender AND m.recipientRead = false")
    void markAsRead(@Param("user") User user, @Param("sender") User sender);

    @Query("SELECT DISTINCT CASE WHEN m.sender = :user THEN m.recipient ELSE m.sender END FROM DirectMessage m WHERE m.sender = :user OR m.recipient = :user")
    List<User> findConversationPartners(@Param("user") User user);
}
