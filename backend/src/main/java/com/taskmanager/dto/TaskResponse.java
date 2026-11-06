package com.taskmanager.dto;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.model.TeamMember;

import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        AssigneeSummary assignee,
        Instant createdAt,
        Instant updatedAt
) {

    /** Compact view of the assigned team member embedded in task responses. */
    public record AssigneeSummary(Long id, String fullName, String email) {

        static AssigneeSummary from(TeamMember member) {
            return member == null ? null : new AssigneeSummary(member.getId(), member.getFullName(), member.getEmail());
        }
    }

    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                AssigneeSummary.from(task.getAssignee()),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
