import { TaskModel } from '../../src/models/task.model';
import { cleanupDatabase, createTestUser, createTestTeam, createTestTask } from '../setup';

describe('TaskModel', () => {
  let testUser: any;
  let testTeam: any;

  beforeEach(async () => {
    console.log('[TaskModel Test] Setting up test data');
    await cleanupDatabase();
    
    testUser = await createTestUser('tasktest@example.com', 'Task Test User');
    testTeam = await createTestTeam('Task Test Team', testUser.id);
  });

  describe('create', () => {
    it('should create a new task with all fields', async () => {
      console.log('[TaskModel Test] Testing task creation with all fields');
      
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo' as const,
        priority: 'high' as const,
        assignee_id: testUser.id,
        creator_id: testUser.id,
        team_id: testTeam.id,
      };

      const task = await TaskModel.create(taskData);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.status).toBe(taskData.status);
      expect(task.priority).toBe(taskData.priority);
      expect(task.assignee_id).toBe(taskData.assignee_id);
      expect(task.creator_id).toBe(taskData.creator_id);
      expect(task.team_id).toBe(taskData.team_id);
      expect(task.created_at).toBeDefined();
      expect(task.updated_at).toBeDefined();
    });

    it('should create task with defaults for optional fields', async () => {
      console.log('[TaskModel Test] Testing task creation with defaults');
      
      const task = await TaskModel.create({ title: 'Minimal Task' });

      expect(task).toBeDefined();
      expect(task.title).toBe('Minimal Task');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      console.log('[TaskModel Test] Testing findAll');
      
      await createTestTask('Task 1', testUser.id, testTeam.id);
      await createTestTask('Task 2', testUser.id, testTeam.id);
      await createTestTask('Task 3', testUser.id, testTeam.id);

      const result = await TaskModel.findAll();

      expect(result.tasks).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should return paginated tasks', async () => {
      console.log('[TaskModel Test] Testing findAll with pagination');
      
      for (let i = 1; i <= 5; i++) {
        await createTestTask(`Task ${i}`, testUser.id, testTeam.id);
      }

      const result = await TaskModel.findAll(2, 1);

      expect(result.tasks).toHaveLength(2);
      expect(result.total).toBe(5);
    });
  });

  describe('findById', () => {
    it('should find existing task by ID', async () => {
      console.log('[TaskModel Test] Testing findById');
      
      const created = await createTestTask('Find Me', testUser.id, testTeam.id);
      const found = await TaskModel.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find Me');
    });

    it('should return null for non-existent task', async () => {
      console.log('[TaskModel Test] Testing findById with non-existent ID');
      
      const found = await TaskModel.findById(999999);
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update task fields', async () => {
      console.log('[TaskModel Test] Testing task update');
      
      const task = await createTestTask('Original Title', testUser.id, testTeam.id);
      
      const updated = await TaskModel.update(task.id, {
        title: 'Updated Title',
        status: 'in_progress',
        priority: 'high',
      });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.status).toBe('in_progress');
      expect(updated?.priority).toBe('high');
    });

    it('should return null when updating non-existent task', async () => {
      console.log('[TeamModel Test] Testing update of non-existent task');
      
      const updated = await TaskModel.update(999999, { title: 'New Title' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete existing task', async () => {
      console.log('[TaskModel Test] Testing task deletion');
      
      const task = await createTestTask('Delete Me', testUser.id, testTeam.id);
      
      const deleted = await TaskModel.delete(task.id);
      expect(deleted).toBe(true);

      const found = await TaskModel.findById(task.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent task', async () => {
      console.log('[TaskModel Test] Testing deletion of non-existent task');
      
      const deleted = await TaskModel.delete(999999);
      expect(deleted).toBe(false);
    });
  });

  describe('findByStatus', () => {
    it('should filter tasks by status', async () => {
      console.log('[TaskModel Test] Testing findByStatus');
      
      await createTestTask('Todo Task', testUser.id, testTeam.id, 'todo');
      await createTestTask('In Progress Task', testUser.id, testTeam.id, 'in_progress');
      await createTestTask('Done Task', testUser.id, testTeam.id, 'done');

      const todoTasks = await TaskModel.findByStatus('todo');
      const inProgressTasks = await TaskModel.findByStatus('in_progress');
      const doneTasks = await TaskModel.findByStatus('done');

      expect(todoTasks.tasks).toHaveLength(1);
      expect(inProgressTasks.tasks).toHaveLength(1);
      expect(doneTasks.tasks).toHaveLength(1);
    });
  });

  describe('findByPriority', () => {
    it('should filter tasks by priority', async () => {
      console.log('[TaskModel Test] Testing findByPriority');
      
      await createTestTask('Low Priority', testUser.id, testTeam.id, 'todo', 'low');
      await createTestTask('Medium Priority', testUser.id, testTeam.id, 'todo', 'medium');
      await createTestTask('High Priority', testUser.id, testTeam.id, 'todo', 'high');

      const lowTasks = await TaskModel.findByPriority('low');
      const mediumTasks = await TaskModel.findByPriority('medium');
      const highTasks = await TaskModel.findByPriority('high');

      expect(lowTasks.tasks).toHaveLength(1);
      expect(mediumTasks.tasks).toHaveLength(1);
      expect(highTasks.tasks).toHaveLength(1);
    });
  });

  describe('findByTeamId', () => {
    it('should return tasks for specific team', async () => {
      console.log('[TaskModel Test] Testing findByTeamId');
      
      const team2 = await createTestTeam('Team 2', testUser.id);
      
      await createTestTask('Team 1 Task 1', testUser.id, testTeam.id);
      await createTestTask('Team 1 Task 2', testUser.id, testTeam.id);
      await createTestTask('Team 2 Task', testUser.id, team2.id);

      const team1Tasks = await TaskModel.findByTeamId(testTeam.id);
      const team2Tasks = await TaskModel.findByTeamId(team2.id);

      expect(team1Tasks.tasks).toHaveLength(2);
      expect(team2Tasks.tasks).toHaveLength(1);
    });
  });

  describe('findUnassigned', () => {
    it('should return unassigned tasks for user', async () => {
      console.log('[TaskModel Test] Testing findUnassigned');
      
      await createTestTask('Unassigned 1', testUser.id, null);
      await createTestTask('Unassigned 2', testUser.id, null);
      await createTestTask('Assigned', testUser.id, testTeam.id);

      const unassigned = await TaskModel.findUnassigned(testUser.id);

      expect(unassigned.tasks).toHaveLength(2);
      expect(unassigned.tasks.every(t => t.team_id === null)).toBe(true);
    });
  });
});
