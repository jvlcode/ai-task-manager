package com.taskmanager.dto;

import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;

import java.util.List;
import java.util.Map;

public record DashboardStatsResponse(
        long totalTasks,
        long completedTasks,
        long openTasks,
        long overdueTasks,
        long dueThisWeek,
        int completionRate,
        long teamMemberCount,
        Map<TaskStatus, Long> tasksByStatus,
        Map<TaskPriority, Long> tasksByPriority,
        List<TaskResponse> recentTasks,
        List<TaskResponse> upcomingTasks
) {
}
