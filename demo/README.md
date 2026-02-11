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

## Testing

```bash
# Backend unit tests
cd backend
npm test

# Frontend unit tests
cd frontend
npm test

# E2E tests (Module 7)
cd frontend
npm run test:e2e
```

## API Endpoints (Module 2+)

### Authentication (Module 3)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks (Module 2)
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Teams (Module 4)
- `POST /api/teams` - Create team
- `GET /api/teams` - List user's teams
- `GET /api/teams/:id` - Get team details
- `POST /api/teams/:id/members` - Add member
- `DELETE /api/teams/:id/members/:userId` - Remove member

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
