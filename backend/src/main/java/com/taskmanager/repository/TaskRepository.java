package com.taskmanager.repository;

import com.taskmanager.model.Project;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByProjectOrderByCreatedAtDesc(Project project);
    List<Task> findByAssignee(User assignee);
    List<Task> findByAssigneeAndStatus(User assignee, Task.Status status);

    @Query("SELECT t FROM Task t WHERE t.assignee = :user OR t.creator = :user ORDER BY t.createdAt DESC")
    List<Task> findTasksForUser(@Param("user") User user);

    @Query("SELECT t FROM Task t WHERE (t.assignee = :user OR t.creator = :user) AND t.status != 'DONE' AND t.dueDate < :today")
    List<Task> findOverdueTasksForUser(@Param("user") User user, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.project IN :projects ORDER BY t.createdAt DESC")
    List<Task> findByProjectsIn(@Param("projects") List<Project> projects);

    @Query("SELECT t FROM Task t WHERE t.project IN :projects AND t.status != 'DONE' AND t.dueDate < :today")
    List<Task> findOverdueByProjects(@Param("projects") List<Project> projects, @Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee = :user AND t.status = :status")
    long countByAssigneeAndStatus(@Param("user") User user, @Param("status") Task.Status status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project = :project AND t.status = :status")
    long countByProjectAndStatus(@Param("project") Project project, @Param("status") Task.Status status);

    List<Task> findByProjectAndStatus(Project project, Task.Status status);

    List<Task> findByDueDateAndStatusNot(LocalDate dueDate, Task.Status status);
}
