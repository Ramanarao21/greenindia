# TaskFlow - Project & Task Management API

A RESTful API backend for managing projects and tasks with user authentication, built with Node.js, Express, Prisma, and PostgreSQL.

---

## 1. Overview

**TaskFlow** is a backend API service that enables users to:
- Register and authenticate with JWT tokens
- Create and manage projects
- Create and assign tasks within projects
- Filter tasks by status and assignee
- Track project statistics

### Tech Stack
- **Runtime**: Node.js (v22+)
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma 6
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt (cost 12)
- **Language**: JavaScript (ES6 modules)

---

## 2. Architecture Decisions

### Layered Architecture
I chose a strict 3-layer architecture to separate concerns:

```
Routes → Controllers → Services → Prisma → Database
```

**Why?**
- **Maintainability**: Business logic is isolated in services, making it easy to test and modify
- **Reusability**: Services can be called from multiple controllers
- **Clarity**: Each layer has a single responsibility

**Tradeoffs:**
- More files and boilerplate for simple operations
- Slight performance overhead from extra function calls
- Worth it for maintainability in a growing codebase

### Database Design

**User → Project (1:many)**: One user owns many projects
**Project → Task (1:many)**: One project contains many tasks
**User → Task (1:many)**: One user can be assigned many tasks

**Key Decisions:**
- **Cascade Delete**: Deleting a project deletes all its tasks automatically
- **Soft Ownership**: Tasks track both project owner and task creator for flexible permissions
- **Optional Assignment**: Tasks can be unassigned (assignedTo is nullable)

### Authentication Strategy

**JWT with 24-hour expiration**
- **Why JWT?** Stateless, scalable, works well with microservices
- **Why 24 hours?** Balance between security and user convenience
- **Tradeoff**: Can't revoke tokens before expiry (would need Redis/database for blacklisting)

---

## 3. Running Locally

### Prerequisites
- Docker and Docker Compose installed
- Git installed

### Commands

```bash
# 1. Clone the repository
git clone https://github.com/your-name/taskflow
cd taskflow

# 2. Copy environment variables
cp .env.example .env

# 3. Start PostgreSQL database
docker-compose up -d

# 4. Install dependencies
npm install

# 5. Run database migrations
npx prisma migrate dev

# 6. Start the server
npm run dev
```

**App available at:** `http://localhost:3000`

**Health check:** `http://localhost:3000/health`

### Stopping the Application

```bash
# Stop the server: Ctrl+C

# Stop the database
docker-compose down
```

---

## 4. Running Migrations

Migrations do **not** run automatically on startup. You must run them manually:

```bash
# Run all pending migrations
npx prisma migrate dev

# Generate Prisma Client (if needed)
npx prisma generate

# View migration status
npx prisma migrate status

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Migration Files
Migrations are stored in `prisma/migrations/` and track schema changes over time.

---

## 5. Test Credentials

Use these credentials to test the API immediately:

```
Email:    test@example.com
Password: password123
```

**Note:** These are dummy credentials. You'll need to register this user first using the `/api/auth/register` endpoint, or create a seed script.

### Quick Test Flow

```bash
# 1. Register the test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 3. Use the token from step 2 for authenticated requests
```

---

## 6. API Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}

Response (201):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

---

### Project Endpoints

All project endpoints require `Authorization: Bearer <token>` header.

#### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Q2 2026 project"
}

Response (201):
{
  "id": "uuid",
  "name": "Website Redesign",
  "description": "Q2 2026 project",
  "ownerId": "uuid",
  "createdAt": "2026-04-13T12:00:00.000Z",
  "updatedAt": "2026-04-13T12:00:00.000Z"
}
```

#### List Projects
```http
GET /projects
Authorization: Bearer <token>

Response (200):
[
  {
    "id": "uuid",
    "name": "Website Redesign",
    "description": "Q2 2026 project",
    "ownerId": "uuid",
    "createdAt": "2026-04-13T12:00:00.000Z",
    "updatedAt": "2026-04-13T12:00:00.000Z",
    "tasks": [...]
  }
]
```

#### Get Project by ID
```http
GET /projects/:id
Authorization: Bearer <token>

Response (200):
{
  "id": "uuid",
  "name": "Website Redesign",
  "description": "Q2 2026 project",
  "ownerId": "uuid",
  "tasks": [...],
  "createdAt": "2026-04-13T12:00:00.000Z",
  "updatedAt": "2026-04-13T12:00:00.000Z"
}
```

