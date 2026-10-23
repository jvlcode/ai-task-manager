package com.taskmanager.config;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.model.TeamMember;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.TeamMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

/**
 * Inserts sample tasks and team members on startup.
 * <p>
 * Each table is seeded only when it is empty, so restarting the application never creates duplicates
 * and data edited by users is left untouched.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final TaskRepository taskRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final Clock clock;

    public DataSeeder(TaskRepository taskRepository, TeamMemberRepository teamMemberRepository, Clock clock) {
        this.taskRepository = taskRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedTasks();
        seedTeamMembers();
    }

    private void seedTasks() {
        if (taskRepository.count() > 0) {
            log.info("Tasks already present, skipping task seed");
            return;
        }
        // Due dates are relative to today so the dashboard always shows a realistic mix
        // of overdue, upcoming and completed work.
        LocalDate today = LocalDate.now(clock);
        List<Task> tasks = List.of(
                new Task("Set up CI/CD pipeline",
                        "Configure GitHub Actions to build, test and deploy the backend and frontend on every merge to main.",
                        TaskStatus.DONE, TaskPriority.HIGH, today.minusDays(10)),
                new Task("Design database schema",
                        "Model tasks and team members, define indexes and write the initial Flyway migration.",
                        TaskStatus.DONE, TaskPriority.URGENT, today.minusDays(14)),
                new Task("Implement JWT authentication",
                        "Add login and token refresh endpoints and secure the REST API with Spring Security.",
                        TaskStatus.IN_PROGRESS, TaskPriority.URGENT, today.plusDays(2)),
                new Task("Build dashboard charts",
                        "Show task distribution by status and priority on the dashboard with responsive charts.",
                        TaskStatus.IN_PROGRESS, TaskPriority.HIGH, today.plusDays(5)),
                new Task("Write API documentation",
                        "Document every REST endpoint with request/response examples using OpenAPI.",
                        TaskStatus.TODO, TaskPriority.MEDIUM, today.plusDays(12)),
                new Task("Fix date picker timezone bug",
                        "Due dates shift by one day for users in negative UTC offsets. Reproduce and fix.",
                        TaskStatus.IN_REVIEW, TaskPriority.HIGH, today.minusDays(1)),
                new Task("Add dark mode support",
                        "Introduce a theme toggle and make sure all components meet contrast guidelines in dark mode.",
                        TaskStatus.TODO, TaskPriority.LOW, today.plusDays(30)),
                new Task("Optimize task list query",
                        "The task list endpoint is slow with large datasets. Add pagination and review query plans.",
                        TaskStatus.TODO, TaskPriority.MEDIUM, today.minusDays(3)),
                new Task("Conduct accessibility audit",
                        "Run axe and manual keyboard/screen-reader testing on all pages and log findings.",
                        TaskStatus.IN_REVIEW, TaskPriority.MEDIUM, today.plusDays(4)),
                new Task("Prepare sprint demo",
                        "Create a short walkthrough of the new features for stakeholders.",
                        TaskStatus.TODO, TaskPriority.HIGH, today.plusDays(6)),
                new Task("Upgrade frontend dependencies",
                        "Bump React, Vite and Tailwind to their latest versions and resolve breaking changes.",
                        TaskStatus.DONE, TaskPriority.LOW, today.minusDays(5)),
                new Task("Set up error monitoring",
                        "Integrate an error tracking service for both frontend and backend with release tagging.",
                        TaskStatus.TODO, TaskPriority.URGENT, null)
        );
        taskRepository.saveAll(tasks);
        log.info("Seeded {} sample tasks", tasks.size());
    }

    private void seedTeamMembers() {
        if (teamMemberRepository.count() > 0) {
            log.info("Team members already present, skipping team member seed");
            return;
        }
        List<TeamMember> members = List.of(
                new TeamMember("Priya Sharma", "priya.sharma@example.com", "Engineering Manager", "Engineering"),
                new TeamMember("Daniel Okafor", "daniel.okafor@example.com", "Senior Backend Engineer", "Engineering"),
                new TeamMember("Mei Lin", "mei.lin@example.com", "Frontend Engineer", "Engineering"),
                new TeamMember("Lucas Fernandes", "lucas.fernandes@example.com", "Product Designer", "Design"),
                new TeamMember("Sara Novak", "sara.novak@example.com", "QA Engineer", "Quality Assurance")
        );
        teamMemberRepository.saveAll(members);
        log.info("Seeded {} sample team members", members.size());
    }
}
