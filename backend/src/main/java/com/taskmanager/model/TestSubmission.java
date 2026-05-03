package com.taskmanager.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "test_submissions")
public class TestSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    private Integer score = 0;
    private Integer maxScore = 0;

    @Enumerated(EnumType.STRING)
    private Status status = Status.IN_PROGRESS;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL)
    private List<TestResponse> responses;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public TestSubmission() {}

    public Long getId() { return id; }
    public Test getTest() { return test; }
    public void setTest(Test test) { this.test = test; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public List<TestResponse> getResponses() { return responses; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public double getPercentage() {
        if (maxScore == null || maxScore == 0) return 0;
        return Math.round((score * 100.0 / maxScore) * 10.0) / 10.0;
    }

    public enum Status { IN_PROGRESS, COMPLETED }
}
