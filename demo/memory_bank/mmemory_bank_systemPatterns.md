# System Patterns: Team Task Manager

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                         │
│  React SPA (TypeScript + Vite + TailwindCSS)              │
│  - Components (UI) / Pages (Routes)                         │
│  - Contexts (Global State) / Services (API Client)          │
│  - Types (TypeScript Interfaces)                            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST + JWT
                         │ WebSocket (Module 6)
┌────────────────────────▼────────────────────────────────────┐
│                         SERVER TIER                         │
│  Express.js API (TypeScript + Node.js)                     │
│  - Routes (Endpoints) → Controllers (Logic)                 │
│  - Services (Business Logic) → Models (Data Access)         │
│  - Middleware (Auth, Validation, Error Handling)            │
└────────────────────────┬────────────────────────────────────┘
                         │ PostgreSQL Protocol
┌────────────────────────▼────────────────────────────────────┐
│                         DATA TIER                           │
│  PostgreSQL Database                                        │
│  - Tables (users, teams, team_members, tasks)              │
│  - Indexes (Performance) / Constraints (Integrity)          │
│  - Migrations (Schema Versioning)                           │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Rationale

**Backend: Express.js + TypeScript**
- Reason: Simple, flexible, widely understood
- Alternative Considered: NestJS (too complex for workshop)
- Benefits: Low boilerplate, clear patterns, easy debugging

**Database: PostgreSQL**
- Reason: Relational data model, ACID guarantees, proven reliability
- Alternative Considered: MongoDB (loses data integrity)
- Benefits: Foreign keys, transactions, mature tooling

**Frontend: React + Vite**
- Reason: Industry standard, fast dev server, modern tooling
- Alternative Considered: Next.js (adds unnecessary complexity)
- Benefits: Component reusability, large ecosystem, fast refresh

**Styling: TailwindCSS**
- Reason: Utility-first, fast development, consistent design
- Alternative Considered: CSS Modules (more boilerplate)
- Benefits: No context switching, responsive by default, small bundle

## Core Design Patterns

### Backend Patterns

#### 1. Model-Controller-Service Pattern
```
Request → Route → Controller → Service → Model → Database
         ↓
      Response
```

**Models (Data Access Layer):**
- Direct database interaction only
- Prepared statements for all queries
- Return typed data structures
- No business logic

**Services (Business Logic Layer):**
- Coordinate multiple models if needed
- Implement business rules
- Handle data transformation
- Return structured results

**Controllers (HTTP Handler Layer):**
- Parse request parameters
- Call service functions
- Format HTTP responses
- Handle HTTP status codes

**Benefits:**
- Clear separation of concerns
- Testable in isolation
- Easy to mock for testing
- Reusable business logic

#### 2. Repository Pattern (Models)
```typescript
// Pattern structure
export const taskModel = {
  findAll: () => Promise<Task[]>,
  findById: (id: number) => Promise<Task | null>,
  create: (data: TaskInput) => Promise<Task>,
  update: (id: number, data: Partial<TaskInput>) => Promise<Task | null>,
  delete: (id: number) => Promise<boolean>
};
```

**Benefits:**
- Consistent data access API
- Easy to swap data sources
- Simplified testing with mocks
- Single source of truth for queries

#### 3. Middleware Chain Pattern
```
Request → CORS → JSON Parser → Auth → Route Handler → Response
```

**Middleware Order (Critical):**
1. CORS configuration
2. Body parser (express.json)
3. Request logging
4. Authentication (JWT verification)
5. Authorization (permission checks)
6. Route handler
7. Error handler (catch-all)

#### 4. JWT Authentication Pattern
```
Login → Verify Credentials → Generate JWT → Return Token
Request → Extract Token → Verify Token → Attach User → Continue
```

**Implementation:**
- Password hashing with bcrypt (10 rounds)
- JWT includes: user_id, email, issued_at
- Token verification in auth middleware
- User object attached to request
- Protected routes require valid token

### Frontend Patterns

