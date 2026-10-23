package com.taskmanager.service;

import com.taskmanager.dto.TeamMemberRequest;
import com.taskmanager.dto.TeamMemberResponse;
import com.taskmanager.exception.DuplicateResourceException;
import com.taskmanager.model.TeamMember;
import com.taskmanager.repository.TeamMemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeamMemberServiceTest {

    @Mock
    private TeamMemberRepository repository;

    @InjectMocks
    private TeamMemberService service;

    @Test
    void createNormalizesInput() {
        when(repository.existsByEmailIgnoreCase("ada@example.com")).thenReturn(false);
        when(repository.save(any(TeamMember.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TeamMemberResponse response = service.create(
                new TeamMemberRequest("  Ada Lovelace ", " Ada@Example.com ", "Engineer", "  "));

        assertThat(response.fullName()).isEqualTo("Ada Lovelace");
        assertThat(response.email()).isEqualTo("ada@example.com");
        assertThat(response.department()).isNull();
    }

    @Test
    void createRejectsDuplicateEmail() {
        when(repository.existsByEmailIgnoreCase("ada@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.create(
                new TeamMemberRequest("Ada Lovelace", "ada@example.com", "Engineer", null)))
                .isInstanceOf(DuplicateResourceException.class);
        verify(repository, never()).save(any());
    }
}
