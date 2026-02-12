# Team Task Manager - API Documentation

Complete API reference for the Team Task Manager application. This RESTful API provides endpoints for user authentication, task management, and team collaboration.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Authentication Endpoints](#authentication-endpoints)
- [Task Endpoints](#task-endpoints)
- [Team Endpoints](#team-endpoints)
- [Data Models](#data-models)

## Base URL

```
http://localhost:3000/api
```

All endpoints are prefixed with `/api`.

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are issued upon successful registration or login and are valid for the duration of the session.

### Public Endpoints (No Auth Required)

- `POST /api/auth/register`
- `POST /api/auth/login`

### Protected Endpoints (Auth Required)

All other endpoints require a valid JWT token in the Authorization header.

## Response Format

All API responses follow a consistent JSON format:

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "data": null
}
```

## Error Handling

The API uses standard HTTP status codes:

| Status Code | Description |
|-------------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or missing required fields |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - Insufficient permissions to access resource |
| 404 | Not Found - Requested resource does not exist |
| 409 | Conflict - Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error - Server-side error occurred |

## Rate Limiting

Currently, the API does not implement rate limiting. In production, consider implementing rate limiting to prevent abuse:

- Recommended: 100 requests per 15 minutes per IP address
- Authentication endpoints: 5 failed attempts per 15 minutes

---

## Authentication Endpoints

### Register New User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Validation Rules:**

- `email`: Required, must be valid email format, must be unique
- `password`: Required, minimum 8 characters
- `name`: Required, non-empty string

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "created_at": "2026-02-11T20:30:45.123Z"
    }
  }
}
```

**Error Responses:**

**400 - Missing Required Fields:**
```json
{
  "success": false,
  "message": "Email is required",
  "data": null
}
```

**400 - Invalid Email Format:**
```json
{
  "success": false,
  "message": "Invalid email format",
  "data": null
}
```

**400 - Password Too Short:**
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long",
  "data": null
}
```

**409 - Email Already Exists:**
```json
{
  "success": false,
  "message": "Email already exists",
  "data": null
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

---

### Login User

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**

- `email`: Required, non-empty string
- `password`: Required, non-empty string

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "created_at": "2026-02-11T20:30:45.123Z"
    }
  }
}
```

**Error Responses:**

**400 - Missing Required Fields:**
```json
{
  "success": false,
  "message": "Email is required",
  "data": null
}
```

**401 - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

---

### Get Current User

Retrieve information about the currently authenticated user.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "created_at": "2026-02-11T20:30:45.123Z"
    }
  }
}
```

**Error Responses:**

**401 - Not Authenticated:**
```json
{
  "success": false,
  "message": "User not authenticated",
  "data": null
}
```

**404 - User Not Found:**
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Task Endpoints

### Get All Tasks

Retrieve all tasks with optional filtering by team, status, or priority.

**Endpoint:** `GET /api/tasks`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `team_id` | number or "unassigned" | Filter tasks by team ID, or "unassigned" for tasks with no team | `?team_id=1` or `?team_id=unassigned` |
| `status` | string | Filter by task status: `todo`, `in_progress`, `done` | `?status=in_progress` |
| `priority` | string | Filter by priority: `low`, `medium`, `high` | `?priority=high` |

