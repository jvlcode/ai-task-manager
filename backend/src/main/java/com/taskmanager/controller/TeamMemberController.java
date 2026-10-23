package com.taskmanager.controller;

import com.taskmanager.dto.TeamMemberRequest;
import com.taskmanager.dto.TeamMemberResponse;
import com.taskmanager.service.TeamMemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/team-members")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    public TeamMemberController(TeamMemberService teamMemberService) {
        this.teamMemberService = teamMemberService;
    }

    @GetMapping
    public List<TeamMemberResponse> list() {
        return teamMemberService.findAll();
    }

    @GetMapping("/{id}")
    public TeamMemberResponse get(@PathVariable Long id) {
        return teamMemberService.findById(id);
    }

    @PostMapping
    public ResponseEntity<TeamMemberResponse> create(@Valid @RequestBody TeamMemberRequest request) {
        TeamMemberResponse created = teamMemberService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public TeamMemberResponse update(@PathVariable Long id, @Valid @RequestBody TeamMemberRequest request) {
        return teamMemberService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        teamMemberService.delete(id);
    }
}
