package com.taskmanager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "test_options")
public class TestOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private TestQuestion question;

    @Column(nullable = false)
    private String optionText;

    private boolean correct;

    public TestOption() {}

    public Long getId() { return id; }
    public TestQuestion getQuestion() { return question; }
    public void setQuestion(TestQuestion question) { this.question = question; }
    public String getOptionText() { return optionText; }
    public void setOptionText(String optionText) { this.optionText = optionText; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
}
