package com.taskmanager.controller;

import com.taskmanager.dto.TaskResponse;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @Test
    void createReturns201WithLocationHeader() throws Exception {
        TaskResponse created = new TaskResponse(42L, "Write tests", null, TaskStatus.TODO, TaskPriority.HIGH,
                LocalDate.of(2026, 1, 15), null, Instant.now(), Instant.now());
        when(taskService.create(any())).thenReturn(created);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Write tests","status":"TODO","priority":"HIGH","dueDate":"2026-01-15"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/tasks/42"))
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.dueDate").value("2026-01-15"));
    }

    @Test
    void createRejectsInvalidPayloadWithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"  ","priority":"HIGH"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.title").exists())
                .andExpect(jsonPath("$.fieldErrors.status").value("Status is required"));

        verifyNoInteractions(taskService);
    }

    @Test
    void createRejectsUnknownEnumValue() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Valid title","status":"BLOCKED","priority":"HIGH"}
                                """))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(taskService);
    }

    @Test
    void getReturns404WhenTaskMissing() throws Exception {
        when(taskService.findById(99L)).thenThrow(new ResourceNotFoundException("Task", 99L));

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Task with id 99 was not found"));
    }

    @Test
    void listRejectsInvalidStatusFilter() throws Exception {
        mockMvc.perform(get("/api/tasks").param("status", "NOPE"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void assignReturnsAssigneeSummary() throws Exception {
        TaskResponse.AssigneeSummary assignee = new TaskResponse.AssigneeSummary(7L, "Mei Lin", "mei.lin@example.com");
        TaskResponse updated = new TaskResponse(1L, "Write tests", null, TaskStatus.TODO, TaskPriority.HIGH,
                null, assignee, Instant.now(), Instant.now());
        when(taskService.assign(1L, 7L)).thenReturn(updated);

        mockMvc.perform(patch("/api/tasks/1/assignee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"teamMemberId":7}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignee.id").value(7))
                .andExpect(jsonPath("$.assignee.fullName").value("Mei Lin"));
    }

    @Test
    void assignNullUnassignsTask() throws Exception {
        TaskResponse unassigned = new TaskResponse(1L, "Write tests", null, TaskStatus.TODO, TaskPriority.HIGH,
                null, null, Instant.now(), Instant.now());
        when(taskService.assign(1L, null)).thenReturn(unassigned);

        mockMvc.perform(patch("/api/tasks/1/assignee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"teamMemberId":null}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignee").doesNotExist());
    }

    @Test
    void assignRejectsNonPositiveTeamMemberId() throws Exception {
        mockMvc.perform(patch("/api/tasks/1/assignee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"teamMemberId":0}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.teamMemberId").value("Team member id must be a positive number"));

        verifyNoInteractions(taskService);
    }

    @Test
    void assignReturns404WhenTeamMemberMissing() throws Exception {
        when(taskService.assign(1L, 99L)).thenThrow(new ResourceNotFoundException("Team member", 99L));

        mockMvc.perform(patch("/api/tasks/1/assignee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"teamMemberId":99}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Team member with id 99 was not found"));
    }
}