#### 1. Context + Hooks Pattern
```
AuthContext (Global State)
    ↓
Components consume via useAuth hook
    ↓
Automatic re-render on state change
```

**AuthContext Provides:**
- Current user state
- Login/logout functions
- Token management
- Loading and error states

**Benefits:**
- No prop drilling
- Centralized auth logic
- Easy to test components
- Clear data flow

#### 2. Protected Route Pattern
```typescript
<ProtectedRoute>
  <PrivateComponent />
</ProtectedRoute>
```

**Implementation:**
- Check authentication state
- Redirect to login if not authenticated
- Preserve intended destination
- Show loading during auth check

#### 3. Service Layer Pattern
```
Component → Service → Fetch API → Backend
           ↓
      Update State
```

**Service Responsibilities:**
- Centralize API calls
- Handle request configuration
- Parse responses
- Throw errors for error handling

**Benefits:**
- Single source for API endpoints
- Consistent error handling
- Easy to mock for testing
- Type-safe API client

#### 4. Component State Management Pattern
```
Component State:
  - data: null | T | T[]
  - loading: boolean
  - error: string | null
```

**Three-State Rendering:**
1. Loading: Show skeleton/spinner
2. Error: Show error message with retry
3. Success: Show data

**Benefits:**
- Consistent user experience
- Clear loading feedback
- Graceful error handling
- No undefined data access

## Database Design Patterns

### Schema Design Principles

**1. Normalized Design (3NF):**
- No duplicate data
- Every non-key attribute depends on the key
- Foreign keys enforce relationships

**2. Referential Integrity:**
```sql
-- Cascading deletes for dependent data
team_id REFERENCES teams(id) ON DELETE CASCADE

-- Set null for optional relationships  
assignee_id REFERENCES users(id) ON DELETE SET NULL
```

**3. Timestamp Tracking:**
- created_at: Record creation time
- updated_at: Last modification time
- Use NOW() for current timestamp
- Update updated_at in UPDATE queries

**4. Enum via CHECK Constraints:**
```sql
status VARCHAR(50) DEFAULT 'todo' 
  CHECK (status IN ('todo', 'in_progress', 'done'))
```

**Benefits:**
- Database-level validation
- Clear allowed values
- Type safety in queries
- Self-documenting schema

### Migration Pattern

**Structure:**
- Sequential numbered files: 001_, 002_, etc.
- One migration per schema change
- Idempotent where possible
- Reversible for rollback

**Execution:**
- Script reads migrations folder
- Tracks applied migrations
- Applies new migrations in order
- Logs success/failure

## Security Patterns

### 1. SQL Injection Prevention
```typescript
// ALWAYS use prepared statements with parameters
pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

// NEVER concatenate user input into queries
// BAD: `SELECT * FROM tasks WHERE id = ${id}`
```

### 2. Authentication Security
- Passwords hashed with bcrypt (never plain text)
- JWT tokens signed with secret key
- Tokens expire (implement expiration)
- No sensitive data in JWT payload

### 3. Authorization Pattern
```typescript
// Verify user owns resource or has permission
const task = await taskModel.findById(id);
if (task.creator_id !== req.user.id && task.assignee_id !== req.user.id) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### 4. Input Validation
- Server-side validation for all inputs
- Type checking with TypeScript
- Length limits on strings
- Required field validation
- Sanitization for XSS prevention

### 5. CORS Configuration
```typescript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

## Error Handling Patterns

### Backend Error Handling
```typescript
try {
  // Operation
  const result = await operation();
  res.json({ success: true, data: result });
} catch (error) {
  console.error('[Context] Error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Human-readable message',
    details: process.env.NODE_ENV === 'development' ? error : undefined
  });
}
```

### Frontend Error Handling
```typescript
try {
  setLoading(true);
  const data = await apiCall();
  setData(data);
  setError(null);
} catch (error) {
  setError(error.message || 'Something went wrong');
  console.error('[Component] Error:', error);
} finally {
  setLoading(false);
}
```

## Testing Patterns

