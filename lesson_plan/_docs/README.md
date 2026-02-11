# Cursor Workshop Documentation

## Progressive Lesson Plan (RECOMMENDED)

**File:** [`progressive_cursor_lesson_plan.md`](progressive_cursor_lesson_plan.md)

**Format:** 90-minute demo-focused workshop  
**Approach:** Build a complete Team Task Manager app, introducing Cursor features progressively  
**Target:** Mixed experience levels

### Why This Approach?

This lesson plan uses a **learn-by-building** methodology where each Cursor feature is introduced through practical application:

1. **Module 1: Cursor Rules** → Build project scaffold
2. **Module 2: Rules + Composer** → Build CRUD operations
3. **Module 3: Cursor Skills** → Add authentication
4. **Module 4: Memory Bank** → Add team collaboration
5. **Module 5: Subagents** → Generate tests and docs
6. **Module 6: Documentation Indexing** → Add real-time features
7. **Module 7: MCP Playwright** → Create E2E tests
8. **Module 8: Final Demo** → Review complete application

### Progressive Complexity

Each module increases in complexity while building on previous work:

```
Basic → Intermediate → Advanced → Complex → Expert
```

Students see:
- How features work together
- Real-world application patterns
- Complete development workflow
- Production-ready code generation

### What Makes It Different

Unlike traditional tutorials that teach features in isolation:
- **Contextual Learning**: Each feature is learned while solving real problems
- **Cumulative Building**: Every module adds to the same project
- **Integration Focus**: Shows how Cursor features work together
- **Production Quality**: Generates test coverage, documentation, and best practices

---

## Lesson Plan Structure

### Module Breakdown (90 minutes)

```
00:00-00:12 (12m) │ Cursor Rules         │ Project standards & scaffold
00:12-00:25 (13m) │ Rules in Action      │ CRUD API & components
00:25-00:38 (13m) │ Cursor Skills        │ JWT authentication
00:38-00:48 (10m) │ Memory Bank          │ Team collaboration
00:48-01:00 (12m) │ Subagents            │ Tests, docs, refactor
01:00-01:10 (10m) │ Doc Indexing         │ Real-time WebSockets
01:10-01:22 (12m) │ MCP Playwright       │ E2E testing
01:22-01:30 (8m)  │ Final Demo & Q&A     │ Complete walkthrough
```

### Complexity Progression

| Module | Cursor Feature | App Feature Built | Lines of Code | Testing |
|--------|---------------|-------------------|---------------|---------|
| 1 | Rules | Basic scaffold | ~100 | None |
| 2 | Rules + Composer | Task CRUD | ~300 | Manual |
| 3 | Skills | Authentication | ~400 | Basic |
| 4 | Memory Bank | Team management | ~200 | Unit |
| 5 | Subagents | Test suite | ~500 | 80%+ |
| 6 | Doc Indexing | Real-time updates | ~300 | Integration |
| 7 | MCP | E2E tests | ~200 | Visual |

**Total:** ~2,000 lines of production-ready, tested, documented code in 90 minutes

---

## Key Cursor Concepts Covered

### 1. Cursor Rules (.cursor/rules/)
**What:** Persistent coding standards and patterns  
**Format:** `.mdc` files with YAML frontmatter  
**Use:** Ensure consistency across codebase

**Examples in workshop:**
- `project-standards.mdc` - Global coding standards
- `backend-api.mdc` - API patterns and conventions
- `frontend-components.mdc` - React component patterns

### 2. Cursor Skills (.cursor/skills/)
**What:** Executable multi-step workflows  
**Format:** `.md` files with YAML frontmatter + steps  
**Use:** Complex features requiring coordination

**Example in workshop:**
- `add-auth-feature.md` - Complete JWT authentication implementation

### 3. Memory Bank (memory-bank/)
**What:** Living project context for AI  
**Format:** Structured markdown files  
**Use:** Maintain project intelligence across sessions

**Files in workshop:**
- `projectbrief.md` - Requirements and goals
- `techContext.md` - Technology decisions
- `systemPatterns.md` - Architecture patterns
- `activeContext.md` - Current development state

### 4. Subagents
**What:** Specialized AI agents for specific tasks  
**Use:** Parallel execution of testing, documentation, refactoring

**Demonstrated in workshop:**
- Testing Subagent: Generate comprehensive test suite
- Documentation Subagent: Create API docs and README
- Refactor Subagent: Optimize database queries

### 5. Documentation Indexing
**What:** Reference external framework documentation  
**Use:** Enhance code generation with official patterns

**Indexed in workshop:**
- React documentation
- Express.js documentation
- PostgreSQL documentation

### 6. MCP (Model Context Protocol)
**What:** Protocol for AI agents to use external tools  
**Use:** Extend Cursor capabilities beyond code editing

**MCP Server in workshop:**
- Playwright MCP: Browser automation for E2E testing

---

## Demo Repository

The workshop builds a **Team Task Manager** with:

**Features:**
- User registration and authentication
- JWT token-based security
- Team creation and management
- Task CRUD operations
- Task assignment to team members
- Real-time updates via WebSockets
- Comprehensive test coverage
- Complete API documentation

