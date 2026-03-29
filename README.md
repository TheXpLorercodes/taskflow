# taskflow

# ⬡ TaskFlow — Scalable REST API with Auth & RBAC

A production-ready backend API with JWT authentication, role-based access control, and a React frontend. Built for the Backend Developer Intern assignment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) + bcryptjs |
| Validation | express-validator |
| Docs | Swagger UI (`/api-docs`) |
| Frontend | React 18 + React Router v6 |
| DevOps | Docker + Docker Compose |
| Logging | Winston |
| Security | Helmet, CORS, Rate Limiting |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/         # DB + Swagger config
│   │   ├── controllers/    # authController, taskController
│   │   ├── middleware/     # auth, errorHandler, validate
│   │   ├── models/         # User, Task (Mongoose schemas)
│   │   ├── routes/         # authRoutes, taskRoutes
│   │   ├── utils/          # logger, apiResponse, jwtHelper
│   │   ├── validators/     # authValidator, taskValidator
│   │   ├── app.js
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, TaskCard, TaskModal, StatsBar
│   │   ├── context/        # AuthContext
│   │   ├── hooks/          # useTasks
│   │   ├── pages/          # Login, Register, Dashboard, Admin
│   │   ├── services/       # api.js (axios)
│   │   ├── App.js
│   │   └── index.css
│   ├── Dockerfile
│   └── nginx.conf
├── docs/
│   ├── POSTMAN_COLLECTION.json
│   └── SCALABILITY_NOTE.md
└── docker-compose.yml
```

---

## Quick Start

### Option A — Docker (Recommended)

```bash
git clone <your-repo>
cd taskflow

# Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET and JWT_REFRESH_SECRET

# Start all services
docker compose up --build
```

| Service | URL |
|---|---|
| API | http://localhost:5000 |
| Frontend | http://localhost:3000 |
| Swagger | http://localhost:5000/api-docs |
| Health | http://localhost:5000/health |

---

### Option B — Local Development

**Prerequisites:** Node.js 20+, MongoDB running locally

```bash
# Backend
cd backend
cp .env.example .env       # fill in your values
npm install
npm run dev                # starts on :5000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm start                  # starts on :3000
```

---

## API Overview

### Auth Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | ❌ | Register new user |
| POST | `/api/v1/auth/login` | ❌ | Login, get tokens |
| POST | `/api/v1/auth/refresh-token` | ❌ | Refresh access token |
| POST | `/api/v1/auth/logout` | ✅ | Logout, invalidate token |
| GET | `/api/v1/auth/me` | ✅ | Get own profile |
| PATCH | `/api/v1/auth/me` | ✅ | Update name |
| PATCH | `/api/v1/auth/change-password` | ✅ | Change password |

### Task Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/tasks` | ✅ | List tasks (paginated, filtered) |
| POST | `/api/v1/tasks` | ✅ | Create task |
| GET | `/api/v1/tasks/:id` | ✅ | Get single task |
| PATCH | `/api/v1/tasks/:id` | ✅ | Update task |
| DELETE | `/api/v1/tasks/:id` | ✅ | Delete task |
| GET | `/api/v1/tasks/stats` | ✅ | Task statistics |

### Admin Endpoints (role: admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/tasks/admin/users` | List all users |
| PATCH | `/api/v1/tasks/admin/users/:id/toggle` | Activate / deactivate user |

---

## Security Practices

- **Passwords**: bcrypt with cost factor 12
- **JWT**: Short-lived access tokens (7d) + long-lived refresh tokens (30d), stored server-side for revocation
- **Input sanitization**: express-validator with `.escape()` on all string fields
- **Headers**: Helmet sets CSP, HSTS, X-Frame-Options, etc.
- **Rate limiting**: 100 req/15min globally; 20 req/15min on auth routes
- **CORS**: Configured to allow only the `CLIENT_URL` origin
- **Payload limit**: 10kb max body size to prevent large payload attacks
- **Role check**: Middleware-enforced; admin routes 403 for non-admins

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | API port | `5000` |
| `MONGODB_URI` | MongoDB connection string | — |
| `JWT_SECRET` | Access token signing secret | — |
| `JWT_EXPIRES_IN` | Access token TTL | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | — |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `30d` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:3000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

---

## API Documentation

Interactive Swagger docs available at **http://localhost:5000/api-docs** when the server is running.

Import `docs/POSTMAN_COLLECTION.json` into Postman for a ready-to-use collection with auto-token capture.

---

## Frontend Features

- 🔐 Register & login with form validation + field-level error display
- 📊 Stats bar (total / pending / in-progress / completed / overdue)
- 📋 Task grid with search, filter by status & priority, pagination
- ✏️ Create / edit tasks in a modal (title, description, status, priority, due date, tags)
- 🗑 Delete with confirmation dialog
- ⚡ Inline status toggler on each card
- 🛡 Admin panel to view and toggle user status
- 🔄 Auto token refresh on 401 — seamless session extension

---

## Running Tests

```bash
cd backend
npm test
```

---

## Deployment Checklist

- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET` (32+ random chars)
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB Atlas or managed DB with backups
- [ ] Enable HTTPS (TLS termination at load balancer)
- [ ] Set `CLIENT_URL` to your production frontend domain
- [ ] Set up log rotation / centralized logging
- [ ] Configure health check monitoring

See `docs/SCALABILITY_NOTE.md` for scaling strategy.