### Backend Testing Strategy
- Unit tests for models and services
- Integration tests for API endpoints
- Mock database for unit tests
- Real database for integration tests
- Test coverage targets: 80%+

### Frontend Testing Strategy
- Unit tests for components
- Unit tests for hooks
- Integration tests for user flows
- Mock API calls in tests
- Test coverage targets: 75%+

### E2E Testing Strategy (Module 7)
- Playwright for browser automation
- Test critical user journeys
- Visual regression testing
- Run against staging environment

## Performance Patterns

### Backend Optimization
- Database connection pooling (max: 20)
- Indexed columns for frequent queries
- Prepared statement caching
- Response time target: <200ms

### Frontend Optimization
- Code splitting by route
- Lazy loading components
- Optimistic UI updates
- Debounced input handlers
- Memoized expensive computations

## Logging Pattern

**Structured Logging:**
```typescript
console.log('[Context] Action: details');
// Examples:
// [Database] Connected successfully
// [Auth] User logged in: user@example.com
// [Task] Creating task: "Implement feature X"
```

**Benefits:**
- Searchable logs
- Clear context
- Debugging easier
- Performance monitoring

## Deployment Pattern (Future)

**Build Process:**
1. TypeScript compilation
2. Asset bundling
3. Environment configuration
4. Database migrations
5. Health check verification

**Environment Structure:**
- Development: Local database, hot reload
- Staging: Shared database, production build
- Production: Managed database, optimized build

## API Design Patterns

### RESTful Conventions
```
GET    /api/tasks      → List all tasks
GET    /api/tasks/:id  → Get one task
POST   /api/tasks      → Create task
PUT    /api/tasks/:id  → Update task (full)
PATCH  /api/tasks/:id  → Update task (partial)
DELETE /api/tasks/:id  → Delete task
```

### Response Format
```typescript
// Success
{
  success: true,
  data: T | T[],
  message?: string
}

// Error
{
  success: false,
  error: string,
  details?: object
}
```

### Status Code Conventions
- 200: Success (GET, PUT, PATCH)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request (validation)
- 401: Unauthorized (auth missing)
- 403: Forbidden (auth insufficient)
- 404: Not Found
- 500: Server Error

## Code Organization Pattern

### Backend Structure
```
backend/src/
├── config/         # Configuration (database, env)
├── middleware/     # Express middleware (auth, validation)
├── models/         # Data access layer
├── services/       # Business logic layer
├── controllers/    # HTTP handlers
├── routes/         # Route definitions
├── types/          # TypeScript types
├── migrations/     # Database migrations
├── scripts/        # Utility scripts
└── index.ts        # Application entry point
```

### Frontend Structure
```
frontend/src/
├── components/     # Reusable UI components
├── pages/          # Route-level components
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── services/       # API client services
├── types/          # TypeScript interfaces
├── utils/          # Utility functions
├── App.tsx         # Root component with routing
└── main.tsx        # Application entry point
```

## Key Technical Decisions

### Decision: TypeScript Strict Mode
**Rationale:** Catch errors at compile time, better IDE support, self-documenting code  
**Tradeoff:** More upfront type definition work  
**Result:** Higher code quality, fewer runtime errors

### Decision: PostgreSQL Over MongoDB
**Rationale:** Relational data model fits domain, need referential integrity  
**Tradeoff:** More schema rigidity  
**Result:** Data consistency guaranteed, clear relationships

### Decision: JWT Over Sessions
**Rationale:** Stateless auth, easier to scale, mobile-friendly  
**Tradeoff:** Token revocation complexity  
**Result:** Simple auth flow, scalable architecture

### Decision: Monorepo Structure
**Rationale:** Single repository, shared types, coordinated changes  
**Tradeoff:** More complex build process  
**Result:** Easier development, version consistency

### Decision: TailwindCSS Over CSS Modules
**Rationale:** Faster development, consistent design system, no CSS files  
**Tradeoff:** HTML looks cluttered  
**Result:** Rapid UI development, maintainable styles
