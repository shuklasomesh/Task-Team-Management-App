package com.taskmanager.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tests")
public class Test {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    private Integer timeLimitMinutes;
    private boolean active = true;

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestQuestion> questions;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public Test() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String title, description;
        private Skill skill;
        private User createdBy;
        private Integer timeLimitMinutes;

        public Builder title(String t) { this.title = t; return this; }
        public Builder description(String d) { this.description = d; return this; }
        public Builder skill(Skill s) { this.skill = s; return this; }
        public Builder createdBy(User u) { this.createdBy = u; return this; }
        public Builder timeLimitMinutes(Integer t) { this.timeLimitMinutes = t; return this; }

        public Test build() {
            Test t = new Test();
            t.title = title; t.description = description;
            t.skill = skill; t.createdBy = createdBy;
            t.timeLimitMinutes = timeLimitMinutes;
            return t;
        }
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }
    public User getCreatedBy() { return createdBy; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer t) { this.timeLimitMinutes = t; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public List<TestQuestion> getQuestions() { return questions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
