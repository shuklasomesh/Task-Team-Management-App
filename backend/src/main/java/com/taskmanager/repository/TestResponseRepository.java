package com.taskmanager.repository;

import com.taskmanager.model.TestResponse;
import com.taskmanager.model.TestSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestResponseRepository extends JpaRepository<TestResponse, Long> {
    List<TestResponse> findBySubmission(TestSubmission submission);
}
