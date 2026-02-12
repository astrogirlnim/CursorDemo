# Team Task Manager - Progressive Cursor Workshop Demo

A full-stack task management application demonstrating Cursor IDE capabilities through progressive feature development.

## Project Overview

This repository demonstrates building a production-ready Team Task Manager using Cursor IDE features. The application is built progressively across seven modules, with each module introducing new Cursor capabilities while adding functionality.

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Context + Hooks

### Testing & Quality
- **Backend Tests**: Jest + Supertest
- **Frontend Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright with MCP integration
- **Code Quality**: ESLint + Prettier

## Application Features

### Complete Feature Set

**User Management:**
- User registration and authentication
- JWT token-based sessions
- Protected routes and authorization

**Team Collaboration:**
- Create and manage teams
- Invite team members
- Team-based access control
- Team member roles

**Task Management:**
- Create, read, update, delete tasks
- Assign tasks to team members
- Set task status (todo, in progress, done)
- Set task priority (low, medium, high)
- Due dates and timestamps
- Task filtering by team

**Real-Time Features:**
- Live task updates via WebSockets
- Real-time team collaboration
- Instant notification of changes

**Quality Assurance:**
- 80%+ backend test coverage
- 75%+ frontend test coverage
- End-to-end test suite
- Visual regression testing

## Progressive Development Modules

This application is built across seven modules, each introducing new Cursor IDE features:

### Module 1: Setup with Cursor Rules
1. Create `.cursor/rules/` directory
2. Add project standards rule
3. Use Cursor Composer to generate scaffold
4. Run `npm install` in both directories

### Module 2: Building with Rules
1. Reference `@backend-api` rule
2. Use Composer to generate CRUD operations
3. Reference `@frontend-components` rule
4. Generate React components

### Module 3: Using Skills
1. Create authentication skill
2. Invoke skill with `@add-auth-feature`
3. Follow HITL checkpoints
4. Test authentication flow

### Module 4: Memory Bank Context
1. Create `memory-bank/` structure
2. Reference `@memory-bank` in prompts
3. Build team collaboration features

### Module 5: Deploy Subagents
1. Deploy Testing Subagent for test generation
2. Deploy Documentation Subagent for docs
3. Deploy Refactor Subagent for optimization

### Module 6: Documentation Indexing
1. Index React, Express, PostgreSQL docs
2. Use `@docs` in prompts
3. Build real-time features with WebSockets

### Module 7: MCP Integration
1. Configure Playwright MCP
2. Generate E2E tests
3. Run visual regression tests

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** version 18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** version 14 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager (comes with Node.js)
- **Git** for version control

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE team_task_manager;

# Exit psql
\q
```

#### Run Migrations

```bash
cd backend
npm install
npm run migrate
```

The migrations will create the following tables:
- `users` - User accounts with authentication
- `teams` - Team information
- `team_members` - Team membership junction table
- `tasks` - Task management with team assignments

### 3. Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/team_task_manager

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Security Note:** Generate a secure JWT secret for production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 5. Start Development Servers

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3000`

#### Start Frontend Server (in a new terminal)

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 6. Verify Installation

Open your browser and navigate to `http://localhost:5173`. You should see the Team Task Manager application.

Test the API directly:

```bash
# Health check (if implemented)
curl http://localhost:3000/api/health

# Register a test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234","name":"Test User"}'
```

## Architecture Overview

### Technology Stack

**Backend:**
- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database with ACID compliance
- **JWT** - Stateless authentication
- **bcrypt** - Password hashing (10 salt rounds)

**Frontend:**
- **React 18** - Component-based UI library
- **TypeScript** - Type-safe frontend development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Context** - Global state management

**Testing:**
- **Jest** - Unit testing framework
- **Supertest** - HTTP integration testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing

### Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── models/          # Database models with business logic
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Authentication, validation, error handling
│   │   ├── services/        # Business logic layer
│   │   ├── types/           # TypeScript type definitions
│   │   ├── migrations/      # Database schema migrations
│   │   └── index.ts         # Application entry point
│   ├── tests/               # Backend test suites
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Route-level page components
│   │   ├── contexts/        # React Context providers (Auth, Theme)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client functions
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # Root component
│   ├── tests/               # Frontend test suites
│   ├── package.json
│   └── tsconfig.json
├── docs/                    # Project documentation
│   ├── API_DOCUMENTATION.md
│   └── MODULE_PRDs/
├── memory_bank/             # Living context for Cursor AI
└── .cursor/                 # Cursor IDE configuration
    ├── rules/               # Project-wide coding standards
    └── skills/              # Executable workflows
