package com.taskmanager.service;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.*;
import com.taskmanager.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository,
                       ProjectMemberRepository memberRepository, UserRepository userRepository,
                       UserService userService, NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    public List<TaskDto.Response> getProjectTasks(Long projectId) {
        Project project = getProjectWithAccess(projectId);
        return taskRepository.findByProjectOrderByCreatedAtDesc(project)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TaskDto.Response> getMyTasks() {
        User user = userService.getCurrentUser();
        return taskRepository.findTasksForUser(user).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TaskDto.Response getTask(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task", id));
        verifyTaskAccess(task);
        return toResponse(task);
    }

    @Transactional
    public TaskDto.Response createTask(TaskDto.Request request) {
        User creator = userService.getCurrentUser();
        Project project = getProjectWithAccess(request.getProjectId());
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssigneeId()));
            if (!memberRepository.existsByProjectAndUser(project, assignee)
                    && !project.getOwner().getId().equals(assignee.getId()))
                throw new BadRequestException("Assignee must be a project member");
        }
        Task.Status status = Task.Status.TODO;
        if (request.getStatus() != null) {
            try { status = Task.Status.valueOf(request.getStatus().toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }
        Task.Priority priority = Task.Priority.MEDIUM;
        if (request.getPriority() != null) {
            try { priority = Task.Priority.valueOf(request.getPriority().toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }
        Task task = Task.builder()
                .title(request.getTitle()).description(request.getDescription())
                .status(status).priority(priority).dueDate(request.getDueDate())
                .project(project).assignee(assignee).creator(creator).build();
        Task saved = taskRepository.save(task);
        if (assignee != null && !assignee.getId().equals(creator.getId())) {
            notificationService.notifyTaskAssigned(assignee, saved);
        }
        return toResponse(saved);
    }

    @Transactional
    public TaskDto.Response updateTask(Long id, TaskDto.UpdateRequest request) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task", id));
        verifyTaskAccess(task);
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getStatus() != null) {
            try { task.setStatus(Task.Status.valueOf(request.getStatus().toUpperCase())); } catch (IllegalArgumentException ignored) {}
        }
        if (request.getPriority() != null) {
            try { task.setPriority(Task.Priority.valueOf(request.getPriority().toUpperCase())); } catch (IllegalArgumentException ignored) {}
        }
        User newAssignee = null;
        if (request.getAssigneeId() != null) {
            if (request.getAssigneeId() == 0) {
                task.setAssignee(null);
            } else {
                newAssignee = userRepository.findById(request.getAssigneeId())
                        .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssigneeId()));
                task.setAssignee(newAssignee);
            }
        }
        Task saved = taskRepository.save(task);
        if (newAssignee != null) {
            User currentUser = userService.getCurrentUser();
            if (!newAssignee.getId().equals(currentUser.getId())) {
                notificationService.notifyTaskAssigned(newAssignee, saved);
            }
        }
        return toResponse(saved);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task", id));
        verifyTaskAccess(task);
        taskRepository.delete(task);
    }

    @Transactional
    public TaskDto.Response updateTaskStatus(Long id, String status) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task", id));
        verifyTaskAccess(task);
        try { task.setStatus(Task.Status.valueOf(status.toUpperCase())); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid status: " + status); }
        return toResponse(taskRepository.save(task));
    }

    private Project getProjectWithAccess(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        User user = userService.getCurrentUser();
        if (user.getRole() == User.Role.ADMIN) return project;
        if (project.getOwner().getId().equals(user.getId())) return project;
        if (memberRepository.existsByProjectAndUser(project, user)) return project;
        throw new AccessDeniedException("You are not a member of this project");
    }

    private void verifyTaskAccess(Task task) {
        User user = userService.getCurrentUser();
        if (user.getRole() == User.Role.ADMIN) return;
        Project project = task.getProject();
        if (project.getOwner().getId().equals(user.getId())) return;
        if (memberRepository.existsByProjectAndUser(project, user)) return;
        throw new AccessDeniedException("You don't have access to this task");
    }

    public TaskDto.Response toResponse(Task task) {
        TaskDto.Response response = new TaskDto.Response();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus().name());
        response.setPriority(task.getPriority().name());
        response.setDueDate(task.getDueDate());
        response.setOverdue(task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != Task.Status.DONE);
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());

        TaskDto.ProjectSummary ps = new TaskDto.ProjectSummary();
        ps.setId(task.getProject().getId());
        ps.setName(task.getProject().getName());
        response.setProject(ps);

        if (task.getAssignee() != null) response.setAssignee(userService.toDto(task.getAssignee()));
        response.setCreator(userService.toDto(task.getCreator()));
        return response;
    }
}
