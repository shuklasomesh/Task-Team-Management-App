package com.taskmanager.repository;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {
    List<TaskComment> findByTaskOrderByCreatedAtAsc(Task task);
    long countByTask(Task task);
}
