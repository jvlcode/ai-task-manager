package com.taskmanager.service;

import com.taskmanager.dto.TaskResponse;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.model.TeamMember;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.TeamMemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @InjectMocks
    private TaskService service;

    private Task task() {
        return new Task("Write tests", null, TaskStatus.TODO, TaskPriority.MEDIUM, null);
    }

    private static TeamMember member(long id, String name) {
        TeamMember member = new TeamMember(name, name.toLowerCase().replace(' ', '.') + "@example.com", "Engineer", null);
        ReflectionTestUtils.setField(member, "id", id);
        return member;
    }

    @Test
    void assignSetsAssigneeAndReturnsSummary() {
        Task task = task();
        TeamMember ada = member(2L, "Ada Lovelace");
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(teamMemberRepository.findById(2L)).thenReturn(Optional.of(ada));
        when(taskRepository.saveAndFlush(task)).thenReturn(task);

        TaskResponse response = service.assign(1L, 2L);

        assertThat(task.getAssignee()).isSameAs(ada);
        assertThat(response.assignee()).isEqualTo(new TaskResponse.AssigneeSummary(2L, "Ada Lovelace", "ada.lovelace@example.com"));
    }

    @Test
    void reassignReplacesPreviousAssignee() {
        Task task = task();
        task.setAssignee(member(2L, "Ada Lovelace"));
        TeamMember grace = member(3L, "Grace Hopper");
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(teamMemberRepository.findById(3L)).thenReturn(Optional.of(grace));
        when(taskRepository.saveAndFlush(task)).thenReturn(task);

        TaskResponse response = service.assign(1L, 3L);

        assertThat(response.assignee().id()).isEqualTo(3L);
        assertThat(task.getAssignee()).isSameAs(grace);
    }

    @Test
    void assignNullUnassignsWithoutLookingUpMember() {
        Task task = task();
        task.setAssignee(member(2L, "Ada Lovelace"));
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.saveAndFlush(task)).thenReturn(task);

        TaskResponse response = service.assign(1L, null);

        assertThat(task.getAssignee()).isNull();
        assertThat(response.assignee()).isNull();
        verify(teamMemberRepository, never()).findById(any());
    }

    @Test
    void assignRejectsUnknownTeamMember() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task()));
        when(teamMemberRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.assign(1L, 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Team member");
        verify(taskRepository, never()).saveAndFlush(any());
    }

    @Test
    void assignRejectsUnknownTask() {
        when(taskRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.assign(5L, 2L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Task");
        verify(teamMemberRepository, never()).findById(any());
    }
}
