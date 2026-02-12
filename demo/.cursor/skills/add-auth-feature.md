---
name: Add JWT Authentication
description: Implements complete JWT authentication system with registration, login, and protected routes
tools: [composer, terminal]
globs: ["backend/src/**", "frontend/src/**"]
---

# Add JWT Authentication Skill

## Overview
This skill implements a complete JWT-based authentication system including:
- User registration and login
- Password hashing with bcrypt
- JWT token generation and validation
- Protected route middleware
- Frontend login/signup forms
- Token storage and refresh

## What Are Cursor Skills?

**Cursor Skills are executable, multi-step workflows** that guide AI through complex feature implementation with human checkpoints.

**Key Differences from Rules:**
- **Rules**: Coding standards applied automatically (passive)
- **Skills**: Step-by-step procedures you invoke explicitly (active)

**Skills provide:**
- Structured workflows with dependencies
- HITL (Human-in-the-Loop) checkpoints for validation
- Tool specifications (composer, terminal, browser)
- Preconditions and success criteria
- Context for complex multi-file features

**When to use Skills:**
- Complex features requiring multiple coordinated changes
- Features with specific implementation order
- Tasks requiring validation between steps
- Workflows you'll repeat across projects

## Preconditions
- Express backend must exist at `backend/src/index.ts`
- PostgreSQL database must be configured
- React frontend must exist at `frontend/src/`
- Packages installed: express, pg, react

## Steps

### Step 1: Install Authentication Dependencies
**Action:** Install required npm packages for JWT and password hashing

```bash
cd backend
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

**Validation:** 
- Check `backend/package.json` contains jsonwebtoken and bcryptjs
- Run `npm list jsonwebtoken bcryptjs` to verify installation

**HITL Checkpoint:** Confirm packages installed before proceeding

---

### Step 2: Create Users Database Migration
**Action:** Create SQL migration for users table

**File:** `backend/src/migrations/002_create_users_table.sql`

**Requirements:**
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Action:** Run migration
```bash
cd backend
npm run migrate
```

**Validation:**
- Verify users table exists: `psql taskmanager -c "\dt"`
- Check schema: `psql taskmanager -c "\d users"`

**HITL Checkpoint:** Review users table structure before proceeding

---

### Step 3: Create User Model
**Action:** Create user database model with password hashing

**File:** `backend/src/models/user.model.ts`

**Requirements:**
```typescript
interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

interface UserResponse {
  id: number;
  email: string;
  name: string;
  created_at: Date;
}

// Model functions:
- createUser(data: CreateUserDTO): Promise<User>
  - Hash password with bcrypt (10 salt rounds)
  - Insert into database
  - Return user (with hash for auth service)
  
- findByEmail(email: string): Promise<User | null>
  - Query by email
  - Return user or null
  
- findById(id: number): Promise<User | null>
  - Query by id
  - Return user or null
  
- toResponse(user: User): UserResponse
  - Remove password_hash
  - Return safe user object
```

**Implementation Details:**
- Use bcrypt.hash() with 10 salt rounds
- All queries use prepared statements ($1, $2, etc.)
- Never return password_hash in responses
- Add comprehensive logging

**HITL Checkpoint:** Review User model structure and security practices

---

### Step 4: Create Auth Service
**Action:** Create JWT token generation and verification service

**File:** `backend/src/services/auth.service.ts`

**Requirements:**
```typescript
// JWT Functions
- generateToken(userId: number): string
  - Sign JWT with userId payload
  - Use process.env.JWT_SECRET
  - Set expiry to 7 days
  - Algorithm: HS256
  
- verifyToken(token: string): { userId: number } | null
  - Verify JWT signature
  - Return payload or null if invalid
  - Handle expiration errors
  
// Password Functions
- hashPassword(password: string): Promise<string>
  - Use bcrypt with 10 salt rounds
  
- comparePassword(password: string, hash: string): Promise<boolean>
  - Compare plain password with hash
  - Return boolean
