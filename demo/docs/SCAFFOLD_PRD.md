# Team Task Manager - Scaffold PRD

## Overview
Generate the initial project scaffold for Team Task Manager with Express backend and React frontend.

---

## Backend Setup Checklist

### Package Initialization
- [ ] Create `backend/package.json` with:
  - name: "team-task-manager-backend"
  - version: "1.0.0"
  - description: "Backend API for Team Task Manager"
  - main: "dist/index.js"
  - scripts:
    - `dev`: "nodemon --exec ts-node src/index.ts"
    - `build`: "tsc"
    - `start`: "node dist/index.js"
  - dependencies:
    - express: ^4.18.0
    - cors: ^2.8.5
    - dotenv: ^16.0.0
    - pg: ^8.11.0
  - devDependencies:
    - typescript: ^5.0.0
    - @types/node: ^20.0.0
    - @types/express: ^4.17.0
    - @types/cors: ^2.8.0
    - @types/pg: ^8.10.0
    - ts-node: ^10.9.0
    - nodemon: ^3.0.0

### TypeScript Configuration
- [ ] Create `backend/tsconfig.json` with:
  - target: "ES2020"
  - module: "commonjs"
  - outDir: "./dist"
  - rootDir: "./src"
  - strict: true
  - esModuleInterop: true
  - skipLibCheck: true

### Directory Structure
- [ ] Create `backend/src/` directory
- [ ] Create `backend/src/config/` directory
- [ ] Create `backend/src/types/` directory

### Server Entry Point
- [ ] Create `backend/src/index.ts` with:
  - Import express, cors, dotenv
  - Configure dotenv.config()
  - Create Express app
  - Add CORS middleware (origin from FRONTEND_URL env)
  - Add express.json() middleware
  - Add GET /health route returning {"status": "ok"}
  - Get PORT from env (default: 3000)
  - Start server with app.listen()
  - Log "Server running on port {PORT}"
  - Wrap in try-catch with error logging

### Database Configuration
- [ ] Create `backend/src/config/database.ts` with:
  - Import { Pool } from 'pg'
  - Create new Pool with DATABASE_URL from env
  - Configure: max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000
  - Export pool as named export
  - Add pool.on('connect') logging "Database connected"
  - Add pool.on('error') logging and process.exit(-1)

### Types File
- [ ] Create `backend/src/types/index.ts` (empty for now, placeholder)

### Environment Template
- [ ] Create `backend/.env.example` with:
  ```
  DATABASE_URL=postgresql://localhost:5432/taskmanager
  PORT=3000
  JWT_SECRET=your-secret-key-change-in-production
  FRONTEND_URL=http://localhost:5173
  NODE_ENV=development
  ```

### Gitignore
- [ ] Create `backend/.gitignore` with:
  ```
  node_modules/
  dist/
  .env
  *.log
  .DS_Store
  ```

---

## Frontend Setup Checklist

### Package Initialization
- [ ] Create `frontend/package.json` with:
  - name: "team-task-manager-frontend"
  - version: "1.0.0"
  - description: "Frontend for Team Task Manager"
  - type: "module"
  - scripts:
    - `dev`: "vite"
    - `build`: "tsc && vite build"
    - `preview`: "vite preview"
    - `lint`: "eslint src --ext ts,tsx"
  - dependencies:
    - react: ^18.2.0
    - react-dom: ^18.2.0
    - react-router-dom: ^6.20.0
  - devDependencies:
    - @types/react: ^18.2.0
    - @types/react-dom: ^18.2.0
    - @vitejs/plugin-react: ^4.2.0
    - typescript: ^5.0.0
    - vite: ^5.0.0
    - tailwindcss: ^3.4.0
    - postcss: ^8.4.0
    - autoprefixer: ^10.4.0
    - eslint: ^8.55.0
    - @typescript-eslint/parser: ^6.0.0
    - @typescript-eslint/eslint-plugin: ^6.0.0
    - eslint-plugin-react-hooks: ^4.6.0
    - eslint-plugin-react: ^7.33.0

### TypeScript Configuration
- [ ] Create `frontend/tsconfig.json` with:
  - target: "ES2020"
  - lib: ["ES2020", "DOM", "DOM.Iterable"]
  - module: "ESNext"
  - jsx: "react-jsx"
  - strict: true
  - moduleResolution: "bundler"
  - noEmit: true
- [ ] Create `frontend/tsconfig.node.json` for Vite config

### Vite Configuration
- [ ] Create `frontend/vite.config.ts` with:
  - Import vite defineConfig and @vitejs/plugin-react
  - Configure react plugin
  - Set server.port: 5173, strictPort: true

### Tailwind Configuration
- [ ] Create `frontend/tailwind.config.js` with:
  - content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
  - theme: { extend: {} }
  - plugins: []
- [ ] Create `frontend/postcss.config.js` with:
  - plugins: { tailwindcss: {}, autoprefixer: {} }

