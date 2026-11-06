package com.taskmanager.repository;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    long countByStatus(TaskStatus status);

    long countByPriority(TaskPriority priority);

    long countByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus status);

    long countByDueDateBetweenAndStatusNot(LocalDate from, LocalDate to, TaskStatus status);

    /** Fetches the assignee in the same query so mapping responses does not issue one query per task. */
    @Override
    @EntityGraph(attributePaths = "assignee")
    List<Task> findAll(Specification<Task> spec, Sort sort);

    @EntityGraph(attributePaths = "assignee")
    List<Task> findTop5ByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = "assignee")
    @Query("""
            select t from Task t
            where t.status <> com.taskmanager.model.TaskStatus.DONE and t.dueDate is not null
            order by t.dueDate asc
            limit 5
            """)
    List<Task> findUpcomingOpenTasks();
}
