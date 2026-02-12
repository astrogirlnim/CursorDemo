# Technical Context: Team Task Manager

## Technology Stack

### Backend Stack

**Runtime & Framework:**
- Node.js: v18+ (LTS version)
- Express.js: v4.18.0 (Web framework)
- TypeScript: v5.0.0 (Language)

**Database:**
- PostgreSQL: v14+ (Relational database)
- pg: v8.11.0 (Node.js PostgreSQL client)
- Connection pooling with pg Pool

**Authentication & Security:**
- jsonwebtoken: v9.0.3 (JWT generation/verification)
- bcryptjs: v3.0.3 (Password hashing)
- cors: v2.8.5 (Cross-origin resource sharing)

**Development Tools:**
- ts-node: v10.9.0 (TypeScript execution)
- nodemon: v3.0.0 (Auto-restart on changes)
- TypeScript compiler (tsc)

### Frontend Stack

**Framework & Build:**
- React: v18.2.0 (UI library)
- React DOM: v18.2.0 (DOM rendering)
- Vite: v5.0.0 (Build tool and dev server)
- TypeScript: v5.0.0 (Language)

**Routing & State:**
- react-router-dom: v6.20.0 (Client-side routing)
- React Context API (Global state management)
- React Hooks (Local state management)

**Styling:**
- TailwindCSS: v3.4.0 (Utility-first CSS framework)
- PostCSS: v8.4.0 (CSS processing)
- Autoprefixer: v10.4.0 (CSS vendor prefixing)

**HTTP Client:**
- Fetch API (Native browser API)
- Custom service layer wrapper

### Development Environment

**Required Software:**
- Node.js v18+ with npm
- PostgreSQL v14+
- Git for version control
- Code editor (Cursor IDE)

**Operating Systems:**
- macOS (primary)
- Linux (supported)
- Windows with WSL2 (supported)

**Environment Variables:**

Backend (.env):
```
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Frontend (.env):
```
VITE_API_URL=http://localhost:3000
```

## Development Setup

### Initial Setup Steps

**1. Clone Repository:**
```bash
git clone <repository-url>
cd demo
```

**2. Database Setup:**
```bash
# Create PostgreSQL database
createdb taskmanager

# Or using psql
psql -U postgres -c "CREATE DATABASE taskmanager;"
```

**3. Backend Setup:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate  # Run database migrations
npm run dev      # Start development server
```

**4. Frontend Setup:**
```bash
cd frontend
npm install
npm run dev      # Start development server
```

**5. Verification:**
- Backend: http://localhost:3000/health
- Frontend: http://localhost:5173
- Test API: curl http://localhost:3000/api/tasks

### Development Workflow

**Backend Development:**
```bash
cd backend
npm run dev        # Start with hot reload
npm run migrate    # Run new migrations
npm run build      # Compile TypeScript
npm start          # Run production build
```

**Frontend Development:**
```bash
cd frontend
npm run dev        # Start dev server (port 5173)
npm run build      # Build for production
npm run preview    # Preview production build
```

**Database Management:**
```bash
# Connect to database
psql taskmanager

# Common queries
\dt                              # List tables
\d tasks                         # Describe tasks table
SELECT * FROM tasks;             # View all tasks
SELECT * FROM users;             # View all users

# Reset database (careful!)
dropdb taskmanager && createdb taskmanager
cd backend && npm run migrate
```

## Configuration Files

### Backend Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**package.json scripts:**
- `dev`: Development mode with hot reload
- `build`: Compile TypeScript to JavaScript
- `start`: Run compiled JavaScript
- `migrate`: Execute database migrations

### Frontend Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

**tailwind.config.js:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Database Schema

### Current Schema (Module 4 Complete)

**users table:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt hashed
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**tasks table:**
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' 
    CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(50) DEFAULT 'medium' 
    CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_team_id ON tasks(team_id);
```

**teams table:**
```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teams_owner_id ON teams(owner_id);

CREATE TRIGGER update_teams_updated_at 
  BEFORE UPDATE ON teams 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**team_members table:**
```sql
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
```

## Testing Infrastructure

### Backend Testing (Module 5)

**Framework:** Jest v29.0.0 + Supertest v6.3.0

**Test Structure:**
```
backend/src/
├── __tests__/
│   ├── models/
│   │   ├── user.model.test.ts
│   │   └── task.model.test.ts
│   ├── services/
│   │   └── auth.service.test.ts
│   └── controllers/
│       ├── auth.controller.test.ts
│       └── task.controller.test.ts
└── test-utils/
    ├── setup.ts
    └── db-mock.ts
```

**Test Database:**
- Separate test database: `taskmanager_test`
- Reset between test suites
- Seed with fixture data

### Frontend Testing (Module 5)

**Framework:** Jest v29.0.0 + React Testing Library v14.0.0

**Test Structure:**
```
frontend/src/
├── __tests__/
│   ├── components/
│   │   ├── TaskList.test.tsx
│   │   └── TaskForm.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   └── services/
│       └── task.service.test.ts
└── test-utils/
    ├── setup.ts
    └── test-providers.tsx
```

**Mocking Strategy:**
- Mock API calls with MSW (Mock Service Worker)
- Mock contexts for isolated component tests
- Mock timers for async operations

### E2E Testing (Module 7)

**Framework:** Playwright v1.40.0

