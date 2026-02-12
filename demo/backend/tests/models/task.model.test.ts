import { Pool } from 'pg';
import { TaskModel, CreateTaskDTO, UpdateTaskDTO } from '../../src/models/task.model';
import { clearDatabase, testPool } from '../setup';
import { createTestUser, createTestTeam, createTestTask } from '../utils/testDb';

describe('TaskModel', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = testPool;
  });

  beforeEach(async () => {
    await clearDatabase();
    console.log('[TaskModel Test] Database cleared');
  });

  describe('create', () => {
    it('should create a new task with required fields', async () => {
      console.log('[Test] Creating new task...');
      
      const taskData: CreateTaskDTO = {
        title: 'Test Task',
        description: 'This is a test task',
      };

      const task = await TaskModel.create(taskData);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.status).toBe('todo'); // Default status
      expect(task.priority).toBe('medium'); // Default priority
      expect(task.created_at).toBeDefined();
      expect(task.updated_at).toBeDefined();

      console.log('[Test] Task created successfully:', task.id);
    });

    it('should create task with all fields', async () => {
      console.log('[Test] Creating task with all fields...');
      
      const user = await createTestUser(pool);
      const team = await createTestTeam(pool, 'Test Team', user.id);

      const taskData: CreateTaskDTO = {
        title: 'Complete Task',
        description: 'Full task data',
        status: 'in_progress',
        priority: 'high',
        assignee_id: user.id,
        creator_id: user.id,
        team_id: team.id,
      };

      const task = await TaskModel.create(taskData);

      expect(task.title).toBe(taskData.title);
      expect(task.status).toBe(taskData.status);
      expect(task.priority).toBe(taskData.priority);
      expect(task.assignee_id).toBe(taskData.assignee_id);
      expect(task.creator_id).toBe(taskData.creator_id);
      expect(task.team_id).toBe(taskData.team_id);

      console.log('[Test] Complete task created successfully');
    });

    it('should create task with minimal data', async () => {
      console.log('[Test] Creating task with minimal data...');
      
      const taskData: CreateTaskDTO = {
        title: 'Minimal Task',
      };

      const task = await TaskModel.create(taskData);

      expect(task.title).toBe('Minimal Task');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
      expect(task.assignee_id).toBeNull();
      expect(task.team_id).toBeNull();

      console.log('[Test] Minimal task created successfully');
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      console.log('[Test] Finding all tasks...');
      
      await createTestTask(pool, { title: 'Task 1' });
      await createTestTask(pool, { title: 'Task 2' });
      await createTestTask(pool, { title: 'Task 3' });

      const result = await TaskModel.findAll();

      expect(result.tasks).toHaveLength(3);
      expect(result.tasks[0].title).toBe('Task 3'); // Newest first
      expect(result.total).toBe(3);
      console.log('[Test] All tasks retrieved successfully');
    });

    it('should return empty result when no tasks exist', async () => {
      console.log('[Test] Testing empty task list...');
      
      const result = await TaskModel.findAll();

      expect(result.tasks).toEqual([]);
      expect(result.total).toBe(0);
      console.log('[Test] Empty result returned correctly');
    });
  });

  describe('findById', () => {
    it('should find task by ID', async () => {
      console.log('[Test] Finding task by ID...');
      
      const testTask = await createTestTask(pool, { title: 'Find Me' });

      const foundTask = await TaskModel.findById(testTask.id);

      expect(foundTask).toBeDefined();
      expect(foundTask?.id).toBe(testTask.id);
      expect(foundTask?.title).toBe(testTask.title);
      console.log('[Test] Task found by ID successfully');
    });

    it('should return null for non-existent ID', async () => {
      console.log('[Test] Testing non-existent task ID...');
      
      const foundTask = await TaskModel.findById(99999);

      expect(foundTask).toBeNull();
      console.log('[Test] Correctly returned null for non-existent task');
    });
  });

  describe('update', () => {
    it('should update task fields', async () => {
      console.log('[Test] Updating task fields...');
      
      const testTask = await createTestTask(pool, { title: 'Original Title', status: 'todo' });

      const updateData: UpdateTaskDTO = {
        title: 'Updated Title',
        status: 'in_progress',
        priority: 'high',
      };

      const updatedTask = await TaskModel.update(testTask.id, updateData);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.status).toBe('in_progress');
      expect(updatedTask?.priority).toBe('high');
      console.log('[Test] Task updated successfully');
    });

    it('should update only provided fields', async () => {
      console.log('[Test] Partial task update...');
      
      const testTask = await createTestTask(pool, { 
        title: 'Original', 
        description: 'Original Description',
        status: 'todo',
      });

      const updateData: UpdateTaskDTO = {
        status: 'done',
      };

      const updatedTask = await TaskModel.update(testTask.id, updateData);

      expect(updatedTask?.title).toBe('Original'); // Unchanged
      expect(updatedTask?.description).toBe('Original Description'); // Unchanged
      expect(updatedTask?.status).toBe('done'); // Changed
      console.log('[Test] Partial update completed successfully');
    });

    it('should return null for non-existent task', async () => {
      console.log('[Test] Updating non-existent task...');
      
      const updatedTask = await TaskModel.update(99999, { title: 'New Title' });

      expect(updatedTask).toBeNull();
      console.log('[Test] Correctly returned null for non-existent task');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      console.log('[Test] Deleting task...');
      
      const testTask = await createTestTask(pool, { title: 'Delete Me' });

      const deleted = await TaskModel.delete(testTask.id);

      expect(deleted).toBe(true);

      // Verify task is deleted
      const foundTask = await TaskModel.findById(testTask.id);
      expect(foundTask).toBeNull();
      console.log('[Test] Task deleted successfully');
    });

    it('should return false for non-existent task', async () => {
      console.log('[Test] Deleting non-existent task...');
      
      const deleted = await TaskModel.delete(99999);

      expect(deleted).toBe(false);
      console.log('[Test] Correctly returned false for non-existent task');
    });
  });

  describe('findByStatus', () => {
    it('should find tasks by status', async () => {
      console.log('[Test] Finding tasks by status...');
      
      await createTestTask(pool, { title: 'Todo 1', status: 'todo' });
      await createTestTask(pool, { title: 'In Progress 1', status: 'in_progress' });
      await createTestTask(pool, { title: 'Done 1', status: 'done' });
      await createTestTask(pool, { title: 'Todo 2', status: 'todo' });

      const todoTasks = await TaskModel.findByStatus('todo');
      const inProgressTasks = await TaskModel.findByStatus('in_progress');
      const doneTasks = await TaskModel.findByStatus('done');

      expect(todoTasks).toHaveLength(2);
      expect(inProgressTasks).toHaveLength(1);
      expect(doneTasks).toHaveLength(1);
      console.log('[Test] Tasks filtered by status successfully');
    });
  });

  describe('findByPriority', () => {
    it('should find tasks by priority', async () => {
      console.log('[Test] Finding tasks by priority...');
      
      await createTestTask(pool, { title: 'Low 1', priority: 'low' });
      await createTestTask(pool, { title: 'Medium 1', priority: 'medium' });
      await createTestTask(pool, { title: 'High 1', priority: 'high' });
      await createTestTask(pool, { title: 'High 2', priority: 'high' });

      const lowTasks = await TaskModel.findByPriority('low');
      const mediumTasks = await TaskModel.findByPriority('medium');
      const highTasks = await TaskModel.findByPriority('high');

      expect(lowTasks).toHaveLength(1);
      expect(mediumTasks).toHaveLength(1);
      expect(highTasks).toHaveLength(2);
      console.log('[Test] Tasks filtered by priority successfully');
    });
  });

  describe('findByTeamId', () => {
    it('should find tasks by team ID', async () => {
      console.log('[Test] Finding tasks by team ID...');
      
      const user = await createTestUser(pool);
      const team1 = await createTestTeam(pool, 'Team 1', user.id);
      const team2 = await createTestTeam(pool, 'Team 2', user.id);

      await createTestTask(pool, { title: 'Team 1 Task 1', team_id: team1.id });
      await createTestTask(pool, { title: 'Team 1 Task 2', team_id: team1.id });
      await createTestTask(pool, { title: 'Team 2 Task 1', team_id: team2.id });

      const team1Tasks = await TaskModel.findByTeamId(team1.id);
      const team2Tasks = await TaskModel.findByTeamId(team2.id);

      expect(team1Tasks).toHaveLength(2);
      expect(team2Tasks).toHaveLength(1);
      console.log('[Test] Tasks filtered by team ID successfully');
    });
  });

  describe('findUnassigned', () => {
    it('should find unassigned tasks for user', async () => {
      console.log('[Test] Finding unassigned tasks...');
      
      const user1 = await createTestUser(pool, 'user1@example.com');
      const user2 = await createTestUser(pool, 'user2@example.com');
      const team = await createTestTeam(pool, 'Team', user1.id);

      await createTestTask(pool, { title: 'User 1 Unassigned', creator_id: user1.id });
      await createTestTask(pool, { title: 'User 2 Unassigned', creator_id: user2.id });
      await createTestTask(pool, { title: 'Team Task', team_id: team.id, creator_id: user1.id });

      const result = await TaskModel.findUnassigned(user1.id);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('User 1 Unassigned');
      console.log('[Test] Unassigned tasks filtered correctly');
    });

    it('should include legacy tasks with null creator_id', async () => {
      console.log('[Test] Finding legacy unassigned tasks...');
      
      const user = await createTestUser(pool);

      await createTestTask(pool, { title: 'Legacy Task', creator_id: undefined });
      await createTestTask(pool, { title: 'User Task', creator_id: user.id });

      const result = await TaskModel.findUnassigned(user.id);

      expect(result.tasks).toHaveLength(2); // Both legacy and user tasks
      console.log('[Test] Legacy tasks included correctly');
    });
  });
});
