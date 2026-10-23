package com.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload for creating or updating a team member.
 */
public record TeamMemberRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 150, message = "Email must be at most 150 characters")
        String email,

        @NotBlank(message = "Role is required")
        @Size(max = 100, message = "Role must be at most 100 characters")
        String role,

        @Size(max = 100, message = "Department must be at most 100 characters")
        String department
) {
}
