# Module 2: CRUD Operations PRD

## Overview
Build complete task management CRUD functionality with RESTful API and React UI.

**Module:** 2 - Building Core Features with Rules  
**Duration:** 13 minutes  
**Cursor Features:** Rules + Composer for multi-file generation

---

## Current State Review

**Existing Files:**
- ✅ Backend: Express server running on port 3000
- ✅ Frontend: React app running on port 5173
- ✅ Database: PostgreSQL pool configured
- ✅ Rules: 4 Cursor rules in place

**What We'll Build:**
Complete task management system with backend API and frontend UI.

---

## Database Schema Checklist

### Create Tasks Table
- [ ] Create SQL migration file: `backend/src/migrations/001_create_tasks_table.sql`
- [ ] SQL should create table with columns:
  - id: SERIAL PRIMARY KEY
  - title: VARCHAR(255) NOT NULL
  - description: TEXT
  - status: VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done'))
  - priority: VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'))
  - assignee_id: INTEGER (nullable, will reference users table later)
  - created_at: TIMESTAMP DEFAULT NOW()
  - updated_at: TIMESTAMP DEFAULT NOW()
- [ ] Create index on created_at for sorting
- [ ] Add sample data (3-5 tasks) in migration

### Migration Runner Script
- [ ] Add to backend/package.json scripts:
  - `migrate`: "node -r ts-node/register scripts/migrate.ts"
- [ ] Create `backend/scripts/migrate.ts`:
  - Read and execute SQL migration files
  - Log success/failure
  - Handle errors gracefully

---

## Backend Implementation Checklist

### Task Model
- [ ] Create `backend/src/models/task.ts`
- [ ] Export Task interface with fields:
  - id: number
  - title: string
  - description: string
  - status: 'todo' | 'in_progress' | 'done'
  - priority: 'low' | 'medium' | 'high'
  - assignee_id: number | null
  - created_at: Date
  - updated_at: Date
- [ ] Export TaskInput interface (omit id, created_at, updated_at)
- [ ] Export taskModel object with methods:
  - findAll(): Promise<Task[]> - SELECT all tasks ORDER BY created_at DESC
  - findById(id: number): Promise<Task | null> - SELECT by id with $1 parameter
  - create(taskData: TaskInput): Promise<Task> - INSERT with RETURNING *, use NOW() for timestamps
  - update(id: number, taskData: Partial<TaskInput>): Promise<Task | null> - UPDATE with COALESCE, set updated_at to NOW()
  - delete(id: number): Promise<boolean> - DELETE and return rowCount > 0
- [ ] All queries use prepared statements ($1, $2, etc.)
- [ ] Import pool from config/database
- [ ] Add console.log for each database operation with context

### Task Controller
- [ ] Create `backend/src/controllers/taskController.ts`
- [ ] Import types from models/task
- [ ] Import taskModel
- [ ] Export getTasks function:
  - async (req: Request, res: Response): Promise<void>
  - try-catch block
  - Call taskModel.findAll()
  - Log: "Fetching all tasks"
  - Return: { success: true, data: tasks }
  - Catch: status 500, { success: false, error: 'Failed to fetch tasks' }
  - Log errors with console.error
- [ ] Export getTask function:
  - Extract id from req.params
  - Convert to number
  - Call taskModel.findById()
  - Log: "Fetching task with id: {id}"
  - If not found: status 404, { success: false, error: 'Task not found' }
  - Return: { success: true, data: task }
- [ ] Export createTask function:
  - Extract body from req.body
  - Validate required fields (title)
  - Log: "Creating task: {title}"
  - Call taskModel.create()
  - Return: status 201, { success: true, data: task, message: 'Task created' }
  - Handle 400 for validation errors
- [ ] Export updateTask function:
  - Extract id and body
  - Log: "Updating task {id}"
  - Call taskModel.update()
  - If not found: status 404
  - Return: { success: true, data: task, message: 'Task updated' }
- [ ] Export deleteTask function:
  - Extract id
  - Log: "Deleting task {id}"
  - Call taskModel.delete()
  - If not found: status 404
  - Return: status 204, no content
- [ ] All functions have explicit return types

### Task Routes
- [ ] Create `backend/src/routes/taskRoutes.ts`
- [ ] Import { Router } from 'express'
- [ ] Import all controller functions
- [ ] Create router instance
- [ ] Define routes:
  - GET '/' → getTasks
  - GET '/:id' → getTask
  - POST '/' → createTask
  - PUT '/:id' → updateTask
  - DELETE '/:id' → deleteTask
