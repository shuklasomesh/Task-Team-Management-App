package com.taskmanager.repository;

import com.taskmanager.model.Test;
import com.taskmanager.model.TestSubmission;
import com.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TestSubmissionRepository extends JpaRepository<TestSubmission, Long> {
    Optional<TestSubmission> findByTestAndUserAndStatus(Test test, User user, TestSubmission.Status status);
    List<TestSubmission> findByUserAndStatus(User user, TestSubmission.Status status);
    List<TestSubmission> findByStatus(TestSubmission.Status status);

    @Query("SELECT s FROM TestSubmission s WHERE s.status = 'COMPLETED' ORDER BY s.score DESC")
    List<TestSubmission> findLeaderboard();

    @Query("SELECT COALESCE(SUM(s.score), 0) FROM TestSubmission s WHERE s.user = :user AND s.status = 'COMPLETED'")
    Integer getTotalScoreForUser(@Param("user") User user);

    @Query("SELECT COUNT(s) FROM TestSubmission s WHERE s.user = :user AND s.status = 'COMPLETED'")
    long countCompletedByUser(@Param("user") User user);

    boolean existsByTestAndUser(Test test, User user);
}
