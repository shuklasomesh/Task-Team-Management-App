package com.taskmanager.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Task() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String title;
        private String description;
        private Status status = Status.TODO;
        private Priority priority = Priority.MEDIUM;
        private LocalDate dueDate;
        private Project project;
        private User assignee;
        private User creator;

        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder status(Status status) { this.status = status; return this; }
        public Builder priority(Priority priority) { this.priority = priority; return this; }
        public Builder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public Builder project(Project project) { this.project = project; return this; }
        public Builder assignee(User assignee) { this.assignee = assignee; return this; }
        public Builder creator(User creator) { this.creator = creator; return this; }

        public Task build() {
            Task t = new Task();
            t.title = this.title;
            t.description = this.description;
            t.status = this.status;
            t.priority = this.priority;
            t.dueDate = this.dueDate;
            t.project = this.project;
            t.assignee = this.assignee;
            t.creator = this.creator;
            return t;
        }
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public User getAssignee() { return assignee; }
    public void setAssignee(User assignee) { this.assignee = assignee; }
    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public enum Status { TODO, IN_PROGRESS, IN_REVIEW, DONE }
    public enum Priority { LOW, MEDIUM, HIGH, URGENT }
}
