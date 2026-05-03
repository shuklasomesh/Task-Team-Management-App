package com.taskmanager.controller;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskComment;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectMemberRepository;
import com.taskmanager.repository.TaskCommentRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.service.NotificationService;
import com.taskmanager.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
public class TaskCommentController {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository memberRepository;
    private final NotificationService notificationService;
    private final UserService userService;

    public TaskCommentController(TaskCommentRepository commentRepository,
                                 TaskRepository taskRepository,
                                 ProjectMemberRepository memberRepository,
                                 NotificationService notificationService,
                                 UserService userService) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.memberRepository = memberRepository;
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable Long taskId) {
        Task task = getTaskWithAccess(taskId);
        List<TaskComment> comments = commentRepository.findByTaskOrderByCreatedAtAsc(task);
        return ResponseEntity.ok(comments.stream().map(this::toMap).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addComment(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> body) {
        String content = body.get("content");
        if (content == null || content.isBlank()) return ResponseEntity.badRequest().build();

        User me = userService.getCurrentUser();
        Task task = getTaskWithAccess(taskId);

        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setAuthor(me);
        comment.setContent(content.trim());
        TaskComment saved = commentRepository.save(comment);

        // Notify assignee
        if (task.getAssignee() != null) {
            notificationService.notifyTaskComment(task.getAssignee(), task, me);
        }
        // Notify creator if different from commenter and from assignee
        if (task.getCreator() != null && !task.getCreator().getId().equals(me.getId())
                && (task.getAssignee() == null || !task.getCreator().getId().equals(task.getAssignee().getId()))) {
            notificationService.notifyTaskComment(task.getCreator(), task, me);
        }

        return ResponseEntity.ok(toMap(saved));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long taskId, @PathVariable Long commentId) {
        User me = userService.getCurrentUser();
        TaskComment comment = commentRepository.findById(commentId)
                .orElse(null);
        if (comment == null) return ResponseEntity.notFound().build();
        if (!comment.getAuthor().getId().equals(me.getId()) && me.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Cannot delete this comment");
        }
        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }

    private Task getTaskWithAccess(Long taskId) {
        User user = userService.getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (user.getRole() == User.Role.ADMIN) return task;
        if (task.getProject().getOwner().getId().equals(user.getId())) return task;
        if (memberRepository.existsByProjectAndUser(task.getProject(), user)) return task;
        throw new AccessDeniedException("No access to this task");
    }

    private Map<String, Object> toMap(TaskComment c) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", c.getId());
        map.put("content", c.getContent());
        map.put("createdAt", c.getCreatedAt());
        if (c.getAuthor() != null) {
            Map<String, Object> author = new LinkedHashMap<>();
            author.put("id", c.getAuthor().getId());
            author.put("name", c.getAuthor().getName());
            author.put("role", c.getAuthor().getRole());
            map.put("author", author);
        }
        return map;
    }
}
