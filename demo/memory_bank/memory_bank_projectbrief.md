# Project Brief: Team Task Manager

## Project Identity

**Name:** Team Task Manager  
**Type:** Full-stack web application  
**Purpose:** Progressive demonstration of Cursor IDE capabilities through a production-ready task management system  
**Workshop Context:** This is a demo project for a Cursor IDE workshop teaching 7 modules of progressive feature development

## Core Requirements

### Business Requirements
1. Enable team-based task management with collaborative features
2. Provide secure user authentication and authorization
3. Support real-time task updates across team members
4. Maintain production-quality code standards throughout development
5. Demonstrate Cursor IDE features progressively across modules

### Technical Requirements
1. Full-stack TypeScript application
2. RESTful API with PostgreSQL database
3. JWT-based authentication
4. React frontend with modern UI
5. Real-time WebSocket communication
6. 80%+ backend test coverage, 75%+ frontend test coverage
7. End-to-end testing with Playwright

### Feature Requirements

**User Management:**
- User registration with email and password
- User login with JWT token generation
- Password hashing with bcrypt
- Protected routes requiring authentication

**Task Management:**
- Create tasks with title, description, status, priority, due date
- Read tasks (list all, get by ID)
- Update task details
- Delete tasks
- Assign tasks to team members
- Filter tasks by team, status, priority

**Team Collaboration:**
- Create teams
- Invite members to teams
- Team-based access control
- Team member roles and permissions
- List user's teams

**Real-Time Features:**
- Live task updates via WebSockets
- Real-time notifications
- Instant collaboration updates

## Success Criteria

### Module Completion Checkpoints
1. Module 1: Project scaffold runs successfully
2. Module 2: CRUD operations fully functional
3. Module 3: Authentication system working
4. Module 4: Team collaboration features complete
5. Module 5: Test coverage targets met
6. Module 6: Real-time features operational
7. Module 7: E2E tests passing

### Quality Metrics
- TypeScript strict mode with no errors
- All API endpoints respond under 200ms
- Database queries use prepared statements
- Zero security vulnerabilities in dependencies
- Mobile-responsive UI
- Comprehensive error handling
- Extensive logging for debugging

### Code Quality Standards
- Follow all Cursor rules defined in .cursor/rules/
- Use prepared statements for all database queries
- Never trust client-sent user IDs
- Validate all inputs server-side
- Return structured API responses
- Log all operations with context
- Handle all three states: loading, error, success

## Scope Boundaries

### In Scope
- Task CRUD operations
- User authentication and authorization
- Team creation and member management
- Real-time task updates
- RESTful API design
- React-based SPA frontend
- PostgreSQL database

### Out of Scope
- Email notifications
- File attachments
- Task comments or discussions
- Calendar integration
- Mobile native apps
- Third-party integrations
- Payment processing
- Multi-language support

## Project Constraints

### Technical Constraints
- Must use Node.js 18+
- Must use PostgreSQL (not MongoDB or other NoSQL)
- Must use TypeScript (not JavaScript)
- Must use JWT for authentication (not sessions)
- Must use TailwindCSS for styling
- Must follow RESTful API conventions

### Development Constraints
- Progressive module-by-module development
- Each module introduces new Cursor IDE feature
- Must commit after each module completion
- Must maintain working state between modules
- Cannot skip modules or features

### Workshop Constraints
- Code must be understandable by workshop participants
- Each module builds on previous module
- Demonstrate specific Cursor features per module
- Balance between simplicity and production quality

## Key Stakeholders

**Primary Users:** Workshop participants learning Cursor IDE  
**Secondary Users:** Developers looking for full-stack TypeScript examples  
**Instructor:** Needs clear progression and demonstrable Cursor features  
**End Users (fictional):** Teams needing collaborative task management

## Workshop Learning Objectives

By completing this project, participants will understand:
1. When to use Cursor Rules vs Skills vs Memory Bank
2. How to structure rules for consistent code generation
3. How to create Skills for complex multi-step workflows
4. How to maintain project intelligence with Memory Bank
5. How to deploy Subagents for specialized tasks
6. How to leverage external documentation for better code
7. How to integrate MCP servers for extended capabilities

## Project Philosophy

This project demonstrates that Cursor's power comes from combining features:
- Rules ensure consistency
- Skills handle complexity
- Memory Bank provides intelligence
- Subagents enable parallelization
- MCP extends capabilities

Every line of code serves both as functional application code and as teaching material.
