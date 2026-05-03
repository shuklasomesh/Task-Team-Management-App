package com.taskmanager.service;

import com.taskmanager.dto.DashboardDto;
import com.taskmanager.dto.TaskDto;
import com.taskmanager.model.Project;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserService userService;
    private final TaskService taskService;
    private final ProjectService projectService;

    public DashboardService(ProjectRepository projectRepository, TaskRepository taskRepository,
                            UserService userService, TaskService taskService, ProjectService projectService) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userService = userService;
        this.taskService = taskService;
        this.projectService = projectService;
    }

    public DashboardDto getDashboard() {
        User user = userService.getCurrentUser();
        List<Project> projects = projectRepository.findProjectsByUserMembership(user);
        List<Task> tasks = taskRepository.findTasksForUser(user);
        List<Task> overdueTasks = taskRepository.findOverdueTasksForUser(user, LocalDate.now());

        Map<String, Long> tasksByStatus = tasks.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
        Map<String, Long> tasksByPriority = tasks.stream()
                .collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting()));

        List<TaskDto.Response> recentTasks = tasks.stream().limit(5).map(taskService::toResponse).collect(Collectors.toList());
        List<TaskDto.Response> overdueList = overdueTasks.stream().limit(5).map(taskService::toResponse).collect(Collectors.toList());
        List<com.taskmanager.dto.ProjectDto.Response> recentProjects = projects.stream().limit(5).map(projectService::toResponse).collect(Collectors.toList());

        long completedTasks = tasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count();
        long inProgressTasks = tasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count();
        long todoTasks = tasks.stream().filter(t -> t.getStatus() == Task.Status.TODO).count();

        return DashboardDto.builder()
                .totalProjects(projects.size()).totalTasks(tasks.size())
                .completedTasks(completedTasks).inProgressTasks(inProgressTasks)
                .todoTasks(todoTasks).overdueTasks(overdueTasks.size())
                .tasksByStatus(tasksByStatus).tasksByPriority(tasksByPriority)
                .recentTasks(recentTasks).overdueSummary(overdueList).recentProjects(recentProjects)
                .build();
    }
}
