package com.taskmanager.repository;

import com.taskmanager.model.Test;
import com.taskmanager.model.TestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestQuestionRepository extends JpaRepository<TestQuestion, Long> {
    List<TestQuestion> findByTestOrderByOrderIndexAsc(Test test);
}
