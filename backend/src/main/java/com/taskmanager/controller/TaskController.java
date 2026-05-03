package com.taskmanager.controller;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<TaskDto.Response>> getMyTasks() {
        return ResponseEntity.ok(taskService.getMyTasks());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskDto.Response>> getProjectTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getProjectTasks(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto.Response> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    @PostMapping
    public ResponseEntity<TaskDto.Response> createTask(@Valid @RequestBody TaskDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto.Response> updateTask(@PathVariable Long id,
                                                        @RequestBody TaskDto.UpdateRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto.Response> updateStatus(@PathVariable Long id,
                                                          @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, body.get("status")));
    }
}