```

### Design Patterns

**Backend:**
- **Repository Pattern** - Models encapsulate all database operations
- **Controller Pattern** - Separate HTTP handling from business logic
- **Middleware Chain** - Authentication, validation, error handling
- **Prepared Statements** - SQL injection prevention
- **DTO Pattern** - Data transfer objects for API contracts

**Frontend:**
- **Container/Presenter** - Separate logic from UI
- **Custom Hooks** - Reusable stateful logic
- **Context Pattern** - Global state management
- **Service Layer** - API abstraction

### Database Schema

**users**
- `id` (PK), `email` (unique), `password_hash`, `name`
- Indexes: email

**teams**
- `id` (PK), `name`, `owner_id` (FK → users)
- Indexes: owner_id

**team_members**
- `id` (PK), `team_id` (FK → teams), `user_id` (FK → users), `role`
- Indexes: team_id, user_id
- Unique constraint: (team_id, user_id)

**tasks**
- `id` (PK), `title`, `description`, `status`, `priority`
- `assignee_id` (FK → users), `creator_id` (FK → users)
- `team_id` (FK → teams, nullable)
- Indexes: created_at, team_id

**Cascade Behavior:**
- Delete user → Delete owned teams → Remove team members → Nullify task assignments
- Delete team → Remove team members → Nullify task team_id

### Authentication Flow

1. User registers or logs in
2. Server validates credentials
3. Server generates JWT token with user ID
4. Client stores token (localStorage)
5. Client includes token in Authorization header
6. Server validates token via middleware
7. Authenticated requests access protected resources

### Authorization Model

- **Public Routes** - Register, Login
- **Authenticated Routes** - All other endpoints
- **Team-Based Access** - Users can only access teams they're members of
- **Owner Permissions** - Only team owners can add/remove members and delete teams

## Development Workflow

### Branch Strategy

```bash
main          # Production-ready code
├── develop   # Integration branch
    ├── feature/auth-system
    ├── feature/team-management
    └── fix/task-validation
```

### Code Standards

**TypeScript:**
- Strict mode enabled
- Explicit return types for functions
- No `any` types (use `unknown` if needed)
- Interfaces for data structures

**Formatting:**
- ESLint + Prettier configured
- 2 spaces indentation
- Single quotes for strings
- Semicolons required

**Naming Conventions:**
- PascalCase: Components, Classes, Interfaces, Types
- camelCase: Variables, functions, methods
- UPPER_SNAKE_CASE: Constants, environment variables
- kebab-case: File names (except components)

### Running Migrations

#### Create a New Migration

```bash
cd backend/src/migrations
touch 006_migration_name.sql
```

#### Run All Migrations

```bash
cd backend
npm run migrate
```

#### Rollback Last Migration

```bash
cd backend
npm run migrate:rollback
```

### API Documentation

Comprehensive API documentation is available in `docs/API_DOCUMENTATION.md`.

Quick reference:

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Tasks:**
- `GET /api/tasks` - List all tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

**Teams:**
- `POST /api/teams` - Create team
- `GET /api/teams` - List user's teams
- `GET /api/teams/:id` - Get team with members
- `POST /api/teams/:id/members` - Add team member
- `DELETE /api/teams/:id/members/:userId` - Remove member
- `DELETE /api/teams/:id` - Delete team

See `docs/API_DOCUMENTATION.md` for detailed examples and error responses.

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Target: 80%+ coverage
```

**Test Structure:**
- Unit tests for models and services
- Integration tests for API endpoints
- Mock database for isolated testing

### Frontend Testing

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Target: 75%+ coverage
```

**Test Structure:**
- Component unit tests
- Hook testing
- Integration tests for user flows
- Mocked API responses

### End-to-End Testing (Module 7)

```bash
cd frontend

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/auth.spec.ts
```

**E2E Test Coverage:**
- User registration and login
- Task creation and management
- Team collaboration flows
- Error handling scenarios

### Manual Testing

Use the provided Postman collection or cURL commands from the API documentation.

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL

**Solutions:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Start PostgreSQL
sudo systemctl start postgresql   # Linux
brew services start postgresql    # macOS

# Verify connection
psql -U postgres -d team_task_manager

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

### Port Already in Use

**Problem:** Port 3000 or 5173 is already in use

**Solutions:**
```bash
# Find process using port 3000
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>          # macOS/Linux

# Or change port in .env (backend) or vite.config.ts (frontend)
```

### Migration Failures

**Problem:** Migration script fails

**Solutions:**
```bash
# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-14-main.log  # Linux
tail -f /usr/local/var/log/postgres.log             # macOS

# Reset database (WARNING: Destroys all data)
psql -U postgres
DROP DATABASE team_task_manager;
CREATE DATABASE team_task_manager;
\q

# Re-run migrations
cd backend
npm run migrate
```

### JWT Token Issues

**Problem:** "Invalid token" or "Not authenticated" errors

**Solutions:**
- Verify JWT_SECRET is set in backend/.env
- Check token is included in Authorization header: `Bearer <token>`
- Ensure token hasn't expired
- Clear localStorage and re-login
- Check for typos in the token

### CORS Errors

**Problem:** CORS policy blocking requests

**Solutions:**
```bash
# Verify FRONTEND_URL in backend/.env
FRONTEND_URL=http://localhost:5173

