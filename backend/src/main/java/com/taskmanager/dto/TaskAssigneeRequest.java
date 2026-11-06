package com.taskmanager.dto;

import jakarta.validation.constraints.Positive;

/**
 * Payload for assigning a task to a team member. A {@code null} teamMemberId unassigns the task.
 */
public record TaskAssigneeRequest(
        @Positive(message = "Team member id must be a positive number")
        Long teamMemberId
) {
}