**Note:** Only one filter can be applied at a time. Priority order: `team_id` > `status` > `priority`.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Implement user authentication",
      "description": "Add JWT authentication to the API",
      "status": "in_progress",
      "priority": "high",
      "assignee_id": 2,
      "creator_id": 1,
      "team_id": 1,
      "created_at": "2026-02-11T10:00:00.000Z",
      "updated_at": "2026-02-11T14:30:00.000Z"
    },
    {
      "id": 2,
      "title": "Write API documentation",
      "description": "Document all endpoints with examples",
      "status": "todo",
      "priority": "medium",
      "assignee_id": null,
      "creator_id": 1,
      "team_id": 1,
      "created_at": "2026-02-11T11:00:00.000Z",
      "updated_at": "2026-02-11T11:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

**400 - Invalid Team ID:**
```json
{
  "success": false,
  "message": "Invalid team_id parameter",
  "data": null
}
```

**400 - Invalid Status:**
```json
{
  "success": false,
  "message": "Invalid status. Must be: todo, in_progress, or done",
  "data": null
}
```

**403 - Not a Team Member:**
```json
{
  "success": false,
  "message": "You do not have access to this team's tasks",
  "data": null
}
```

**cURL Examples:**

```bash
# Get all tasks
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>"

# Filter by team
curl -X GET "http://localhost:3000/api/tasks?team_id=1" \
  -H "Authorization: Bearer <token>"

# Get unassigned tasks
curl -X GET "http://localhost:3000/api/tasks?team_id=unassigned" \
  -H "Authorization: Bearer <token>"

# Filter by status
curl -X GET "http://localhost:3000/api/tasks?status=in_progress" \
  -H "Authorization: Bearer <token>"

# Filter by priority
curl -X GET "http://localhost:3000/api/tasks?priority=high" \
  -H "Authorization: Bearer <token>"
```

---

### Get Task by ID

Retrieve a single task by its ID.

**Endpoint:** `GET /api/tasks/:id`

**Authentication:** Required

**URL Parameters:**

- `id` (number): Task ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "id": 1,
    "title": "Implement user authentication",
    "description": "Add JWT authentication to the API",
    "status": "in_progress",
    "priority": "high",
    "assignee_id": 2,
    "creator_id": 1,
    "team_id": 1,
    "created_at": "2026-02-11T10:00:00.000Z",
    "updated_at": "2026-02-11T14:30:00.000Z"
  }
}
```

**Error Responses:**

**400 - Invalid ID:**
```json
{
  "success": false,
  "message": "Invalid task ID",
  "data": null
}
```

**404 - Task Not Found:**
```json
{
  "success": false,
  "message": "Task not found",
  "data": null
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer <token>"
```

---

### Create Task

Create a new task.

**Endpoint:** `POST /api/tasks`

**Authentication:** Required

**Request Body:**

```json
{
  "title": "Implement user authentication",
  "description": "Add JWT authentication to the API",
  "status": "todo",
  "priority": "high",
  "assignee_id": 2,
  "team_id": 1
}
```

**Field Descriptions:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | - | Task title (max 255 characters) |
| `description` | string | No | null | Detailed task description |
| `status` | string | No | "todo" | Task status: `todo`, `in_progress`, `done` |
| `priority` | string | No | "medium" | Task priority: `low`, `medium`, `high` |
| `assignee_id` | number | No | null | User ID of the assignee |
| `team_id` | number | No | null | Team ID (user must be a member) |

**Note:** `creator_id` is automatically set to the authenticated user's ID.

**Success Response (201):**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 3,
    "title": "Implement user authentication",
    "description": "Add JWT authentication to the API",
    "status": "todo",
    "priority": "high",
    "assignee_id": 2,
    "creator_id": 1,
    "team_id": 1,
    "created_at": "2026-02-11T15:00:00.000Z",
    "updated_at": "2026-02-11T15:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Missing Title:**
```json
{
  "success": false,
  "message": "Title is required",
  "data": null
}
```

**400 - Invalid Status:**
```json
{
  "success": false,
  "message": "Invalid status. Must be: todo, in_progress, or done",
  "data": null
}
```

**403 - Not a Team Member:**
```json
{
  "success": false,
  "message": "You must be a member of the team to create tasks",
  "data": null
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT authentication to the API",
    "status": "todo",
    "priority": "high",
    "assignee_id": 2,
    "team_id": 1
  }'
```

**Minimal Example:**

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write tests"
  }'
```

---

### Update Task

Update an existing task.

**Endpoint:** `PUT /api/tasks/:id`

**Authentication:** Required

**URL Parameters:**

- `id` (number): Task ID

**Request Body:**

All fields are optional. Only include fields you want to update.

```json
{
  "title": "Implement JWT authentication",
  "description": "Add JWT authentication with refresh tokens",
  "status": "in_progress",
  "priority": "high",
  "assignee_id": 3,
  "team_id": 2
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Updated task title |
| `description` | string | No | Updated description |
| `status` | string | No | Updated status: `todo`, `in_progress`, `done` |
| `priority` | string | No | Updated priority: `low`, `medium`, `high` |
| `assignee_id` | number | No | Updated assignee user ID |
| `team_id` | number | No | Updated team ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Implement JWT authentication",
    "description": "Add JWT authentication with refresh tokens",
    "status": "in_progress",
    "priority": "high",
    "assignee_id": 3,
    "creator_id": 1,
    "team_id": 2,
    "created_at": "2026-02-11T10:00:00.000Z",
    "updated_at": "2026-02-11T16:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Invalid ID:**
```json
{
  "success": false,
  "message": "Invalid task ID",
  "data": null
}
```

**404 - Task Not Found:**
```json
{
  "success": false,
  "message": "Task not found",
  "data": null
}
```

**cURL Examples:**

```bash
# Update status only
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done"
  }'

# Update multiple fields
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "priority": "high",
    "assignee_id": 2
  }'