# Ensure frontend is using correct API URL in frontend/.env
VITE_API_URL=http://localhost:3000/api

# Restart both servers after .env changes
```

### TypeScript Compilation Errors

**Problem:** TypeScript errors prevent build

**Solutions:**
```bash
# Clear build cache
cd backend
rm -rf dist/
npm run build

cd frontend
rm -rf dist/
npm run build

# Update dependencies
npm update

# Check tsconfig.json settings
```

### Module Not Found Errors

**Problem:** Cannot find module or type definitions

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Install missing types
npm install --save-dev @types/express @types/node

# Check import paths are correct
```

### Performance Issues

**Problem:** Slow API response times

**Solutions:**
- Check database indexes are created
- Enable PostgreSQL query logging to find slow queries
- Implement connection pooling (already configured in pg pool)
- Add pagination for large result sets
- Use React.memo for expensive components

### Frontend Build Fails

**Problem:** Vite build errors

**Solutions:**
```bash
# Clear Vite cache
cd frontend
rm -rf node_modules/.vite

# Rebuild
npm run build

# Check for outdated dependencies
npm outdated
npm update
```

## Common Development Issues

### Adding New Dependencies

```bash
# Backend
cd backend
npm install package-name
npm install --save-dev @types/package-name

# Frontend
cd frontend
npm install package-name
```

### Database Schema Changes

1. Create new migration file
2. Write SQL for schema changes
3. Test migration on development database
4. Run migration: `npm run migrate`
5. Update TypeScript interfaces in models
6. Update affected tests

### Adding New API Endpoints

1. Define route in `backend/src/routes/`
2. Create controller method in `backend/src/controllers/`
3. Add model method in `backend/src/models/`
4. Add TypeScript types
5. Write tests
6. Update API documentation
7. Add frontend service function

## Workshop Commits

Each commit represents a workshop module:

1. **Initial commit**: Project setup and README
2. **Module 1**: Cursor Rules configuration
3. **Module 1**: Project scaffold
4. **Module 2**: CRUD operations
5. **Module 3**: Authentication system
6. **Module 4**: Team collaboration
7. **Module 5**: Tests and documentation
8. **Module 6**: Real-time updates
9. **Module 7**: E2E testing

## Cursor Features Demonstrated

1. **Cursor Rules** - Project-wide coding standards (.cursor/rules/*.mdc)
2. **Cursor Skills** - Executable multi-step workflows (.cursor/skills/*.md)
3. **Memory Bank** - Living project context (memory-bank/*.md)
4. **Subagents** - Specialized AI agents for parallel work
5. **Documentation Indexing** - Reference external framework docs
6. **MCP Integration** - Extend Cursor with tools (Playwright for E2E testing)

## Development Progression

Each module builds on the previous:

**Module 1 → 2:** Rules generate scaffold, then CRUD features  
**Module 2 → 3:** CRUD foundation enables authentication  
**Module 3 → 4:** Auth enables team collaboration  
**Module 4 → 5:** Features complete, add tests and docs  
**Module 5 → 6:** Quality established, add real-time  
**Module 6 → 7:** App functional, validate with E2E tests

## Production Quality Standards

**Code Quality:**
- ✅ TypeScript strict mode throughout
- ✅ Comprehensive input validation
- ✅ Structured error handling
- ✅ Security best practices (JWT, bcrypt, prepared statements)

**Testing:**
- ✅ 80%+ backend test coverage
- ✅ 75%+ frontend test coverage
- ✅ Complete E2E test suite
- ✅ Visual regression testing

**Documentation:**
- ✅ API documentation
- ✅ Architecture documentation
- ✅ Code comments and JSDoc
- ✅ README with setup instructions

**Performance:**
- ✅ Database query optimization
- ✅ Code splitting and lazy loading
- ✅ API response time < 200ms
- ✅ Build time < 30 seconds

## Learning Objectives

**By the end of this workshop, you will understand:**
- When to use Cursor Rules vs Skills vs Memory Bank
- How to structure rules for consistent code generation
- How to create Skills for complex multi-step workflows
- How to maintain project intelligence with Memory Bank
- How to deploy Subagents for specialized tasks
- How to leverage external documentation for better code
- How to integrate MCP servers for extended capabilities

**Key Insight:** Cursor's power comes from combining features - Rules ensure consistency, Skills handle complexity, Memory Bank provides intelligence, Subagents enable parallelization, and MCP extends capabilities.

---

**Workshop Version:** 1.0  
**Created:** February 2026  
**Purpose:** Progressive Cursor IDE Workshop Demonstration
