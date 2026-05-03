package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDto {

    public static class Request {
        @NotBlank(message = "Task title is required")
        @Size(min = 2, max = 300)
        private String title;

        @Size(max = 2000)
        private String description;

        private String status;
        private String priority;
        private LocalDate dueDate;
        private Long assigneeId;

        @NotNull(message = "Project ID is required")
        private Long projectId;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public Long getAssigneeId() { return assigneeId; }
        public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
    }

    public static class UpdateRequest {
        @Size(min = 2, max = 300)
        private String title;

        @Size(max = 2000)
        private String description;

        private String status;
        private String priority;
        private LocalDate dueDate;
        private Long assigneeId;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public Long getAssigneeId() { return assigneeId; }
        public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    }

    public static class Response {
        private Long id;
        private String title;
        private String description;
        private String status;
        private String priority;
        private LocalDate dueDate;
        private boolean overdue;
        private ProjectSummary project;
        private UserDto assignee;
        private UserDto creator;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public boolean isOverdue() { return overdue; }
        public void setOverdue(boolean overdue) { this.overdue = overdue; }
        public ProjectSummary getProject() { return project; }
        public void setProject(ProjectSummary project) { this.project = project; }
        public UserDto getAssignee() { return assignee; }
        public void setAssignee(UserDto assignee) { this.assignee = assignee; }
        public UserDto getCreator() { return creator; }
        public void setCreator(UserDto creator) { this.creator = creator; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class ProjectSummary {
        private Long id;
        private String name;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