```

**Environment Variables Required:**
- `JWT_SECRET` - Strong random secret (generate with: `openssl rand -base64 32`)

**HITL Checkpoint:** Confirm JWT_SECRET is set in .env file

---

### Step 5: Create Auth Controller
**Action:** Create authentication endpoints

**File:** `backend/src/controllers/auth.controller.ts`

**Endpoints:**

**POST /api/auth/register**
- Body: `{ email: string, password: string, name: string }`
- Validation:
  - Email format (regex)
  - Password length >= 8 characters
  - Name not empty
- Logic:
  - Check if email exists (409 if yes)
  - Create user via UserModel
  - Generate JWT token
  - Return token and user (no password_hash)
- Response: `{ success: true, message: string, data: { token: string, user: UserResponse } }`

**POST /api/auth/login**
- Body: `{ email: string, password: string }`
- Logic:
  - Find user by email (401 if not found)
  - Compare password (401 if wrong)
  - Generate JWT token
  - Return token and user
- Response: `{ success: true, message: string, data: { token: string, user: UserResponse } }`

**GET /api/auth/me**
- Headers: `Authorization: Bearer <token>`
- Middleware: authenticate (created in next step)
- Logic:
  - Get userId from req.user (set by middleware)
  - Find user by id
  - Return user
- Response: `{ success: true, message: string, data: { user: UserResponse } }`

**Error Handling:**
- 400: Invalid input (validation)
- 401: Invalid credentials
- 409: Email already exists
- 500: Server error

**HITL Checkpoint:** Review endpoint logic and error handling

---

### Step 6: Create Auth Middleware
**Action:** Create JWT authentication middleware

**File:** `backend/src/middleware/auth.ts`

**Requirements:**
```typescript
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  // 1. Extract token from Authorization header
  //    Format: "Bearer <token>"
  
  // 2. If no token, return 401
  
  // 3. Verify token using authService.verifyToken()
  
  // 4. If invalid, return 401
  
  // 5. Attach userId to req.user = { userId: number }
  
  // 6. Call next()
}
```

**Extend Express Request type:**
```typescript
declare global {
  namespace Express {
    interface Request {
      user?: { userId: number };
    }
  }
}
```

**Usage Example:**
```typescript
router.get('/api/tasks', authenticate, taskController.getTasks);
```

---

### Step 7: Create Auth Routes
**Action:** Register authentication routes

**File:** `backend/src/routes/auth.routes.ts`

**Routes:**
```typescript
POST /api/auth/register → authController.register
POST /api/auth/login → authController.login
GET /api/auth/me → authenticate middleware → authController.getMe
```

**Update:** `backend/src/index.ts`
- Import authRoutes
- Register: `app.use('/api/auth', authRoutes)`
- Log: "Auth routes registered"

**HITL Checkpoint:** Test auth endpoints with curl

**Test Commands:**
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (replace TOKEN)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

### Step 8: Update Task Routes to Require Auth
**Action:** Protect existing task routes with authentication

**Update:** `backend/src/routes/task.routes.ts`

```typescript
import { authenticate } from '../middleware/auth';

// Protect all task routes
router.get('/', authenticate, taskController.getAllTasks);
router.get('/:id', authenticate, taskController.getTaskById);
router.post('/', authenticate, taskController.createTask);
router.put('/:id', authenticate, taskController.updateTask);
router.delete('/:id', authenticate, taskController.deleteTask);
```

**Optional Enhancement:** Add user_id to tasks
```typescript
// Update Task interface to include user_id
// Modify task creation to use req.user.userId
// Filter tasks by user
```

**HITL Checkpoint:** Verify task endpoints now require authentication

---

### Step 9: Create Auth Context (Frontend)
**Action:** Create React context for authentication state

**File:** `frontend/src/contexts/AuthContext.tsx`

**Requirements:**
```typescript
interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthProvider = ({ children }) => {
  // State: user, token, loading
  
  // Load token from localStorage on mount
  // If token exists, fetch /api/auth/me to get user
  
  // login function: POST /api/auth/login, save token, set user
  // register function: POST /api/auth/register, save token, set user
  // logout function: clear token and user
  
  // Store token in localStorage
  // Add token to all API requests via Authorization header
}
```

**localStorage keys:**
- `auth_token` - JWT token

**HITL Checkpoint:** Review auth context implementation

---

### Step 10: Create Auth Service (Frontend)
**Action:** Create API service for authentication

**File:** `frontend/src/services/auth.service.ts`

**Requirements:**
```typescript
export class AuthService {
  static async register(email: string, password: string, name: string): Promise<{ token: string, user: UserResponse }>
  
