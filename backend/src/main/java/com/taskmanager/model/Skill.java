package com.taskmanager.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;
    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public Skill() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name, description, icon, color;
        private User createdBy;

        public Builder name(String n) { this.name = n; return this; }
        public Builder description(String d) { this.description = d; return this; }
        public Builder icon(String i) { this.icon = i; return this; }
        public Builder color(String c) { this.color = c; return this; }
        public Builder createdBy(User u) { this.createdBy = u; return this; }

        public Skill build() {
            Skill s = new Skill();
            s.name = name; s.description = description;
            s.icon = icon; s.color = color; s.createdBy = createdBy;
            return s;
        }
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
