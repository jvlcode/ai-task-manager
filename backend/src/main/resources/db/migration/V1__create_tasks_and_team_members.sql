CREATE TABLE tasks (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(150)  NOT NULL,
    description VARCHAR(2000),
    status      VARCHAR(20)   NOT NULL,
    priority    VARCHAR(20)   NOT NULL,
    due_date    DATE,
    created_at  TIMESTAMPTZ   NOT NULL,
    updated_at  TIMESTAMPTZ   NOT NULL,
    CONSTRAINT chk_tasks_status   CHECK (status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')),
    CONSTRAINT chk_tasks_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'))
);

CREATE INDEX idx_tasks_status   ON tasks (status);
CREATE INDEX idx_tasks_priority ON tasks (priority);
CREATE INDEX idx_tasks_due_date ON tasks (due_date);

CREATE TABLE team_members (
    id          BIGSERIAL PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    role        VARCHAR(100) NOT NULL,
    department  VARCHAR(100),
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uq_team_members_email UNIQUE (email)
);
