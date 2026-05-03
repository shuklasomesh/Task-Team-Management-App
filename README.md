# TaskFlow — Team Task Manager

A full-stack team task management application with role-based access control, built with **Spring Boot**, **React**, and **PostgreSQL**.

---

## Problem Statement

Modern teams struggle to coordinate work across projects without a centralized system. TaskFlow solves this by providing a platform where:
- **Admins** can create projects, manage team membership, and have full visibility
- **Members** can view assigned projects, create tasks, track progress, and collaborate
- Everyone gets a real-time dashboard showing overdue work, task distribution, and project health

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Auth | JWT (JSON Web Tokens) |
| Frontend | React 18, Vite, Tailwind CSS |
| Charts | Recharts |
| Database | PostgreSQL |
| Deployment | Railway (Docker) |

---

## Features

### Authentication & Authorization
- JWT-based login/register with BCrypt password hashing
- Two global roles: **ADMIN** (full access) and **MEMBER** (project-scoped)
- Project-level roles: **Project Admin** and **Project Member**

### Projects
- Create, update, delete projects (owner/admin only)
- Invite/remove team members with role assignment
- Project status: Active, Completed, Archived
- Progress tracking (completed vs total tasks)

### Tasks
- Full CRUD with title, description, status, priority, due date, assignee
- Status flow: `TODO → IN_PROGRESS → IN_REVIEW → DONE`
- Priority levels: LOW, MEDIUM, HIGH, URGENT
- Overdue detection (past due date and not DONE)
- Inline status update via dropdown

### Dashboard
- Summary stats: projects, tasks, in-progress, overdue
- Bar chart: tasks by status
- Pie chart: tasks by priority
- Recent tasks and overdue alerts

---

## Local Development

### Prerequisites
- Java 17+
- Node.js 20+
- PostgreSQL running on port 2109 (or update config)

### Backend

```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### With Docker Compose (full stack)

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# DB:       localhost:2109
```

---

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `jdbc:postgresql://localhost:2109/ethara` | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | `postgres` | DB username |
| `DATABASE_PASSWORD` | `2109` | DB password |
| `JWT_SECRET` | (64-char hex) | JWT signing secret |
| `JWT_EXPIRATION` | `86400000` | Token expiry (ms, default 24h) |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `PORT` | `8080` | Server port |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}` | Get project detail |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |
| POST | `/api/projects/{id}/members` | Add member |
| DELETE | `/api/projects/{id}/members/{userId}` | Remove member |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks/my` | Get my tasks |
| GET | `/api/tasks/project/{id}` | Get project tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| PATCH | `/api/tasks/{id}/status` | Update status only |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Get dashboard stats |

---

## Deployment on Railway

### Backend Service
1. Create new service → **Deploy from GitHub repo** → select `backend/` folder
2. Set environment variables:
   ```
   DATABASE_URL=jdbc:postgresql://<railway-pg-host>:<port>/railway
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=<railway-pg-password>
   JWT_SECRET=<your-64-char-secret>
   CORS_ORIGINS=https://<your-frontend-url>
   ```
3. Railway auto-detects the Dockerfile and builds

### Frontend Service
1. Create new service → select `frontend/` folder
2. Set build variable:
   ```
   VITE_API_URL=https://<your-backend-railway-url>/api
   ```

### PostgreSQL (Railway built-in)
- Add a **PostgreSQL plugin** in Railway
- Copy the `DATABASE_URL` from the plugin into the backend service env vars

---

## Database Schema

```
users          → id, name, email, password, role, created_at
projects       → id, name, description, status, owner_id, created_at
project_members → id, project_id, user_id, project_role, joined_at
tasks          → id, title, description, status, priority, due_date,
                 project_id, assignee_id, creator_id, created_at
```

---

## Project Structure

```
├── backend/                  # Spring Boot API
│   ├── src/main/java/com/taskmanager/
│   │   ├── config/           # Security, CORS
│   │   ├── controller/       # REST controllers
│   │   ├── dto/              # Request/Response DTOs
│   │   ├── exception/        # Global error handling
│   │   ├── model/            # JPA entities
│   │   ├── repository/       # Spring Data repos
│   │   ├── security/         # JWT filter, UserDetails
│   │   └── service/          # Business logic
│   └── Dockerfile
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/              # Axios client & endpoints
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # Auth context
│   │   └── pages/            # Dashboard, Projects, Tasks
│   └── Dockerfile
├── docker-compose.yml        # Local full-stack setup
└── README.md
```
