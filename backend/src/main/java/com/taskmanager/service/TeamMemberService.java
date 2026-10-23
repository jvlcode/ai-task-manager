package com.taskmanager.service;

import com.taskmanager.dto.TeamMemberRequest;
import com.taskmanager.dto.TeamMemberResponse;
import com.taskmanager.exception.DuplicateResourceException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.TeamMember;
import com.taskmanager.repository.TeamMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;

    public TeamMemberService(TeamMemberRepository teamMemberRepository) {
        this.teamMemberRepository = teamMemberRepository;
    }

    public List<TeamMemberResponse> findAll() {
        return teamMemberRepository.findAllByOrderByFullNameAsc().stream()
                .map(TeamMemberResponse::from)
                .toList();
    }

    public TeamMemberResponse findById(Long id) {
        return TeamMemberResponse.from(getMember(id));
    }

    @Transactional
    public TeamMemberResponse create(TeamMemberRequest request) {
        String email = normalizeEmail(request.email());
        if (teamMemberRepository.existsByEmailIgnoreCase(email)) {
            throw duplicateEmail(email);
        }
        TeamMember member = new TeamMember(
                request.fullName().trim(),
                email,
                request.role().trim(),
                normalize(request.department())
        );
        return TeamMemberResponse.from(teamMemberRepository.save(member));
    }

    @Transactional
    public TeamMemberResponse update(Long id, TeamMemberRequest request) {
        TeamMember member = getMember(id);
        String email = normalizeEmail(request.email());
        if (teamMemberRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw duplicateEmail(email);
        }
        member.setFullName(request.fullName().trim());
        member.setEmail(email);
        member.setRole(request.role().trim());
        member.setDepartment(normalize(request.department()));
        return TeamMemberResponse.from(teamMemberRepository.saveAndFlush(member));
    }

    @Transactional
    public void delete(Long id) {
        teamMemberRepository.delete(getMember(id));
    }

    private TeamMember getMember(Long id) {
        return teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team member", id));
    }

    private static DuplicateResourceException duplicateEmail(String email) {
        return new DuplicateResourceException("email", "A team member with email " + email + " already exists");
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private static String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
