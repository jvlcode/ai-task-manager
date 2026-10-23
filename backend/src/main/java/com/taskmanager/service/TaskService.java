package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskResponse> findAll(TaskStatus status, TaskPriority priority, String search) {
        Specification<Task> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return taskRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "updatedAt")).stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse findById(Long id) {
        return TaskResponse.from(getTask(id));
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        Task task = new Task(
                request.title().trim(),
                normalize(request.description()),
                request.status(),
                request.priority(),
                request.dueDate()
        );
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = getTask(id);
        task.setTitle(request.title().trim());
        task.setDescription(normalize(request.description()));
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        return TaskResponse.from(taskRepository.saveAndFlush(task));
    }

    @Transactional
    public TaskResponse updateStatus(Long id, TaskStatus status) {
        Task task = getTask(id);
        task.setStatus(status);
        return TaskResponse.from(taskRepository.saveAndFlush(task));
    }

    @Transactional
    public void delete(Long id) {
        taskRepository.delete(getTask(id));
    }

    private Task getTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
    }

    private static String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