#### Update Project
```http
PATCH /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}

Response (200):
{
  "id": "uuid",
  "name": "Updated Project Name",
  "description": "Updated description",
  "ownerId": "uuid",
  "createdAt": "2026-04-13T12:00:00.000Z",
  "updatedAt": "2026-04-13T14:00:00.000Z"
}
```

#### Delete Project
```http
DELETE /projects/:id
Authorization: Bearer <token>

Response (200):
{
  "message": "project deleted"
}
```

#### Get Project Statistics
```http
GET /projects/:id/stats
Authorization: Bearer <token>

Response (200):
{
  "totalTasks": 10,
  "byStatus": {
    "pending": 5,
    "in_progress": 3,
    "completed": 2
  },
  "byAssignee": {
    "user-uuid": 4,
    "unassigned": 6
  }
}
```

---

### Task Endpoints

All task endpoints require `Authorization: Bearer <token>` header.

#### Create Task
```http
POST /projects/:id/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design homepage",
  "description": "Create mockups",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-05-01T00:00:00.000Z",
  "assignedTo": "user-uuid"
}

Response (201):
{
  "id": "uuid",
  "title": "Design homepage",
  "description": "Create mockups",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-05-01T00:00:00.000Z",
  "projectId": "uuid",
  "assignedTo": "user-uuid",
  "createdBy": "user-uuid",
  "createdAt": "2026-04-13T12:30:00.000Z",
  "updatedAt": "2026-04-13T12:30:00.000Z"
}
```

#### List Tasks (with filters)
```http
GET /projects/:id/tasks
GET /projects/:id/tasks?status=pending
GET /projects/:id/tasks?assignee=user-uuid
GET /projects/:id/tasks?status=in_progress&assignee=user-uuid
Authorization: Bearer <token>

Response (200):
[
  {
    "id": "uuid",
    "title": "Design homepage",
    "status": "pending",
    "priority": "high",
    "assignee": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    ...
  }
]
```

#### Get Task by ID
```http
GET /tasks/:id
Authorization: Bearer <token>

Response (200):
{
  "id": "uuid",
  "title": "Design homepage",
  "description": "Create mockups",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-05-01T00:00:00.000Z",
  "projectId": "uuid",
  "assignedTo": "user-uuid",
  "createdBy": "user-uuid",
  "project": {...},
  "assignee": {...},
  "createdAt": "2026-04-13T12:30:00.000Z",
  "updatedAt": "2026-04-13T12:30:00.000Z"
}
```

#### Update Task
```http
PATCH /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "priority": "low"
}

Response (200):
{
  "id": "uuid",
  "title": "Design homepage",
  "status": "completed",
  "priority": "low",
  ...
}
```

#### Delete Task
```http
DELETE /tasks/:id
Authorization: Bearer <token>

Response (200):
{
  "message": "task deleted"
}
```

---

### Error Responses

#### 400 - Validation Failed
```json
{
  "error": "validation failed"
}
```

#### 401 - Unauthorized
```json
{
  "error": "unauthorized",
  "message": "No token provided"
}
```

#### 403 - Forbidden
```json
{
  "error": "forbidden"
}
```

#### 404 - Not Found
```json
{
  "error": "not found"
}
```

---

### Complete API Documentation

For detailed examples, error cases, and testing guide, see:
- **[COMPLETE_API_GUIDE.md](./COMPLETE_API_GUIDE.md)** - Full testing guide with all endpoints
- **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)** - Step-by-step testing instructions

---

## 7. What I'd Do With More Time

### Immediate Improvements (1-2 days)

1. **Structured Validation Errors**
   - Currently returns simple `{ error: "validation failed" }`
   - Would add field-level errors: `{ error: "validation failed", fields: { email: "is required" } }`
   - Use a validation library like Zod or Joi

2. **Comprehensive Logging**
   - Winston is installed but not configured
   - Would add structured logging with request IDs
   - Log levels: error, warn, info, debug
   - Log to files and console

3. **Integration Tests**
   - Add Jest + Supertest
   - Test all endpoints with real database (test container)
   - Minimum 80% code coverage
   - CI/CD pipeline with GitHub Actions