  static async login(email: string, password: string): Promise<{ token: string, user: UserResponse }>
  
  static async getCurrentUser(token: string): Promise<UserResponse>
  
  static setToken(token: string): void
  static getToken(): string | null
  static removeToken(): void
}
```

**Update:** `frontend/src/services/task.service.ts`
- Add Authorization header to all requests
- Get token from AuthService.getToken()

---

### Step 11: Create Login Component
**Action:** Create login form component

**File:** `frontend/src/components/Login.tsx`

**Requirements:**
- Email input (type="email")
- Password input (type="password")
- Submit button
- Error message display
- Link to register page
- Loading state during submission
- Form validation
- Redirect to home after successful login

**UI:**
- Centered form with card styling
- Tailwind CSS styling
- Responsive design
- Error messages in red
- Loading spinner on button

---

### Step 12: Create Register Component
**Action:** Create registration form component

**File:** `frontend/src/components/Register.tsx`

**Requirements:**
- Name input
- Email input (type="email")
- Password input (type="password")
- Confirm password input
- Submit button
- Error message display
- Link to login page
- Validation:
  - Email format
  - Password >= 8 characters
  - Passwords match
  - Name not empty

---

### Step 13: Create Protected Route Component
**Action:** Create route guard for authenticated routes

**File:** `frontend/src/components/ProtectedRoute.tsx`

**Requirements:**
```typescript
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
}
```

---

### Step 14: Add Routing to App
**Action:** Update App.tsx with React Router

**Install:** 
```bash
cd frontend
npm install react-router-dom
```

**Update:** `frontend/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              {/* Existing TaskList/TaskForm UI */}
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

**HITL Checkpoint:** Test full authentication flow in browser

---

## Success Criteria

Module 3 is complete when:

### Backend
- [x] Users table exists in database
- [x] User registration creates user with hashed password
- [x] Login returns JWT token
- [x] JWT token verification works
- [x] /api/auth/me returns current user
- [x] All task endpoints require authentication
- [x] Unauthorized requests return 401

### Frontend
- [x] Login form submits and saves token
- [x] Register form creates account and logs in
- [x] Token stored in localStorage
- [x] Protected routes redirect to login when not authenticated
- [x] All API requests include Authorization header
- [x] Logout clears token and redirects

### Integration
- [x] Can register new user
- [x] Can login with credentials
- [x] Can access protected task endpoints with token
- [x] Cannot access tasks without token
- [x] Token persists across page refreshes
- [x] Logout works and clears state

### Testing Commands
```bash
# Backend: Test auth endpoints
npm run dev  # Backend must be running

# Frontend: Test UI flow
npm run dev  # Frontend must be running
# 1. Go to /register
# 2. Create account
# 3. Verify redirect to tasks
# 4. Refresh page (should stay logged in)
# 5. Logout
# 6. Verify redirect to login
```

---

## Rollback Plan

If authentication breaks existing functionality:

1. Comment out auth middleware in task routes
2. Verify tasks work without auth
3. Debug auth implementation
4. Re-enable auth when fixed

---

## Notes for Instructor

**Timing:** This skill takes 15-17 minutes to complete with HITL checkpoints

**Key Teaching Points:**
- Skills vs Rules: Skills are procedures, Rules are standards
- HITL checkpoints ensure correctness at each step
- Security: Always hash passwords, never log tokens
- JWT: Stateless authentication, no session storage needed

**Common Issues:**
- Missing JWT_SECRET in .env
- CORS issues with Authorization header
- Token not being sent in requests
- localStorage not persisting across domains