```

---

### Delete Task

Delete a task.

**Endpoint:** `DELETE /api/tasks/:id`

**Authentication:** Required

**URL Parameters:**

- `id` (number): Task ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

**Error Responses:**

**400 - Invalid ID:**
```json
{
  "success": false,
  "message": "Invalid task ID",
  "data": null
}
```

**404 - Task Not Found:**
```json
{
  "success": false,
  "message": "Task not found",
  "data": null
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer <token>"
```

---

## Team Endpoints

### Create Team

Create a new team. The authenticated user automatically becomes the owner.

**Endpoint:** `POST /api/teams`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Frontend Development Team"
}
```

**Validation Rules:**

- `name`: Required, non-empty string

**Success Response (201):**

```json
{
  "success": true,
  "message": "Team created successfully",
  "data": {
    "id": 1,
    "name": "Frontend Development Team",
    "owner_id": 1,
    "created_at": "2026-02-11T10:00:00.000Z",
    "updated_at": "2026-02-11T10:00:00.000Z"
  }
}
```

**Note:** The creator is automatically added as a team member with the "owner" role.

**Error Responses:**

**400 - Missing Name:**
```json
{
  "success": false,
  "error": "Team name is required and must be a non-empty string"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Development Team"
  }'
```

---

### Get All Teams

Get all teams where the authenticated user is a member.

**Endpoint:** `GET /api/teams`

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Frontend Development Team",
      "owner_id": 1,
      "created_at": "2026-02-11T10:00:00.000Z",
      "updated_at": "2026-02-11T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Backend Development Team",
      "owner_id": 2,
      "created_at": "2026-02-11T11:00:00.000Z",
      "updated_at": "2026-02-11T11:00:00.000Z"
    }
  ]
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3000/api/teams \
  -H "Authorization: Bearer <token>"
```

---

### Get Team by ID

Get detailed information about a specific team, including members.

**Endpoint:** `GET /api/teams/:id`

**Authentication:** Required

**Authorization:** User must be a member of the team

**URL Parameters:**

- `id` (number): Team ID

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Frontend Development Team",
    "owner_id": 1,
    "created_at": "2026-02-11T10:00:00.000Z",
    "updated_at": "2026-02-11T10:00:00.000Z",
    "members": [
      {
        "id": 1,
        "team_id": 1,
        "user_id": 1,
        "role": "owner",
        "joined_at": "2026-02-11T10:00:00.000Z"
      },
      {
        "id": 2,
        "team_id": 1,
        "user_id": 2,
        "role": "member",
        "joined_at": "2026-02-11T10:30:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

**400 - Invalid ID:**
```json
{
  "success": false,
  "error": "Invalid team ID"
}
```

**403 - Not a Member:**
```json
{
  "success": false,
  "error": "You do not have access to this team"
}
```

**404 - Team Not Found:**
```json
{
  "success": false,
  "error": "Team not found"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3000/api/teams/1 \
  -H "Authorization: Bearer <token>"
```

---

### Add Team Member

Add a user to a team as a member.

**Endpoint:** `POST /api/teams/:id/members`

**Authentication:** Required

**Authorization:** Only team owner can add members

**URL Parameters:**

- `id` (number): Team ID

**Request Body:**

```json
{
  "user_id": 2
}
```

**Validation Rules:**

- `user_id`: Required, must be a valid user ID
- User must not already be a member of the team

**Success Response (201):**

```json
{
  "success": true,
  "message": "Member added successfully",
  "data": {
    "id": 2,
    "team_id": 1,
    "user_id": 2,
    "role": "member",
    "joined_at": "2026-02-11T10:30:00.000Z"
  }
}
```

**Error Responses:**

**400 - Invalid Team ID:**
```json
{
  "success": false,
  "error": "Invalid team ID"
}
```

**400 - Invalid User ID:**
```json
{
  "success": false,
  "error": "Valid user_id is required"
}
```

**400 - Already a Member:**
```json
{
  "success": false,
  "error": "User is already a member of this team"
}
```

**403 - Not Owner:**
```json
{
  "success": false,
  "error": "Only team owner can add members"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/teams/1/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2
  }'
```

---

### Remove Team Member

Remove a member from a team.

**Endpoint:** `DELETE /api/teams/:id/members/:userId`

**Authentication:** Required

**Authorization:** Only team owner can remove members

**URL Parameters:**

- `id` (number): Team ID
- `userId` (number): User ID to remove

**Restrictions:**

- Team owner cannot remove themselves
- To remove the owner, delete the team instead

**Success Response (200):**

```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

**Error Responses:**

**400 - Invalid IDs:**
```json
{
  "success": false,
  "error": "Invalid team ID or user ID"
}
```

**400 - Cannot Remove Owner:**
```json
{
  "success": false,
  "error": "Team owner cannot remove themselves. Delete the team instead."
}
```

**403 - Not Owner:**
```json
{
  "success": false,
  "error": "Only team owner can remove members"
}
```

**404 - Member Not Found:**
```json
{
  "success": false,
  "error": "Member not found in team"
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:3000/api/teams/1/members/2 \
  -H "Authorization: Bearer <token>"
```

---

### Delete Team

Delete a team and all associated data.

**Endpoint:** `DELETE /api/teams/:id`

**Authentication:** Required

**Authorization:** Only team owner can delete the team

**URL Parameters:**

- `id` (number): Team ID

**Cascade Behavior:**

When a team is deleted:
- All team members are removed (CASCADE)
- All tasks associated with the team have `team_id` set to NULL (CASCADE)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Team deleted successfully"
}
```

**Error Responses:**

**400 - Invalid ID:**
```json
{
  "success": false,
  "error": "Invalid team ID"
}
```

**403 - Not Owner:**
```json
{
  "success": false,
  "error": "Only team owner can delete the team"
}
```

**404 - Team Not Found:**
```json
{
  "success": false,
  "error": "Team not found"
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:3000/api/teams/1 \
  -H "Authorization: Bearer <token>"
```

---

## Data Models

### User

```typescript
{
  id: number;
  email: string;
  name: string;
  created_at: Date;
}
```

**Note:** `password_hash` is never returned in API responses for security.

### Task

```typescript
{
  id: number;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assignee_id: number | null;
  creator_id: number | null;
  team_id: number | null;
  created_at: Date;
  updated_at: Date;
}
```

### Team

```typescript
{
  id: number;
  name: string;
  owner_id: number;
  created_at: Date;
  updated_at: Date;
}
```

### Team Member

```typescript
{
  id: number;
  team_id: number;
  user_id: number;
  role: "owner" | "member";
  joined_at: Date;
}
```

---

## Complete Example Workflow

Here's a complete workflow demonstrating the API usage:

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!",
    "name": "Alice Johnson"
  }'

# Response includes token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Create a Team

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/api/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Development"
  }'

# Response includes team id: 1
```

### 3. Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design user dashboard",
    "description": "Create mockups for the main dashboard",
    "priority": "high",
    "team_id": 1
  }'

