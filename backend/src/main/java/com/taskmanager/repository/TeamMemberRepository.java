package com.taskmanager.repository;

import com.taskmanager.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    List<TeamMember> findAllByOrderByFullNameAsc();
}
