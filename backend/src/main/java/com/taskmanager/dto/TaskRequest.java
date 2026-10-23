package com.taskmanager.dto;

import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Payload for creating or fully updating a task.
 */
public record TaskRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
        String title,

        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        @NotNull(message = "Status is required")
        TaskStatus status,

        @NotNull(message = "Priority is required")
        TaskPriority priority,

        LocalDate dueDate
) {
}
