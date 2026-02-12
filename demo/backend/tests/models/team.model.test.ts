import { Pool } from 'pg';
import { TeamModel } from '../../src/models/team.model';
import { clearDatabase, testPool } from '../setup';
import { createTestUser, createTestTeam, addTeamMember } from '../utils/testDb';

describe('TeamModel', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = testPool;
  });

  beforeEach(async () => {
    await clearDatabase();
    console.log('[TeamModel Test] Database cleared');
  });

  describe('create', () => {
    it('should create a new team and add owner as member', async () => {
      console.log('[Test] Creating new team...');
      
      const user = await createTestUser(pool);

      const team = await TeamModel.create('Engineering Team', user.id);

      expect(team).toBeDefined();
      expect(team.id).toBeDefined();
      expect(team.name).toBe('Engineering Team');
      expect(team.owner_id).toBe(user.id);
      expect(team.created_at).toBeDefined();
      expect(team.updated_at).toBeDefined();

      // Verify owner is added as member
      const members = await TeamModel.getMembers(team.id);
      expect(members).toHaveLength(1);
      expect(members[0].user_id).toBe(user.id);
      expect(members[0].role).toBe('owner');

      console.log('[Test] Team created successfully with owner as member');
    });

    it('should handle transaction rollback on error', async () => {
      console.log('[Test] Testing transaction rollback...');
      
      // Try to create team with non-existent user (should fail)
      await expect(TeamModel.create('Bad Team', 99999)).rejects.toThrow();

      // Verify no team was created
      const result = await pool.query('SELECT COUNT(*) FROM teams');
      expect(parseInt(result.rows[0].count)).toBe(0);

      console.log('[Test] Transaction correctly rolled back on error');
    });
  });

  describe('findByUserId', () => {
    it('should find all teams for a user', async () => {
      console.log('[Test] Finding teams for user...');
      
      const user = await createTestUser(pool);

      const team1 = await createTestTeam(pool, 'Team 1', user.id);
      const team2 = await createTestTeam(pool, 'Team 2', user.id);

      const result = await TeamModel.findByUserId(user.id);

      expect(result.teams).toHaveLength(2);
      expect(result.teams[0].id).toBe(team2.id); // Newest first
      expect(result.teams[1].id).toBe(team1.id);
      expect(result.total).toBe(2);

      console.log('[Test] User teams retrieved successfully');
    });

    it('should include teams where user is a member but not owner', async () => {
      console.log('[Test] Finding teams where user is member...');
      
      const owner = await createTestUser(pool, 'owner@example.com');
      const member = await createTestUser(pool, 'member@example.com');

      const team = await createTestTeam(pool, 'Shared Team', owner.id);
      await addTeamMember(pool, team.id, member.id, 'member');

      const result = await TeamModel.findByUserId(member.id);

      expect(result.teams).toHaveLength(1);
      expect(result.teams[0].id).toBe(team.id);

      console.log('[Test] Member teams included correctly');
    });

    it('should return empty result for user with no teams', async () => {
      console.log('[Test] Testing user with no teams...');
      
      const user = await createTestUser(pool);

      const result = await TeamModel.findByUserId(user.id);

      expect(result.teams).toEqual([]);
      expect(result.total).toBe(0);
      console.log('[Test] Empty result returned correctly');
    });
  });

  describe('findById', () => {
    it('should find team by ID', async () => {
      console.log('[Test] Finding team by ID...');
      
      const user = await createTestUser(pool);
      const testTeam = await createTestTeam(pool, 'Find Me', user.id);

      const foundTeam = await TeamModel.findById(testTeam.id);

      expect(foundTeam).toBeDefined();
      expect(foundTeam?.id).toBe(testTeam.id);
      expect(foundTeam?.name).toBe(testTeam.name);
      expect(foundTeam?.owner_id).toBe(user.id);

      console.log('[Test] Team found by ID successfully');
    });

    it('should return null for non-existent ID', async () => {
      console.log('[Test] Testing non-existent team ID...');
      
      const foundTeam = await TeamModel.findById(99999);

      expect(foundTeam).toBeNull();
      console.log('[Test] Correctly returned null for non-existent team');
    });
  });

  describe('getMembers', () => {
    it('should get all members of a team', async () => {
      console.log('[Test] Getting team members...');
      
      const owner = await createTestUser(pool, 'owner@example.com');
      const member1 = await createTestUser(pool, 'member1@example.com');
      const member2 = await createTestUser(pool, 'member2@example.com');

      const team = await createTestTeam(pool, 'Team', owner.id);
      await addTeamMember(pool, team.id, member1.id);
      await addTeamMember(pool, team.id, member2.id);

      const members = await TeamModel.getMembers(team.id);

      expect(members).toHaveLength(3); // Owner + 2 members
      expect(members[0].user_id).toBe(owner.id); // Owner joined first
      expect(members[0].role).toBe('owner');

      console.log('[Test] Team members retrieved successfully');
    });

    it('should return empty array for team with no members', async () => {
      console.log('[Test] Testing team with no members...');
      
      // Create team directly without members (bypass create method)
      const user = await createTestUser(pool);
      const result = await pool.query(
        'INSERT INTO teams (name, owner_id) VALUES ($1, $2) RETURNING *',
        ['Empty Team', user.id]
      );
      const team = result.rows[0];

      const members = await TeamModel.getMembers(team.id);

      expect(members).toEqual([]);
      console.log('[Test] Empty members array returned correctly');
    });
  });

  describe('addMember', () => {
    it('should add a member to team', async () => {
      console.log('[Test] Adding member to team...');
      
      const owner = await createTestUser(pool, 'owner@example.com');
      const newMember = await createTestUser(pool, 'newmember@example.com');

      const team = await createTestTeam(pool, 'Team', owner.id);

      const member = await TeamModel.addMember(team.id, newMember.id);

      expect(member).toBeDefined();
      expect(member.team_id).toBe(team.id);
      expect(member.user_id).toBe(newMember.id);
      expect(member.role).toBe('member');
      expect(member.joined_at).toBeDefined();

      console.log('[Test] Member added successfully');
    });

    it('should throw error for duplicate member', async () => {
      console.log('[Test] Testing duplicate member...');
      
      const owner = await createTestUser(pool, 'owner@example.com');
      const member = await createTestUser(pool, 'member@example.com');

      const team = await createTestTeam(pool, 'Team', owner.id);
      await addTeamMember(pool, team.id, member.id);

      // Try to add same member again
      await expect(TeamModel.addMember(team.id, member.id)).rejects.toThrow();
      console.log('[Test] Duplicate member correctly rejected');
    });
  });

  describe('removeMember', () => {
    it('should remove a member from team', async () => {
      console.log('[Test] Removing member from team...');
      
      const owner = await createTestUser(pool, 'owner@example.com');
      const member = await createTestUser(pool, 'member@example.com');

      const team = await createTestTeam(pool, 'Team', owner.id);
      await addTeamMember(pool, team.id, member.id);

      const removed = await TeamModel.removeMember(team.id, member.id);

      expect(removed).toBe(true);

      // Verify member is removed
      const members = await TeamModel.getMembers(team.id);
      expect(members).toHaveLength(1); // Only owner left
      expect(members[0].user_id).toBe(owner.id);

      console.log('[Test] Member removed successfully');
    });

    it('should return false for non-existent member', async () => {
      console.log('[Test] Removing non-existent member...');
      
      const user = await createTestUser(pool);
      const team = await createTestTeam(pool, 'Team', user.id);

      const removed = await TeamModel.removeMember(team.id, 99999);

      expect(removed).toBe(false);
      console.log('[Test] Correctly returned false for non-existent member');
    });
  });

  describe('isMember', () => {
    it('should return true for team member', async () => {
      console.log('[Test] Checking team membership...');
      
      const owner = await createTestUser(pool, 'owner@example.com');
      const member = await createTestUser(pool, 'member@example.com');

      const team = await createTestTeam(pool, 'Team', owner.id);
      await addTeamMember(pool, team.id, member.id);

      const ownerIsMember = await TeamModel.isMember(team.id, owner.id);
      const memberIsMember = await TeamModel.isMember(team.id, member.id);

      expect(ownerIsMember).toBe(true);
      expect(memberIsMember).toBe(true);

      console.log('[Test] Membership check successful');
    });

    it('should return false for non-member', async () => {
      console.log('[Test] Checking non-member...');
      
      const owner = await createTestUser(pool, 'owner@example.com');
      const nonMember = await createTestUser(pool, 'nonmember@example.com');

      const team = await createTestTeam(pool, 'Team', owner.id);

      const isMember = await TeamModel.isMember(team.id, nonMember.id);

      expect(isMember).toBe(false);
      console.log('[Test] Non-member correctly identified');
    });
  });

  describe('isOwner', () => {
    it('should return true for team owner', async () => {
      console.log('[Test] Checking team ownership...');
      
      const owner = await createTestUser(pool, 'owner@example.com');
      const member = await createTestUser(pool, 'member@example.com');

      const team = await createTestTeam(pool, 'Team', owner.id);
      await addTeamMember(pool, team.id, member.id);

      const ownerCheck = await TeamModel.isOwner(team.id, owner.id);
      const memberCheck = await TeamModel.isOwner(team.id, member.id);

      expect(ownerCheck).toBe(true);
      expect(memberCheck).toBe(false);

      console.log('[Test] Ownership check successful');
    });

    it('should return false for non-owner', async () => {
      console.log('[Test] Checking non-owner...');
      
      const owner = await createTestUser(pool, 'owner@example.com');
      const nonOwner = await createTestUser(pool, 'nonowner@example.com');

      const team = await createTestTeam(pool, 'Team', owner.id);

      const isOwner = await TeamModel.isOwner(team.id, nonOwner.id);

      expect(isOwner).toBe(false);
      console.log('[Test] Non-owner correctly identified');
    });
  });

  describe('delete', () => {
    it('should delete a team', async () => {
      console.log('[Test] Deleting team...');
      
      const user = await createTestUser(pool);
      const team = await createTestTeam(pool, 'Delete Me', user.id);

      const deleted = await TeamModel.delete(team.id);

      expect(deleted).toBe(true);

      // Verify team is deleted
      const foundTeam = await TeamModel.findById(team.id);
      expect(foundTeam).toBeNull();

      // Verify members are deleted (CASCADE)
      const members = await TeamModel.getMembers(team.id);
      expect(members).toEqual([]);

      console.log('[Test] Team and members deleted successfully');
    });

    it('should return false for non-existent team', async () => {
      console.log('[Test] Deleting non-existent team...');
      
      const deleted = await TeamModel.delete(99999);

      expect(deleted).toBe(false);
      console.log('[Test] Correctly returned false for non-existent team');
    });

    it('should cascade delete team members', async () => {
      console.log('[Test] Testing CASCADE delete for members...');
      
      const owner = await createTestUser(pool, 'owner@example.com');
      const member = await createTestUser(pool, 'member@example.com');

      const team = await createTestTeam(pool, 'Team', owner.id);
      await addTeamMember(pool, team.id, member.id);

      // Verify 2 members before delete
      const membersBefore = await TeamModel.getMembers(team.id);
      expect(membersBefore).toHaveLength(2);

      await TeamModel.delete(team.id);

      // Verify members are deleted
      const membersAfter = await TeamModel.getMembers(team.id);
      expect(membersAfter).toEqual([]);

      console.log('[Test] CASCADE delete worked correctly');
    });
  });
});
