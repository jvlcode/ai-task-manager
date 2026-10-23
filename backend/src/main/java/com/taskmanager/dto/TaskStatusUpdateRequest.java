package com.taskmanager.dto;

import com.taskmanager.model.TaskStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Payload for changing only the status of a task.
 */
public record TaskStatusUpdateRequest(
        @NotNull(message = "Status is required")
        TaskStatus status
) {
}
