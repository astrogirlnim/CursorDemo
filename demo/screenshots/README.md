# Screenshots

This directory contains visual documentation and test artifacts from E2E tests and application screenshots.

## Purpose

Screenshots serve multiple purposes:
1. **Visual regression testing** - Compare UI changes over time
2. **Documentation** - Show application features and workflows
3. **Workshop presentations** - Demonstrate completed functionality
4. **Test artifacts** - Validate E2E test execution

## Expected Screenshots (Module 7 - Playwright MCP)

### User Registration Flow
- `registration-form-filled.png` - Registration form with data entered
- `registration-success.png` - Successful registration redirect
- `registration-validation-errors.png` - Form validation errors displayed

### Task Management Flow
- `task-created.png` - New task in task list
- `task-edited.png` - Task after editing
- `task-deleted-confirmation.png` - Delete confirmation dialog

### Team Collaboration
- `team-created.png` - New team created
- `team-members.png` - Team with multiple members
- `team-tasks.png` - Tasks filtered by team

### Real-Time Features
- `realtime-task-update.png` - Task update appearing in real-time
- `socket-connection.png` - WebSocket connection active

## Generating Screenshots

Screenshots are automatically captured during E2E test execution:

```bash
# Run E2E tests with Playwright
cd frontend
npm run test:e2e

# Screenshots are saved to this directory during test execution
```

## Using Screenshots in Presentations

1. Reference screenshots in documentation using relative paths:
   ```markdown
   ![Registration Success](screenshots/registration-success.png)
   ```

2. Include in README for visual feature documentation

3. Use in workshop slides to show completed functionality

## File Naming Convention

Use descriptive, kebab-case names:
- ✅ `user-login-success.png`
- ✅ `task-status-update.png`
- ✅ `team-member-invite.png`
- ❌ `screenshot1.png`
- ❌ `IMG_001.png`

## Git Tracking

Screenshots are tracked in git to:
- Preserve test artifacts
- Enable visual regression comparison
- Provide documentation assets
- Support workshop presentations

## Cleanup

Remove outdated screenshots when:
- UI significantly changes
- Features are removed
- Tests are updated with new flows
