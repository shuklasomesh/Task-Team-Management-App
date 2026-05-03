package com.taskmanager.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_members",
       uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "user_id"}))
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectRole projectRole = ProjectRole.MEMBER;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime joinedAt;

    public ProjectMember() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Project project;
        private User user;
        private ProjectRole projectRole = ProjectRole.MEMBER;

        public Builder project(Project project) { this.project = project; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder projectRole(ProjectRole projectRole) { this.projectRole = projectRole; return this; }

        public ProjectMember build() {
            ProjectMember m = new ProjectMember();
            m.project = this.project;
            m.user = this.user;
            m.projectRole = this.projectRole;
            return m;
        }
    }

    public Long getId() { return id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public ProjectRole getProjectRole() { return projectRole; }
    public void setProjectRole(ProjectRole projectRole) { this.projectRole = projectRole; }
    public LocalDateTime getJoinedAt() { return joinedAt; }

    public enum ProjectRole { ADMIN, MEMBER }
}