**Test Structure:**
```
frontend/e2e/
├── auth.spec.ts          # Registration and login
├── tasks.spec.ts         # Task CRUD operations
├── teams.spec.ts         # Team collaboration
└── playwright.config.ts  # Playwright configuration
```

**Test Environment:**
- Headless browser mode for CI
- Headed mode for debugging
- Test user fixtures
- Database reset before each test

## Build and Deployment

### Build Process

**Backend Build:**
```bash
npm run build
# Output: dist/ directory with compiled JavaScript
```

**Frontend Build:**
```bash
npm run build
# Output: dist/ directory with optimized static assets
```

### Production Considerations

**Environment Variables:**
- Use secure secrets in production
- Never commit .env files
- Use environment-specific configs

**Database:**
- Enable SSL connections
- Use connection pooling
- Regular backups
- Monitoring and alerting

**Security:**
- HTTPS only in production
- Secure JWT secrets
- Rate limiting on API endpoints
- Input sanitization
- SQL injection prevention (prepared statements)

**Performance:**
- Enable gzip compression
- CDN for static assets
- Database query optimization
- Response caching where appropriate

## Development Tools

### Code Quality

**ESLint:** Linting for TypeScript/JavaScript
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ]
}
```

**Prettier:** Code formatting
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Cursor IDE Configuration

**Rules (.cursor/rules/):**
- team-task-manager-patterns.mdc
- nodejs-express-jwt-api.mdc
- typescript-react-vite.mdc
- tailwind-react-ui.mdc
- commit-messages.mdc
- npm-package-check.mdc
- (plus 7 more utility rules)

**Skills (.cursor/skills/):**
- add-auth-feature.md (JWT authentication workflow)

**Memory Bank (memory_bank/):**
- This directory with 6 core files

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register
Body: { email, password, name }
Returns: { user, token }

POST /api/auth/login
Body: { email, password }
Returns: { user, token }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Returns: { user }
```

### Task Endpoints

```
GET /api/tasks?team_id=1&status=todo&priority=high
Headers: Authorization: Bearer <token>
Query: team_id (number|'unassigned'), status, priority
Returns: { tasks: Task[] }

POST /api/tasks
Headers: Authorization: Bearer <token>
Body: { title, description?, status?, priority?, team_id, assignee_id? }
Returns: { task: Task }

GET /api/tasks/:id
Headers: Authorization: Bearer <token>
Returns: { task: Task }

PUT /api/tasks/:id
Headers: Authorization: Bearer <token>
Body: Partial<Task>
Returns: { task: Task }

DELETE /api/tasks/:id
Headers: Authorization: Bearer <token>
Returns: 204 No Content
```

### Team Endpoints

```
POST /api/teams
Headers: Authorization: Bearer <token>
Body: { name }
Returns: { team: Team }

GET /api/teams
Headers: Authorization: Bearer <token>
Returns: { teams: Team[] }

GET /api/teams/:id
Headers: Authorization: Bearer <token>
Returns: { team: TeamWithMembers }

POST /api/teams/:id/members
Headers: Authorization: Bearer <token>
Body: { userId }
Returns: { member: TeamMember }

DELETE /api/teams/:id/members/:userId
Headers: Authorization: Bearer <token>
Returns: 204 No Content

DELETE /api/teams/:id
Headers: Authorization: Bearer <token>
Returns: 204 No Content (owner only)
```

## Dependencies Overview

### Backend Dependencies

**Production:**
- express: Web server framework
- pg: PostgreSQL client
- bcryptjs: Password hashing
- jsonwebtoken: JWT creation/verification
- cors: CORS middleware
- dotenv: Environment variable loading

**Development:**
- typescript: Type system
- ts-node: TypeScript execution
- nodemon: Auto-restart server
- @types/*: TypeScript definitions

### Frontend Dependencies

**Production:**
- react: UI library
- react-dom: DOM renderer
- react-router-dom: Routing
- Native Fetch API: HTTP client

**Development:**
- vite: Build tool
- typescript: Type system
- tailwindcss: CSS framework
- postcss: CSS processing
- @types/*: TypeScript definitions

## Constraints and Limitations

### Technical Constraints
- Node.js 18+ required (uses modern JavaScript features)
- PostgreSQL 14+ required (uses modern SQL features)
- Modern browser required (ES2020 features)
- Minimum 2GB RAM for development

### Development Constraints
- Single database connection pool shared across requests
- JWT tokens don't support revocation (design limitation)
- Real-time updates require WebSocket support (Module 6)
- File uploads not supported (out of scope)

### Performance Constraints
- Target: API responses under 200ms
- Database connection pool max: 20 connections
- No pagination implemented yet (Module 2-3)
- No caching layer (future enhancement)

## Known Technical Debt

1. No pagination on list endpoints (will be slow with many tasks)
2. No database migration rollback support
3. JWT tokens don't enforce expiration (set but not checked)
4. No rate limiting on API endpoints
5. Error messages expose too much in development mode
6. No request logging middleware
7. No API versioning strategy
8. Team membership checks could be cached for performance

## Future Technical Enhancements

1. Add Redis for caching and session management
2. Implement GraphQL API alongside REST
3. Add WebSocket support for real-time updates
4. Implement server-side pagination and filtering
5. Add full-text search for tasks
6. Implement background job processing
7. Add comprehensive monitoring and observability