- [ ] Export router as default
- [ ] Add comment for each route explaining purpose

### Update Server
- [ ] Update `backend/src/index.ts`:
  - Import taskRoutes from './routes/taskRoutes'
  - Add route: app.use('/api/tasks', taskRoutes)
  - Place after middleware, before server start
  - Log: "Task routes registered"

---

## Frontend Implementation Checklist

### Task Types
- [ ] Create `frontend/src/types/task.ts`
- [ ] Export Task interface matching backend:
  - id: number
  - title: string
  - description: string
  - status: 'todo' | 'in_progress' | 'done'
  - priority: 'low' | 'medium' | 'high'
  - assignee_id: number | null
  - created_at: string (ISO date string)
  - updated_at: string
- [ ] Export TaskInput interface (omit id, created_at, updated_at)

### API Service
- [ ] Create `frontend/src/services/api.ts`
- [ ] Define API_BASE_URL from import.meta.env.VITE_API_URL (default: 'http://localhost:3000')
- [ ] Create helper function fetchApi(url, options):
  - Add Content-Type: application/json header
  - Call fetch with full URL
  - Check response.ok, throw error if not
  - Parse and return JSON
  - Log all requests: "API {method} {url}"
- [ ] Export taskApi object with methods:
  - getAll(): Promise<Task[]> - GET /api/tasks, return response.data
  - getById(id: number): Promise<Task> - GET /api/tasks/:id, return response.data
  - create(taskData: TaskInput): Promise<Task> - POST /api/tasks, return response.data
  - update(id: number, taskData: Partial<TaskInput>): Promise<Task> - PUT /api/tasks/:id
  - delete(id: number): Promise<void> - DELETE /api/tasks/:id
- [ ] All methods log operations and handle errors

### TaskList Component
- [ ] Create `frontend/src/components/TaskList.tsx`
- [ ] Import useState, useEffect from react
- [ ] Import Task type and taskApi service
- [ ] Export function TaskList():
  - State: tasks (Task[]), loading (boolean), error (string | null)
  - useEffect on mount: call fetchTasks()
  - fetchTasks function:
    - Set loading true
    - Call taskApi.getAll()
    - Set tasks with data
    - Set error null on success
    - Catch: set error message
    - Finally: set loading false
  - handleDelete function:
    - Call taskApi.delete(id)
    - Filter out deleted task from state
    - Log: "Deleted task {id}"
    - Catch: set error
  - If loading: return skeleton loader div
  - If error: return error message with red text
  - If empty tasks: return "No tasks yet. Create your first task!" message
  - Map over tasks rendering cards with:
    - Title (font-bold, text-lg)
    - Description (text-gray-600)
    - Status badge (colored by status: todo=blue, in_progress=yellow, done=green)
    - Priority badge (low=gray, medium=orange, high=red)
    - Delete button (text-red-600, hover:text-red-800)
  - Use Tailwind: space-y-4, p-4, border, rounded-lg
  - Make mobile responsive

### TaskForm Component
- [ ] Create `frontend/src/components/TaskForm.tsx`
- [ ] Import useState from react
- [ ] Import TaskInput type and taskApi service
- [ ] Props interface: onTaskCreated: (task: Task) => void
- [ ] Export function TaskForm({ onTaskCreated }):
  - State: formData with title, description, status, priority
  - State: errors (Record<string, string>)
  - State: submitting (boolean)
  - handleChange function: update formData
  - validate function:
    - Check title not empty
    - Check title < 255 chars
    - Return boolean
  - handleSubmit function:
    - preventDefault
    - Validate form
    - Set submitting true
    - Call taskApi.create()
    - Call onTaskCreated callback
    - Reset form
    - Set submitting false
    - Log: "Created task: {title}"
    - Catch: show error message
  - Render form with:
    - Title input (required)
    - Description textarea
    - Status select (todo, in_progress, done)
    - Priority select (low, medium, high)
    - Submit button (disabled when submitting)
  - Show field errors below inputs
  - Use Tailwind: space-y-4, labels, borders, focus rings
  - Mobile responsive

### Update App Component
- [ ] Update `frontend/src/App.tsx`:
  - Remove welcome page content
  - Import TaskList and TaskForm
  - State: showForm (boolean), tasks (Task[])
  - Create layout with:
    - Header: "Team Task Manager" title, "Create Task" button
    - Main content area with TaskList
    - TaskForm in modal or sidebar (conditional on showForm)
  - Pass onTaskCreated to TaskForm that adds new task to local state
  - Use Tailwind: container, mx-auto, p-6, responsive grid
  - Add console.log: "App mounted"

