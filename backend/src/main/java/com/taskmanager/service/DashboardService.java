package com.taskmanager.service;

import com.taskmanager.dto.DashboardStatsResponse;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.TeamMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final TaskRepository taskRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final Clock clock;

    public DashboardService(TaskRepository taskRepository, TeamMemberRepository teamMemberRepository, Clock clock) {
        this.taskRepository = taskRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.clock = clock;
    }

    public DashboardStatsResponse getStats() {
        Map<TaskStatus, Long> byStatus = new EnumMap<>(TaskStatus.class);
        for (TaskStatus status : TaskStatus.values()) {
            byStatus.put(status, taskRepository.countByStatus(status));
        }
        Map<TaskPriority, Long> byPriority = new EnumMap<>(TaskPriority.class);
        for (TaskPriority priority : TaskPriority.values()) {
            byPriority.put(priority, taskRepository.countByPriority(priority));
        }

        long total = taskRepository.count();
        long completed = byStatus.get(TaskStatus.DONE);
        int completionRate = total == 0 ? 0 : (int) Math.round(completed * 100.0 / total);

        LocalDate today = LocalDate.now(clock);
        long overdue = taskRepository.countByDueDateBeforeAndStatusNot(today, TaskStatus.DONE);
        long dueThisWeek = taskRepository.countByDueDateBetweenAndStatusNot(today, today.plusDays(6), TaskStatus.DONE);

        List<TaskResponse> recent = taskRepository.findTop5ByOrderByUpdatedAtDesc().stream()
                .map(TaskResponse::from)
                .toList();
        List<TaskResponse> upcoming = taskRepository.findUpcomingOpenTasks().stream()
                .map(TaskResponse::from)
                .toList();

        return new DashboardStatsResponse(
                total,
                completed,
                total - completed,
                overdue,
                dueThisWeek,
                completionRate,
                teamMemberRepository.count(),
                byStatus,
                byPriority,
                recent,
                upcoming
        );
    }
}
