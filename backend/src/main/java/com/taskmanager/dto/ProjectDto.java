package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class ProjectDto {

    public static class Request {
        @NotBlank(message = "Project name is required")
        @Size(min = 2, max = 200)
        private String name;

        @Size(max = 1000)
        private String description;

        private String status;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class Response {
        private Long id;
        private String name;
        private String description;
        private String status;
        private UserDto owner;
        private List<MemberDto> members;
        private Long taskCount;
        private Long completedTaskCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public UserDto getOwner() { return owner; }
        public void setOwner(UserDto owner) { this.owner = owner; }
        public List<MemberDto> getMembers() { return members; }
        public void setMembers(List<MemberDto> members) { this.members = members; }
        public Long getTaskCount() { return taskCount; }
        public void setTaskCount(Long taskCount) { this.taskCount = taskCount; }
        public Long getCompletedTaskCount() { return completedTaskCount; }
        public void setCompletedTaskCount(Long completedTaskCount) { this.completedTaskCount = completedTaskCount; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class MemberDto {
        private Long id;
        private String name;
        private String email;
        private String projectRole;
        private LocalDateTime joinedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getProjectRole() { return projectRole; }
        public void setProjectRole(String projectRole) { this.projectRole = projectRole; }
        public LocalDateTime getJoinedAt() { return joinedAt; }
        public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    }

    public static class AddMemberRequest {
        private Long userId;
        private String projectRole;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getProjectRole() { return projectRole; }
        public void setProjectRole(String projectRole) { this.projectRole = projectRole; }
    }
}