**Technology Stack:**
- Backend: Express + TypeScript + PostgreSQL
- Frontend: React + TypeScript + Vite + TailwindCSS
- Testing: Jest + React Testing Library + Playwright
- Deployment: Docker ready

**Final Repository Structure:**
```
team-task-manager/
├── .cursor/               # Cursor configuration
│   ├── rules/            # 3 rule files
│   └── skills/           # 1 skill file
├── memory-bank/          # 4 context files
├── backend/              # Express API
├── frontend/             # React app
├── docs/                 # Generated documentation
└── screenshots/          # E2E test screenshots
```

---

## Teaching Philosophy

This workshop follows proven pedagogical principles:

### 1. Progressive Disclosure
Introduce concepts in order of increasing complexity, building on previous knowledge.

### 2. Contextual Learning
Teach features in the context of solving real problems, not in isolation.

### 3. Immediate Application
Students see each concept applied immediately to the demo project.

### 4. Cumulative Building
Each module adds to the same project, reinforcing integration.

### 5. Real-World Relevance
Build production-quality code, not toy examples.

---

## Comparison with Other Lesson Plans

### Progressive Plan (THIS FILE)
- **Format:** Demo with hands-on building
- **Approach:** Learn by building complete app
- **Best for:** Understanding how features integrate
- **Complexity:** Gradually increases
- **Time:** 90 minutes
- **Outcome:** Complete working application

### lesson_plan_demo_focused.md
- **Format:** Pure demonstration
- **Approach:** Feature-by-feature showcase
- **Best for:** Quick overview of latest features
- **Complexity:** Jumps between topics
- **Time:** 90 minutes
- **Outcome:** Broad understanding of capabilities

### lesson_plan.md
- **Format:** Hands-on workshop
- **Approach:** Students code along
- **Best for:** Active learning with installation
- **Complexity:** Moderate throughout
- **Time:** 90 minutes (includes setup)
- **Outcome:** Personal experience with Cursor

---

## When to Use This Lesson Plan

**Use the Progressive Plan when:**
- You want to show how Cursor features integrate
- Audience wants to see a complete workflow
- You have time for a cohesive narrative
- You want to demonstrate production-ready development
- Building from scratch is valuable to the audience

**Use Alternative Plans when:**
- You need to showcase specific new features quickly
- Time is extremely limited
- Audience only wants feature overview
- Students have vastly different experience levels

---

## Customization Options

The progressive plan is modular and can be adapted:

### For Shorter Workshop (60 minutes)
- Combine Modules 1 & 2 (15 minutes)
- Skip Module 4 (Memory Bank)
- Combine Modules 6 & 7 (15 minutes)
- Reduce Q&A to 5 minutes

### For Longer Workshop (2+ hours)
- Add hands-on exercises after each module
- Include breaks between modules
- Add advanced topics (custom MCP servers, agent pooling)
- Extended Q&A and debugging sessions

### For Different Tech Stacks
The approach works with any stack:
- Python + FastAPI + MongoDB
- Go + Gin + PostgreSQL
- Java + Spring Boot + MySQL
- Adjust Rules and Skills accordingly

### For Different Projects
Replace Team Task Manager with:
- E-commerce product catalog
- Blog with comments
- Analytics dashboard
- Any CRUD-based application

---

## Additional Resources

### Referenced Materials
- [`Building Value With Cursor.pptx`](../Building%20Value%20With%20Cursor.pptx) - Original 20-min presentation
- [`student_cheatsheet.md`](../student_cheatsheet.md) - Quick reference guide
- [`instructor_timeline.md`](../instructor_timeline.md) - Detailed timing guide
- [`quick_reference_timeline.md`](../quick_reference_timeline.md) - At-a-glance reference

### External Documentation
- Cursor Official Docs: https://cursor.com/docs
- Cursor Rules: https://cursor.com/docs/context/rules
- Cursor Skills: https://cursor.com/docs/context/skills
- Cursor Subagents: https://cursor.com/docs/context/subagents
- MCP Servers: https://github.com/modelcontextprotocol
- Playwright MCP: https://cursor.directory/mcp/playwright

### Community Resources
- Cursor Forum: https://forum.cursor.com
- Cursor Changelog: https://cursor.com/changelog
- Cursor Rules Collection: https://www.cursorhow.com/cursor-rules
- Community Skills: https://skillmd.ai

---

## Quick Start for Instructors

1. **Read** `progressive_cursor_lesson_plan.md` completely
2. **Prepare** demo environment (Node.js, PostgreSQL, Cursor)
3. **Practice** all 8 modules at least once
4. **Record** backup videos for each module
5. **Test** all demos work end-to-end
6. **Print** student materials (cheat sheet, shortcuts)
7. **Deliver** workshop following the timeline
8. **Follow up** with students post-workshop

---

## Version History

- **v1.0** (Feb 11, 2026): Initial progressive lesson plan
- Based on research of Cursor documentation (Rules, Skills, Subagents, MCP)
- Incorporates Memory Bank pattern from existing materials
- Demo-focused format for mixed audience
- 90-minute duration with 8 progressive modules

---

**For questions or modifications, see the main lesson plan file.**
