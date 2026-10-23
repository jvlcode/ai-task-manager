package com.taskmanager.dto;

import com.taskmanager.model.TeamMember;

import java.time.Instant;

public record TeamMemberResponse(
        Long id,
        String fullName,
        String email,
        String role,
        String department,
        Instant createdAt,
        Instant updatedAt
) {

    public static TeamMemberResponse from(TeamMember member) {
        return new TeamMemberResponse(
                member.getId(),
                member.getFullName(),
                member.getEmail(),
                member.getRole(),
                member.getDepartment(),
                member.getCreatedAt(),
                member.getUpdatedAt()
        );
    }
}