# Response includes task id: 1
```

### 4. Add Team Member

```bash
# First, register another user (Bob) and note their user_id: 2

curl -X POST http://localhost:3000/api/teams/1/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2
  }'
```

### 5. Update Task

```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "assignee_id": 2
  }'
```

### 6. Get Team Tasks

```bash
curl -X GET "http://localhost:3000/api/tasks?team_id=1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with Postman

### Setup

1. Import the API endpoints into Postman
2. Create an environment variable `token` for authentication
3. Set the base URL to `http://localhost:3000/api`

### Collection Structure

```
Team Task Manager API
├── Auth
│   ├── Register User
│   ├── Login User
│   └── Get Current User
├── Tasks
│   ├── Get All Tasks
│   ├── Get Task by ID
│   ├── Create Task
│   ├── Update Task
│   └── Delete Task
└── Teams
    ├── Create Team
    ├── Get All Teams
    ├── Get Team by ID
    ├── Add Team Member
    ├── Remove Team Member
    └── Delete Team
```

### Setting Up Authorization

After login or register:
1. Copy the `token` from the response
2. Set the environment variable `token` to this value
3. Use `{{token}}` in Authorization headers: `Bearer {{token}}`

---

## Security Considerations

### JWT Token Storage

- Store JWT tokens securely (localStorage or httpOnly cookies)
- Never expose tokens in URLs or logs
- Implement token refresh mechanism for long-lived sessions

### Password Security

- Passwords are hashed using bcrypt with 10 salt rounds
- Never send passwords in GET requests
- Enforce strong password policies on the client side

### SQL Injection Prevention

- All database queries use prepared statements with parameterized queries
- User input is never directly concatenated into SQL strings

### Authorization

- Team-based access control ensures users can only access resources they're authorized for
- Owner permissions are required for sensitive operations (add/remove members, delete team)
- Team membership is verified before showing team data

### Input Validation

- All endpoints validate required fields
- Enum values (status, priority, role) are validated against allowed values
- Email format is validated using regex
- IDs are validated to ensure they're numeric

---

## Changelog

### Version 1.0 (Current)

- Initial API release with 14 endpoints
- User authentication with JWT
- Task CRUD operations with filtering
- Team collaboration features
- Team-based access control

---

## Support

For issues, questions, or contributions, please refer to the main README.md file.

**API Version:** 1.0  
**Last Updated:** February 11, 2026
