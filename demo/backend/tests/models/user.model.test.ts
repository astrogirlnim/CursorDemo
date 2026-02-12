import { Pool } from 'pg';
import { UserModel, CreateUserDTO } from '../../src/models/user.model';
import { clearDatabase, testPool } from '../setup';
import { createTestUser } from '../utils/testDb';

describe('UserModel', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = testPool;
  });

  beforeEach(async () => {
    await clearDatabase();
    console.log('[UserModel Test] Database cleared');
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      console.log('[Test] Creating new user...');
      
      const userData: CreateUserDTO = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        name: 'New User',
      };

      const user = await UserModel.createUser(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe(userData.password); // Password should be hashed
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();

      console.log('[Test] User created successfully:', user.id);
    });

    it('should hash password with bcrypt', async () => {
      console.log('[Test] Verifying password hashing...');
      
      const userData: CreateUserDTO = {
        email: 'hashtest@example.com',
        password: 'mypassword',
        name: 'Hash Test',
      };

      const user = await UserModel.createUser(userData);

      // Verify password is hashed (bcrypt hashes start with $2a$ or $2b$)
      expect(user.password_hash).toMatch(/^\$2[ab]\$/);
      console.log('[Test] Password correctly hashed with bcrypt');
    });

    it('should throw error for duplicate email', async () => {
      console.log('[Test] Testing duplicate email constraint...');
      
      const userData: CreateUserDTO = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'Duplicate Test',
      };

      await UserModel.createUser(userData);

      // Try to create another user with same email
      await expect(UserModel.createUser(userData)).rejects.toThrow();
      console.log('[Test] Duplicate email correctly rejected');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      console.log('[Test] Finding user by email...');
      
      const testUser = await createTestUser(pool, 'find@example.com', 'password123', 'Find Test');

      const foundUser = await UserModel.findByEmail('find@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(testUser.id);
      expect(foundUser?.email).toBe(testUser.email);
      expect(foundUser?.name).toBe(testUser.name);
      console.log('[Test] User found successfully');
    });

    it('should return null for non-existent email', async () => {
      console.log('[Test] Testing non-existent email...');
      
      const foundUser = await UserModel.findByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
      console.log('[Test] Correctly returned null for non-existent email');
    });

    it('should be case-sensitive', async () => {
      console.log('[Test] Testing email case sensitivity...');
      
      await createTestUser(pool, 'CaseSensitive@example.com');

      const foundLower = await UserModel.findByEmail('casesensitive@example.com');
      const foundUpper = await UserModel.findByEmail('CaseSensitive@example.com');

      expect(foundLower).toBeNull();
      expect(foundUpper).toBeDefined();
      console.log('[Test] Email search is correctly case-sensitive');
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      console.log('[Test] Finding user by ID...');
      
      const testUser = await createTestUser(pool, 'findbyid@example.com');

      const foundUser = await UserModel.findById(testUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(testUser.id);
      expect(foundUser?.email).toBe(testUser.email);
      console.log('[Test] User found by ID successfully');
    });

    it('should return null for non-existent ID', async () => {
      console.log('[Test] Testing non-existent ID...');
      
      const foundUser = await UserModel.findById(99999);

      expect(foundUser).toBeNull();
      console.log('[Test] Correctly returned null for non-existent ID');
    });
  });

  describe('toResponse', () => {
    it('should remove password_hash from user object', async () => {
      console.log('[Test] Converting user to safe response...');
      
      const testUser = await createTestUser(pool, 'response@example.com');

      const response = UserModel.toResponse(testUser);

      expect(response).toBeDefined();
      expect(response.id).toBe(testUser.id);
      expect(response.email).toBe(testUser.email);
      expect(response.name).toBe(testUser.name);
      expect(response.created_at).toBeDefined();
      expect((response as any).password_hash).toBeUndefined();
      console.log('[Test] Password hash correctly removed from response');
    });
  });

  describe('emailExists', () => {
    it('should return true for existing email', async () => {
      console.log('[Test] Checking if email exists...');
      
      await createTestUser(pool, 'exists@example.com');

      const exists = await UserModel.emailExists('exists@example.com');

      expect(exists).toBe(true);
      console.log('[Test] Correctly identified existing email');
    });

    it('should return false for non-existent email', async () => {
      console.log('[Test] Checking non-existent email...');
      
      const exists = await UserModel.emailExists('doesnotexist@example.com');

      expect(exists).toBe(false);
      console.log('[Test] Correctly identified non-existent email');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      console.log('[Test] Verifying correct password...');
      
      const testUser = await createTestUser(pool, 'verify@example.com', 'correctpassword');

      const isValid = await UserModel.verifyPassword('correctpassword', testUser.password_hash);

      expect(isValid).toBe(true);
      console.log('[Test] Password correctly verified');
    });

    it('should return false for incorrect password', async () => {
      console.log('[Test] Verifying incorrect password...');
      
      const testUser = await createTestUser(pool, 'verify2@example.com', 'correctpassword');

      const isValid = await UserModel.verifyPassword('wrongpassword', testUser.password_hash);

      expect(isValid).toBe(false);
      console.log('[Test] Incorrect password correctly rejected');
    });

    it('should return false for empty password', async () => {
      console.log('[Test] Verifying empty password...');
      
      const testUser = await createTestUser(pool, 'verify3@example.com', 'correctpassword');

      const isValid = await UserModel.verifyPassword('', testUser.password_hash);

      expect(isValid).toBe(false);
      console.log('[Test] Empty password correctly rejected');
    });
  });
});
