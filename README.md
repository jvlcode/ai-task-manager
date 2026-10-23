# TaskFlow — Task Management App

Full-stack task manager with a dashboard, task CRUD, task details and a team members page.

| Layer    | Stack                                                                 |
|----------|-----------------------------------------------------------------------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4, React Router 7          |
| Backend  | Spring Boot 4.1, Java 21, Maven (wrapper included), Spring Data JPA, Bean Validation, Flyway |
| Database | PostgreSQL (tested with 18)                                           |

> Tasks and team members are intentionally **independent** — there is no assignment
> relationship, endpoint or UI yet.

```
ai-task-manager/
├── backend/                 Spring Boot REST API
│   └── src/main/java/com/taskmanager/
│       ├── controller/      REST endpoints (Controller layer)
│       ├── service/         Business logic (Service layer)
│       ├── repository/      Spring Data JPA (Repository layer)
│       ├── model/           JPA entities + enums
│       ├── dto/             Request/response records with validation
│       ├── exception/       Error body + global exception handler
│       └── config/          CORS, Clock, sample data seeder
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/    Flyway SQL migrations
└── frontend/                React SPA
    └── src/
        ├── api/             Fetch client + typed API functions
        ├── components/      Layout, UI primitives, task form, icons
        ├── hooks/           useAsync data-loading hook
        ├── lib/             Formatting + style helpers
        └── pages/           Dashboard, Tasks, Task detail, Task form, Team
```

## Prerequisites

- **JDK 21 or newer** (`JAVA_HOME` must point to the JDK root folder, *not* its `bin` folder)
- **Node.js 20.19+ / 22.12+** and npm
- **PostgreSQL 14+**
- Maven is **not** required — use the included `mvnw` / `mvnw.cmd` wrapper.

## 1. PostgreSQL setup

Create a database and a dedicated user. Using `psql` as the `postgres` superuser:

```bash
psql -U postgres
```

```sql
CREATE USER taskmanager WITH PASSWORD 'taskmanager';
CREATE DATABASE taskmanager OWNER taskmanager;
\q
```

On Windows, `psql` lives in e.g. `C:\Program Files\PostgreSQL\18\bin\psql.exe`
(or use pgAdmin → *Create → Login/Group Role* and *Create → Database*).

You do **not** need to create tables. Flyway creates the schema on first start
(`db/migration/V1__create_tasks_and_team_members.sql`), and Hibernate validates it.

### Database configuration

The backend reads its connection settings from environment variables, with defaults matching the SQL above:

| Variable               | Default                                         |
|------------------------|-------------------------------------------------|
| `DB_URL`               | `jdbc:postgresql://localhost:5432/taskmanager`  |
| `DB_USERNAME`          | `taskmanager`                                   |
| `DB_PASSWORD`          | `taskmanager`                                   |
| `SERVER_PORT`          | `8080`                                          |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` (comma-separated)       |
| `SEED_DATA`            | `true`                                          |

## 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run            # macOS / Linux / Git Bash
mvnw.cmd spring-boot:run          # Windows cmd / PowerShell
```

With custom credentials (PowerShell example):

```powershell
$env:DB_USERNAME="postgres"; $env:DB_PASSWORD="your-password"; .\mvnw.cmd spring-boot:run
```

The API runs at **http://localhost:8080/api**. On first start, the log shows:

```
Successfully applied 1 migration to schema "public"
Seeded 12 sample tasks
Seeded 5 sample team members
```

Other useful commands:

```bash
./mvnw verify                     # compile + run tests + build jar
java -jar target/task-manager-backend-0.0.1-SNAPSHOT.jar
```

## 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` to `http://localhost:8080`,
so no extra configuration is needed.

```bash
npm run build      # type-check + production build into dist/
npm run lint       # oxlint
npm run preview    # serve the production build locally (uses the same /api proxy)
```

If you serve `dist/` without the Vite proxy, build with
`VITE_API_BASE_URL=http://localhost:8080/api` and add the frontend origin to `CORS_ALLOWED_ORIGINS`.

## Sample data

On startup, `DataSeeder` inserts **12 tasks** (all four statuses and all four priorities,
with due dates relative to today, so some are overdue and some are due soon) and **5 team members**.

**No duplicates on restart:** each table is seeded only when it is empty. Restarting never
re-inserts anything, and edits you make are preserved. (If you delete *every* task, the sample
tasks return on the next start. Set `SEED_DATA=false` to disable seeding entirely.)

## REST API

All endpoints are under `/api`. Request and response bodies are JSON.

### Tasks

| Method | Path                       | Description                                                       |
|--------|----------------------------|-------------------------------------------------------------------|
| GET    | `/tasks`                   | List tasks. Optional query: `status`, `priority`, `search`         |
| GET    | `/tasks/{id}`              | Get one task                                                      |
| POST   | `/tasks`                   | Create (201 + `Location` header)                                  |
| PUT    | `/tasks/{id}`              | Full update                                                       |
| PATCH  | `/tasks/{id}/status`       | Change only the status: `{"status":"DONE"}`                       |
| DELETE | `/tasks/{id}`              | Delete (204)                                                      |

Task payload:

```json
{
  "title": "Prepare release notes",
  "description": "Optional, max 2000 chars",
  "status": "TODO | IN_PROGRESS | IN_REVIEW | DONE",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "dueDate": "2026-11-01"
}
```

Validation: `title` is required, 3–150 chars. `status` and `priority` are required. `dueDate` is optional (ISO date).

### Team members

| Method | Path                   | Description                                  |
|--------|------------------------|----------------------------------------------|
| GET    | `/team-members`        | List members (sorted by name)                |
| GET    | `/team-members/{id}`   | Get one member                               |
| POST   | `/team-members`        | Create (409 if the email already exists)     |
| PUT    | `/team-members/{id}`   | Update                                       |
| DELETE | `/team-members/{id}`   | Delete (204)                                 |

Payload: `{"fullName": "...", "email": "...", "role": "...", "department": "optional"}`.
Emails are stored lower-cased and must be unique.

### Dashboard

`GET /dashboard/stats` returns totals, completion rate, overdue count, count due in the next 7 days,
counts by status and priority, the 5 most recently updated tasks, and the 5 nearest open deadlines.

### Errors

Every error returns the same shape:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/tasks",
  "fieldErrors": { "title": "Title is required" },
  "timestamp": "2026-10-15T06:30:14.211Z"
}
```

`400` validation, malformed JSON or invalid enum · `404` unknown id · `409` duplicate email · `500` unexpected.

## Troubleshooting

- **`The JAVA_HOME environment variable is not defined correctly`**: set `JAVA_HOME` to the JDK
  root (e.g. `C:\Program Files\Java\jdk-21`), not to `...\bin`.
- **`PKIX path building failed` when Maven downloads dependencies**: your network (antivirus or a
  corporate proxy) intercepts HTTPS. Tell Java to use the Windows certificate store:
  `$env:MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=Windows-ROOT"`, then re-run `mvnw.cmd`.
- **`password authentication failed for user "taskmanager"`**: create the user from step 1, or set
  `DB_USERNAME` / `DB_PASSWORD` to an existing account.
- **Frontend shows "Unable to reach the server"**: the backend isn't running on port 8080.