---

## Validation Checklist

### Backend Validation
- [ ] Migration runs successfully: `npm run migrate`
- [ ] Tasks table exists: `psql taskmanager -c "\dt"`
- [ ] Sample data inserted: `psql taskmanager -c "SELECT * FROM tasks;"`
- [ ] Server starts without errors
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Test endpoints with curl:
  - `curl http://localhost:3000/api/tasks` → returns array
  - `curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title":"Test","description":"Test task"}'` → creates task
  - `curl http://localhost:3000/api/tasks/1` → returns task
  - `curl -X DELETE http://localhost:3000/api/tasks/1` → deletes task

### Frontend Validation
- [ ] Dev server starts without errors
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] No console errors in browser
- [ ] TaskList displays sample tasks from database
- [ ] Can create new task via form
- [ ] New task appears in list immediately
- [ ] Can delete task with delete button
- [ ] Deleted task disappears from list
- [ ] Loading states display correctly
- [ ] Error messages display on failure
- [ ] Form validation works (empty title shows error)
- [ ] Mobile responsive layout works

### Integration Validation
- [ ] Frontend successfully calls backend API
- [ ] CORS allows frontend requests
- [ ] Task data flows: backend → frontend display
- [ ] Create task flows: frontend form → backend → database → frontend update
- [ ] Delete task flows: frontend button → backend → database → frontend update
- [ ] All console.logs show operations happening

---

## Success Criteria

✅ Module 2 is complete when:
1. Tasks table exists in database with sample data
2. All 5 backend endpoints work (GET all, GET one, POST, PUT, DELETE)
3. TaskList component displays tasks from database
4. TaskForm component creates new tasks
5. Delete button removes tasks
6. All operations log to console
7. Error handling works (try invalid data)
8. No TypeScript errors
9. Mobile responsive UI
10. Code follows all Cursor rules

---

## Post-Generation Commands

After Cursor generates the code:

```bash
# 1. Run database migration
cd backend
npm run migrate

# 2. Verify table created
psql taskmanager -c "\dt"
psql taskmanager -c "SELECT * FROM tasks;"

# 3. Restart backend (if running)
# Stop with Ctrl+C, then:
npm run dev

# 4. Test API endpoints
curl http://localhost:3000/api/tasks
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title":"Test Task","description":"Testing CRUD","status":"todo","priority":"medium"}'

# 5. Open frontend in browser
# Visit: http://localhost:5173
# Should see task list with sample tasks
# Try creating a task
# Try deleting a task

# 6. Commit when working
git add demo/backend/src demo/frontend/src
git commit -m "Implement task CRUD operations with Rules and Composer

Module 2: Core Features with Rules

Backend:
- Task model with PostgreSQL prepared statements
- Task controller with 5 RESTful endpoints
- Task routes registered
- Database migration with sample data
- All operations logged

Frontend:
- Task types matching backend
- API service with error handling
- TaskList component with loading/error states
- TaskForm component with validation
- Updated App.tsx with task management UI

Features Working:
✅ Display all tasks
✅ Create new task
✅ Delete task
✅ Real-time UI updates
✅ Error handling and loading states
✅ Mobile responsive design"
```

---

## Expected File Structure After Generation

```
backend/src/
├── models/
│   └── task.ts              ← NEW
├── controllers/
│   └── taskController.ts    ← NEW
├── routes/
│   └── taskRoutes.ts        ← NEW
├── migrations/
│   └── 001_create_tasks_table.sql  ← NEW
├── scripts/
│   └── migrate.ts           ← NEW
├── config/
│   └── database.ts          (existing)
├── types/
│   └── index.ts             (existing)
└── index.ts                 (updated with routes)

frontend/src/
├── types/
│   └── task.ts              ← NEW
├── services/
│   └── api.ts               ← NEW
├── components/
│   ├── TaskList.tsx         ← NEW
│   └── TaskForm.tsx         ← NEW
├── App.tsx                  (updated with task UI)
├── main.tsx                 (existing)
└── index.css                (existing)
```

---

## Troubleshooting

**If migration fails:**
```bash
# Drop and recreate database
dropdb taskmanager
createdb taskmanager
npm run migrate
```

**If CORS errors:**
- Check FRONTEND_URL in backend/.env matches frontend dev server

**If tasks don't appear:**
- Check browser console for API errors
- Check backend logs for request handling
- Verify database has data: `psql taskmanager -c "SELECT * FROM tasks;"`

**If TypeScript errors:**
- Ensure types match between frontend and backend
- Run `npx tsc --noEmit` in each directory
