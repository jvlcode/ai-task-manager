ALTER TABLE tasks
    ADD COLUMN assignee_id BIGINT NULL,
    ADD CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id)
        REFERENCES team_members (id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_assignee_id ON tasks (assignee_id);
