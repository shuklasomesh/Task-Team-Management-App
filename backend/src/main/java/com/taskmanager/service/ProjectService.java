package com.taskmanager.service;

import com.taskmanager.dto.ProjectDto;
import com.taskmanager.dto.UserDto;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Project;
import com.taskmanager.model.ProjectMember;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectMemberRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public ProjectService(ProjectRepository projectRepository, ProjectMemberRepository memberRepository,
                          TaskRepository taskRepository, UserRepository userRepository, UserService userService) {
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public List<ProjectDto.Response> getMyProjects() {
        User user = userService.getCurrentUser();
        return projectRepository.findProjectsByUserMembership(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProjectDto.Response getProject(Long id) {
        return toResponse(getProjectAndVerifyAccess(id));
    }

    @Transactional
    public ProjectDto.Response createProject(ProjectDto.Request request) {
        User owner = userService.getCurrentUser();
        Project project = Project.builder()
                .name(request.getName()).description(request.getDescription())
                .status(Project.Status.ACTIVE).owner(owner).build();
        project = projectRepository.save(project);
        ProjectMember ownerMember = ProjectMember.builder()
                .project(project).user(owner).projectRole(ProjectMember.ProjectRole.ADMIN).build();
        memberRepository.save(ownerMember);
        return toResponse(project);
    }

    @Transactional
    public ProjectDto.Response updateProject(Long id, ProjectDto.Request request) {
        Project project = getProjectAndVerifyAccess(id);
        User currentUser = userService.getCurrentUser();
        if (!project.getOwner().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            ProjectMember member = memberRepository.findByProjectAndUser(project, currentUser)
                    .orElseThrow(() -> new AccessDeniedException("Not a project member"));
            if (member.getProjectRole() != ProjectMember.ProjectRole.ADMIN)
                throw new AccessDeniedException("Only project admin can update project");
        }
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            project.setStatus(Project.Status.valueOf(request.getStatus().toUpperCase()));
        }
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = getProjectAndVerifyAccess(id);
        User currentUser = userService.getCurrentUser();
        if (!project.getOwner().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN)
            throw new AccessDeniedException("Only project owner can delete project");
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDto.Response addMember(Long projectId, ProjectDto.AddMemberRequest request) {
        Project project = getProjectAndVerifyAccess(projectId);
        User currentUser = userService.getCurrentUser();
        verifyProjectAdmin(project, currentUser);
        User userToAdd = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
        if (memberRepository.existsByProjectAndUser(project, userToAdd))
            throw new BadRequestException("User is already a member of this project");
        ProjectMember.ProjectRole role = ProjectMember.ProjectRole.MEMBER;
        if (request.getProjectRole() != null) {
            try { role = ProjectMember.ProjectRole.valueOf(request.getProjectRole().toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        memberRepository.save(ProjectMember.builder().project(project).user(userToAdd).projectRole(role).build());
        return toResponse(projectRepository.findById(projectId).orElseThrow());
    }

    @Transactional
    public void removeMember(Long projectId, Long userId) {
        Project project = getProjectAndVerifyAccess(projectId);
        User currentUser = userService.getCurrentUser();
        verifyProjectAdmin(project, currentUser);
        if (project.getOwner().getId().equals(userId))
            throw new BadRequestException("Cannot remove project owner");
        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        memberRepository.deleteByProjectAndUser(project, userToRemove);
    }

    public List<UserDto> getProjectMembers(Long projectId) {
        Project project = getProjectAndVerifyAccess(projectId);
        return memberRepository.findByProject(project).stream()
                .map(m -> userService.toDto(m.getUser())).collect(Collectors.toList());
    }

    private Project getProjectAndVerifyAccess(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        User currentUser = userService.getCurrentUser();
        if (currentUser.getRole() == User.Role.ADMIN) return project;
        if (project.getOwner().getId().equals(currentUser.getId())) return project;
        if (!memberRepository.existsByProjectAndUser(project, currentUser))
            throw new AccessDeniedException("You are not a member of this project");
        return project;
    }

    private void verifyProjectAdmin(Project project, User user) {
        if (user.getRole() == User.Role.ADMIN) return;
        if (project.getOwner().getId().equals(user.getId())) return;
        ProjectMember member = memberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new AccessDeniedException("Not a project member"));
        if (member.getProjectRole() != ProjectMember.ProjectRole.ADMIN)
            throw new AccessDeniedException("Only project admin can perform this action");
    }

    public ProjectDto.Response toResponse(Project project) {
        List<ProjectMember> members = memberRepository.findByProject(project);
        long taskCount = taskRepository.findByProject(project).size();
        long completedCount = taskRepository.countByProjectAndStatus(project, Task.Status.DONE);

        List<ProjectDto.MemberDto> memberDtos = members.stream().map(m -> {
            ProjectDto.MemberDto dto = new ProjectDto.MemberDto();
            dto.setId(m.getUser().getId());
            dto.setName(m.getUser().getName());
            dto.setEmail(m.getUser().getEmail());
            dto.setProjectRole(m.getProjectRole().name());
            dto.setJoinedAt(m.getJoinedAt());
            return dto;
        }).collect(Collectors.toList());

        ProjectDto.Response response = new ProjectDto.Response();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setStatus(project.getStatus().name());
        response.setOwner(userService.toDto(project.getOwner()));
        response.setMembers(memberDtos);
        response.setTaskCount(taskCount);
        response.setCompletedTaskCount(completedCount);
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());
        return response;
    }
}
