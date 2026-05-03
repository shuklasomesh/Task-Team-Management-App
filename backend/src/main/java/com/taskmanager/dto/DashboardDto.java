package com.taskmanager.dto;

import java.util.List;
import java.util.Map;

public class DashboardDto {
    private long totalProjects;
    private long totalTasks;
    private long completedTasks;
    private long inProgressTasks;
    private long overdueTasks;
    private long todoTasks;
    private Map<String, Long> tasksByStatus;
    private Map<String, Long> tasksByPriority;
    private List<TaskDto.Response> recentTasks;
    private List<TaskDto.Response> overdueSummary;
    private List<ProjectDto.Response> recentProjects;

    public DashboardDto() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private long totalProjects, totalTasks, completedTasks, inProgressTasks, overdueTasks, todoTasks;
        private Map<String, Long> tasksByStatus;
        private Map<String, Long> tasksByPriority;
        private List<TaskDto.Response> recentTasks;
        private List<TaskDto.Response> overdueSummary;
        private List<ProjectDto.Response> recentProjects;

        public Builder totalProjects(long v) { totalProjects = v; return this; }
        public Builder totalTasks(long v) { totalTasks = v; return this; }
        public Builder completedTasks(long v) { completedTasks = v; return this; }
        public Builder inProgressTasks(long v) { inProgressTasks = v; return this; }
        public Builder overdueTasks(long v) { overdueTasks = v; return this; }
        public Builder todoTasks(long v) { todoTasks = v; return this; }
        public Builder tasksByStatus(Map<String, Long> v) { tasksByStatus = v; return this; }
        public Builder tasksByPriority(Map<String, Long> v) { tasksByPriority = v; return this; }
        public Builder recentTasks(List<TaskDto.Response> v) { recentTasks = v; return this; }
        public Builder overdueSummary(List<TaskDto.Response> v) { overdueSummary = v; return this; }
        public Builder recentProjects(List<ProjectDto.Response> v) { recentProjects = v; return this; }

        public DashboardDto build() {
            DashboardDto d = new DashboardDto();
            d.totalProjects = totalProjects; d.totalTasks = totalTasks;
            d.completedTasks = completedTasks; d.inProgressTasks = inProgressTasks;
            d.overdueTasks = overdueTasks; d.todoTasks = todoTasks;
            d.tasksByStatus = tasksByStatus; d.tasksByPriority = tasksByPriority;
            d.recentTasks = recentTasks; d.overdueSummary = overdueSummary;
            d.recentProjects = recentProjects;
            return d;
        }
    }

    public long getTotalProjects() { return totalProjects; }
    public void setTotalProjects(long v) { totalProjects = v; }
    public long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(long v) { totalTasks = v; }
    public long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(long v) { completedTasks = v; }
    public long getInProgressTasks() { return inProgressTasks; }
    public void setInProgressTasks(long v) { inProgressTasks = v; }
    public long getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(long v) { overdueTasks = v; }
    public long getTodoTasks() { return todoTasks; }
    public void setTodoTasks(long v) { todoTasks = v; }
    public Map<String, Long> getTasksByStatus() { return tasksByStatus; }
    public void setTasksByStatus(Map<String, Long> v) { tasksByStatus = v; }
    public Map<String, Long> getTasksByPriority() { return tasksByPriority; }
    public void setTasksByPriority(Map<String, Long> v) { tasksByPriority = v; }
    public List<TaskDto.Response> getRecentTasks() { return recentTasks; }
    public void setRecentTasks(List<TaskDto.Response> v) { recentTasks = v; }
    public List<TaskDto.Response> getOverdueSummary() { return overdueSummary; }
    public void setOverdueSummary(List<TaskDto.Response> v) { overdueSummary = v; }
    public List<ProjectDto.Response> getRecentProjects() { return recentProjects; }
    public void setRecentProjects(List<ProjectDto.Response> v) { recentProjects = v; }
}
