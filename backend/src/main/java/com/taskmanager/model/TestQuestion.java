package com.taskmanager.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "test_questions")
public class TestQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    private QuestionType questionType = QuestionType.MCQ;

    private Integer points = 1;
    private Integer orderIndex;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("id ASC")
    private List<TestOption> options;

    public TestQuestion() {}

    public Long getId() { return id; }
    public Test getTest() { return test; }
    public void setTest(Test test) { this.test = test; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String q) { this.questionText = q; }
    public QuestionType getQuestionType() { return questionType; }
    public void setQuestionType(QuestionType t) { this.questionType = t; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer p) { this.points = p; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer i) { this.orderIndex = i; }
    public List<TestOption> getOptions() { return options; }
    public void setOptions(List<TestOption> options) { this.options = options; }

    public enum QuestionType { MCQ, TRUE_FALSE }
}
