package com.taskmanager.model;

import jakarta.persistence.*;

@Entity
@Table(name = "test_responses")
public class TestResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private TestSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private TestQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_option_id")
    private TestOption selectedOption;

    private boolean correct;
    private Integer pointsEarned = 0;

    public TestResponse() {}

    public Long getId() { return id; }
    public TestSubmission getSubmission() { return submission; }
    public void setSubmission(TestSubmission submission) { this.submission = submission; }
    public TestQuestion getQuestion() { return question; }
    public void setQuestion(TestQuestion question) { this.question = question; }
    public TestOption getSelectedOption() { return selectedOption; }
    public void setSelectedOption(TestOption selectedOption) { this.selectedOption = selectedOption; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
    public Integer getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }
}
