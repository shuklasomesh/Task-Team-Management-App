package com.taskmanager.repository;

import com.taskmanager.model.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m ORDER BY m.sentAt DESC")
    List<ChatMessage> findRecent(Pageable pageable);

    @Query("SELECT m FROM ChatMessage m WHERE m.id > :afterId ORDER BY m.sentAt ASC")
    List<ChatMessage> findAfter(@Param("afterId") Long afterId);
}