### Directory Structure
- [ ] Create `frontend/src/` directory
- [ ] Create `frontend/src/components/` (empty)
- [ ] Create `frontend/src/pages/` (empty)
- [ ] Create `frontend/src/contexts/` (empty)
- [ ] Create `frontend/src/hooks/` (empty)
- [ ] Create `frontend/src/services/` (empty)
- [ ] Create `frontend/src/types/` (empty)
- [ ] Create `frontend/public/` directory

### Global Styles
- [ ] Create `frontend/src/index.css` with:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  ```

### Main Entry Point
- [ ] Create `frontend/src/main.tsx` with:
  - Import React, ReactDOM, App, index.css
  - Use ReactDOM.createRoot
  - Wrap App in React.StrictMode

### App Component
- [ ] Create `frontend/src/App.tsx` with:
  - Export default function App()
  - Return JSX with:
    - Full-height flex container (min-h-screen, flex, items-center, justify-center, bg-gray-50)
    - Centered card with:
      - "Team Task Manager" heading (text-4xl, font-bold, text-blue-600)
      - "Progressive Cursor Workshop Demo" subtitle (text-xl, text-gray-600, mt-2)
      - "Module 1: Project Scaffold" text (text-lg, text-gray-500, mt-4)
      - Status badge showing "✓ Ready to build!" (bg-green-100, text-green-800, px-4, py-2, rounded-full, mt-6)

### HTML Template
- [ ] Create `frontend/index.html` with:
  - DOCTYPE html, lang="en"
  - meta charset UTF-8
  - meta viewport
  - title: "Team Task Manager"
  - div id="root"
  - script src="/src/main.tsx" type="module"

### Environment Template
- [ ] Create `frontend/.env.example` with:
  ```
  VITE_API_URL=http://localhost:3000
  ```

### Gitignore
- [ ] Create `frontend/.gitignore` with:
  ```
  node_modules/
  dist/
  .env
  .env.local
  *.log
  .DS_Store
  ```

---

## Shared Configuration Checklist

### Root Gitignore
- [ ] Create `demo/.gitignore` with:
  ```
  node_modules/
  dist/
  .env
  .env.local
  *.log
  .DS_Store
  ```

### ESLint Configuration
- [ ] Create `demo/.eslintrc.json` with:
  - env: browser, es2021, node
  - extends: eslint:recommended, @typescript-eslint/recommended, react/recommended, react-hooks/recommended
  - parser: @typescript-eslint/parser
  - plugins: @typescript-eslint, react, react-hooks
  - rules: react/react-in-jsx-scope: off
  - settings: react.version: detect

### Prettier Configuration
- [ ] Create `demo/.prettierrc` with:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "printWidth": 100,
    "arrowParens": "always"
  }
  ```

---

## Validation Checklist

### Backend Validation
- [ ] All files created in correct locations
- [ ] `cd backend && npm install` succeeds
- [ ] No TypeScript errors: `cd backend && npx tsc --noEmit`
- [ ] Database pool exports correctly
- [ ] Server starts: `cd backend && npm run dev`
- [ ] Health check works: `curl http://localhost:3000/health` returns `{"status":"ok"}`

### Frontend Validation
- [ ] All files created in correct locations
- [ ] `cd frontend && npm install` succeeds
- [ ] No TypeScript errors: `cd frontend && npx tsc --noEmit`
- [ ] Tailwind compiles correctly
- [ ] Dev server starts: `cd frontend && npm run dev`
- [ ] Browser shows welcome page at http://localhost:5173
- [ ] No console errors in browser

### Integration Validation
- [ ] Both servers run simultaneously
- [ ] No port conflicts
- [ ] CORS configured correctly
- [ ] Environment variables templated

---

## Success Criteria

✅ Project scaffold is complete when:
1. Both backend and frontend install dependencies without errors
2. TypeScript compiles without errors in both projects
3. Backend server starts and responds to /health endpoint
4. Frontend dev server starts and displays welcome page
5. All Cursor rules are applied in generated code
6. Directory structure matches specification exactly
7. All configuration files present and valid
8. No ESLint errors in either project

---

## Post-Generation Steps

After generation, run these commands:

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install

# 3. Create database
createdb taskmanager

# 4. Setup environment files
cd ../backend
cp .env.example .env
cd ../frontend
cp .env.example .env

# 5. Test backend (in one terminal)
cd backend
npm run dev
# Should see: "Server running on port 3000"

# 6. Test health endpoint (in another terminal)
curl http://localhost:3000/health
# Should return: {"status":"ok"}

# 7. Test frontend (in another terminal)
cd frontend
npm run dev
# Should see: "Local: http://localhost:5173"

# 8. Open browser to http://localhost:5173
# Should see welcome page

# 9. Commit the scaffold
git add demo/backend demo/frontend demo/.eslintrc.json demo/.prettierrc demo/.gitignore
git commit -m "Generate project scaffold with Cursor Composer

Module 1 - Part 3: Initial Scaffold Generation

Generated using Cursor Composer with rules applied:
- Express + TypeScript backend with PostgreSQL setup
- React + Vite + TypeScript frontend with TailwindCSS
- ESLint and Prettier configuration
- Development environment ready

Backend: Health check endpoint functional
Frontend: Welcome page displays correctly"
```

---

**Ready for Cursor Composer (⌘I / Ctrl+I)**
