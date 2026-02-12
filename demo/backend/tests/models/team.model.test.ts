import { TeamModel } from '../../src/models/team.model';
import { cleanupDatabase, createTestUser, createTestTeam } from '../setup';

describe('TeamModel', () => {
  let testUser: any;
  let testUser2: any;

  beforeEach(async () => {
    console.log('[TeamModel Test] Setting up test data');
    await cleanupDatabase();
    
    testUser = await createTestUser('teamtest@example.com', 'Team Test User');
    testUser2 = await createTestUser('teamtest2@example.com', 'Team Test User 2');
  });

  describe('create', () => {
    it('should create a new team and add owner as member', async () => {
      console.log('[TeamModel Test] Testing team creation');
      
      const team = await TeamModel.create('Test Team', testUser.id);

      expect(team).toBeDefined();
      expect(team.id).toBeDefined();
      expect(team.name).toBe('Test Team');
      expect(team.owner_id).toBe(testUser.id);
      expect(team.created_at).toBeDefined();
      expect(team.updated_at).toBeDefined();

      // Verify owner was added as member
      const members = await TeamModel.getMembers(team.id);
      expect(members).toHaveLength(1);
      expect(members[0].user_id).toBe(testUser.id);
      expect(members[0].role).toBe('owner');
    });
  });

  describe('findByUserId', () => {
    it('should return teams where user is a member', async () => {
      console.log('[TeamModel Test] Testing findByUserId');
      
      const team1 = await createTestTeam('User Team 1', testUser.id);
      const team2 = await createTestTeam('User Team 2', testUser.id);
      const team3 = await createTestTeam('Other Team', testUser2.id);

      const result = await TeamModel.findByUserId(testUser.id);

      expect(result.teams).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.teams.some(t => t.id === team1.id)).toBe(true);
      expect(result.teams.some(t => t.id === team2.id)).toBe(true);
      expect(result.teams.some(t => t.id === team3.id)).toBe(false);
    });

    it('should return empty array when user has no teams', async () => {
      console.log('[TeamModel Test] Testing findByUserId with no teams');
      
      const result = await TeamModel.findByUserId(testUser.id);

      expect(result.teams).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should support pagination', async () => {
      console.log('[TeamModel Test] Testing findByUserId with pagination');
      
      for (let i = 1; i <= 5; i++) {
        await createTestTeam(`Team ${i}`, testUser.id);
      }

      const result = await TeamModel.findByUserId(testUser.id, 2, 1); // limit: 2, offset: 1

      expect(result.teams).toHaveLength(2);
      expect(result.total).toBe(5);
    });
  });

  describe('findById', () => {
    it('should find existing team by ID', async () => {
      console.log('[TeamModel Test] Testing findById');
      
      const created = await createTestTeam('Find Me Team', testUser.id);
      const found = await TeamModel.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Find Me Team');
      expect(found?.owner_id).toBe(testUser.id);
    });

    it('should return null for non-existent team', async () => {
      console.log('[TeamModel Test] Testing findById with non-existent ID');
      
      const found = await TeamModel.findById(999999);
      expect(found).toBeNull();
    });
  });

  describe('findByIdWithMembers', () => {
    it('should return team with members in single query', async () => {
      console.log('[TeamModel Test] Testing findByIdWithMembers');
      
      const team = await createTestTeam('Team With Members', testUser.id);
      await TeamModel.addMember(team.id, testUser2.id);

      const result = await TeamModel.findByIdWithMembers(team.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(team.id);
      expect(result?.name).toBe('Team With Members');
      expect(result?.members).toHaveLength(2);
      expect(result?.members.some(m => m.user_id === testUser.id)).toBe(true);
      expect(result?.members.some(m => m.user_id === testUser2.id)).toBe(true);
    });

    it('should return null for non-existent team', async () => {
      console.log('[TeamModel Test] Testing findByIdWithMembers with non-existent ID');
      
      const result = await TeamModel.findByIdWithMembers(999999);
      expect(result).toBeNull();
    });
  });

  describe('getMembers', () => {
    it('should return all team members', async () => {
      console.log('[TeamModel Test] Testing getMembers');
      
      const team = await createTestTeam('Members Test Team', testUser.id);
      await TeamModel.addMember(team.id, testUser2.id);

      const members = await TeamModel.getMembers(team.id);

      expect(members).toHaveLength(2);
      expect(members.some(m => m.user_id === testUser.id && m.role === 'owner')).toBe(true);
      expect(members.some(m => m.user_id === testUser2.id && m.role === 'member')).toBe(true);
    });

    it('should return empty array for team with no members', async () => {
      console.log('[TeamModel Test] Testing getMembers with no members (edge case)');
      
      const team = await createTestTeam('No Members Team', testUser.id);
      // Manually remove all members (shouldn't happen in normal flow)
      await TeamModel.removeMember(team.id, testUser.id);

      const members = await TeamModel.getMembers(team.id);
      expect(members).toHaveLength(0);
    });
  });

  describe('addMember', () => {
    it('should add new member to team', async () => {
      console.log('[TeamModel Test] Testing addMember');
      
      const team = await createTestTeam('Add Member Team', testUser.id);
      
      const member = await TeamModel.addMember(team.id, testUser2.id);

      expect(member).toBeDefined();
      expect(member.team_id).toBe(team.id);
      expect(member.user_id).toBe(testUser2.id);
      expect(member.role).toBe('member');
      expect(member.joined_at).toBeDefined();

      // Verify member was added
      const members = await TeamModel.getMembers(team.id);
      expect(members).toHaveLength(2);
    });
  });

  describe('removeMember', () => {
    it('should remove member from team', async () => {
      console.log('[TeamModel Test] Testing removeMember');
      
      const team = await createTestTeam('Remove Member Team', testUser.id);
      await TeamModel.addMember(team.id, testUser2.id);

      const removed = await TeamModel.removeMember(team.id, testUser2.id);
      expect(removed).toBe(true);

      const members = await TeamModel.getMembers(team.id);
      expect(members).toHaveLength(1);
      expect(members[0].user_id).toBe(testUser.id);
    });

    it('should return false when removing non-existent member', async () => {
      console.log('[TeamModel Test] Testing removeMember with non-existent member');
      
      const team = await createTestTeam('Test Team', testUser.id);
      
      const removed = await TeamModel.removeMember(team.id, 999999);
      expect(removed).toBe(false);
    });
  });

  describe('isMember', () => {
    it('should return true for team member', async () => {
      console.log('[TeamModel Test] Testing isMember for member');
      
      const team = await createTestTeam('Membership Test Team', testUser.id);
      await TeamModel.addMember(team.id, testUser2.id);

      const isMember1 = await TeamModel.isMember(team.id, testUser.id);
      const isMember2 = await TeamModel.isMember(team.id, testUser2.id);

      expect(isMember1).toBe(true);
      expect(isMember2).toBe(true);
    });

    it('should return false for non-member', async () => {
      console.log('[TeamModel Test] Testing isMember for non-member');
      
      const team = await createTestTeam('Membership Test Team', testUser.id);
      const isMember = await TeamModel.isMember(team.id, testUser2.id);

      expect(isMember).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true for team owner', async () => {
      console.log('[TeamModel Test] Testing isOwner for owner');
      
      const team = await createTestTeam('Ownership Test Team', testUser.id);
      
      const isOwner = await TeamModel.isOwner(team.id, testUser.id);
      expect(isOwner).toBe(true);
    });

    it('should return false for non-owner member', async () => {
      console.log('[TeamModel Test] Testing isOwner for non-owner');
      
      const team = await createTestTeam('Ownership Test Team', testUser.id);
      await TeamModel.addMember(team.id, testUser2.id);

      const isOwner = await TeamModel.isOwner(team.id, testUser2.id);
      expect(isOwner).toBe(false);
    });

    it('should return false for non-member', async () => {
      console.log('[TeamModel Test] Testing isOwner for non-member');
      
      const team = await createTestTeam('Ownership Test Team', testUser.id);
      const user3 = await createTestUser('user3@example.com', 'User 3');

      const isOwner = await TeamModel.isOwner(team.id, user3.id);
      expect(isOwner).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete team and cascade to members', async () => {
      console.log('[TeamModel Test] Testing team deletion');
      
      const team = await createTestTeam('Delete Test Team', testUser.id);
      await TeamModel.addMember(team.id, testUser2.id);

      const deleted = await TeamModel.delete(team.id);
      expect(deleted).toBe(true);

      const found = await TeamModel.findById(team.id);
      expect(found).toBeNull();

      // Members should also be deleted (cascade)
      const members = await TeamModel.getMembers(team.id);
      expect(members).toHaveLength(0);
    });

    it('should return false when deleting non-existent team', async () => {
      console.log('[TeamModel Test] Testing deletion of non-existent team');
      
      const deleted = await TeamModel.delete(999999);
      expect(deleted).toBe(false);
    });
  });
});