4. **Pagination**
   - Add `?page=1&limit=20` to list endpoints
   - Return metadata: `{ data: [...], page: 1, totalPages: 5, totalItems: 100 }`
   - Default limit of 50 items

### Medium-term Improvements (1 week)

5. **Refresh Tokens**
   - Short-lived access tokens (15 min)
   - Long-lived refresh tokens (7 days)
   - Stored in database for revocation

6. **Rate Limiting**
   - Use express-rate-limit
   - Different limits per endpoint type
   - Auth endpoints: 5 requests/15 min
   - API endpoints: 100 requests/15 min

7. **Input Sanitization**
   - Prevent XSS attacks
   - Sanitize all user inputs
   - Use libraries like DOMPurify or validator.js

8. **API Versioning**
   - Change routes to `/api/v1/*`
   - Allows breaking changes in v2 without affecting v1 users

9. **Database Indexing**
   - Add indexes on frequently queried fields
   - `email` (already unique, so indexed)
   - `projectId` in tasks
   - `status` and `assignedTo` for filtering

10. **Soft Deletes**
    - Add `deletedAt` field
    - Don't actually delete records
    - Allows recovery and audit trails

### Long-term Improvements (2+ weeks)

11. **Real-time Updates**
    - WebSocket support for live task updates
    - Notify team members when tasks change
    - Use Socket.io or native WebSockets

12. **File Uploads**
    - Attach files to tasks
    - Use S3 or similar object storage
    - Image thumbnails for previews

13. **Email Notifications**
    - Task assignments
    - Due date reminders
    - Project updates
    - Use SendGrid or AWS SES

14. **Advanced Permissions**
    - Role-based access control (RBAC)
    - Project members with different roles
    - Viewer, Editor, Admin roles

15. **Search & Filtering**
    - Full-text search across tasks
    - Advanced filters (date ranges, multiple statuses)
    - Use PostgreSQL full-text search or Elasticsearch

16. **Audit Logs**
    - Track all changes (who, what, when)
    - Immutable log table
    - Useful for compliance and debugging

17. **Performance Optimization**
    - Database query optimization
    - Caching with Redis
    - Response compression
    - CDN for static assets

18. **Documentation**
    - OpenAPI/Swagger spec
    - Interactive API docs
    - Postman collection
    - Architecture diagrams

### Shortcuts I Took

1. **No validation library**: Using manual checks instead of Zod/Joi
2. **Simple error messages**: Not providing detailed field-level errors
3. **No tests**: Would normally write tests first (TDD)
4. **No seed data**: Manual user creation instead of automated seeding
5. **Basic logging**: Console.log instead of structured logging
6. **No monitoring**: Would add APM (Application Performance Monitoring)
7. **Hardcoded values**: Some defaults could be environment variables
8. **No Docker for app**: Only database is containerized

### Quality vs. Speed Tradeoffs

I prioritized:
- ✅ **Clean architecture** over speed of development
- ✅ **Security basics** (bcrypt, JWT) over advanced features
- ✅ **Core functionality** over nice-to-haves
- ✅ **Readable code** over clever optimizations

This approach means the codebase is:
- Easy to understand and extend
- Production-ready for MVP
- Missing some enterprise features
- Ready for team collaboration

---

## Project Structure

```
taskflow/
├── prisma/
│   ├── migrations/          # Database migrations
│   └── schema.prisma        # Database schema
├── src/
│   ├── controllers/         # HTTP request handlers
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   └── task.controller.js
│   ├── services/            # Business logic
│   │   ├── auth.service.js
│   │   ├── project.service.js
│   │   └── task.service.js
│   ├── routes/              # API routes
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   └── task.routes.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.js
│   │   └── errorHandler.js
│   ├── utils/               # Helper functions
│   │   ├── hash.js
│   │   └── jwt.js
│   └── prisma/
│       └── client.js        # Prisma client instance
├── server.js                # Application entry point
├── .env                     # Environment variables
├── .env.example             # Environment template
├── docker-compose.yml       # PostgreSQL container
├── package.json             # Dependencies
└── README.md                # This file
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ramana21?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development
```

---

## License

MIT

---

## Contact

For questions or issues, please open an issue on GitHub.
