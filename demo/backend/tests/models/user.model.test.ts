import { UserModel } from '../../src/models/user.model';
import { cleanupDatabase, createTestUser } from '../setup';
import bcrypt from 'bcryptjs';

describe('UserModel', () => {
  beforeEach(async () => {
    console.log('[UserModel Test] Cleaning up database before test');
    await cleanupDatabase();
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      console.log('[UserModel Test] Testing user creation');
      
      const userData = {
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      };

      const user = await UserModel.createUser(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe(userData.password);
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();

      // Verify password was hashed correctly
      const isValidPassword = await bcrypt.compare(userData.password, user.password_hash);
      expect(isValidPassword).toBe(true);
    });

    it('should throw error for duplicate email', async () => {
      console.log('[UserModel Test] Testing duplicate email rejection');
      
      const userData = {
        email: 'duplicate@example.com',
        password: 'testpassword123',
        name: 'Test User'
      };

      await UserModel.createUser(userData);

      // Attempt to create user with same email
      await expect(UserModel.createUser(userData)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should find existing user by email', async () => {
      console.log('[UserModel Test] Testing findByEmail with existing user');
      
      const createdUser = await createTestUser('find@example.com', 'Find User');
      const foundUser = await UserModel.findByEmail('find@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(createdUser.email);
      expect(foundUser?.name).toBe(createdUser.name);
    });

    it('should return null for non-existent email', async () => {
      console.log('[UserModel Test] Testing findByEmail with non-existent user');
      
      const foundUser = await UserModel.findByEmail('nonexistent@example.com');
      expect(foundUser).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find existing user by ID', async () => {
      console.log('[UserModel Test] Testing findById with existing user');
      
      const createdUser = await createTestUser('findid@example.com', 'Find By ID User');
      const foundUser = await UserModel.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(createdUser.email);
    });

    it('should return null for non-existent ID', async () => {
      console.log('[UserModel Test] Testing findById with non-existent ID');
      
      const foundUser = await UserModel.findById(999999);
      expect(foundUser).toBeNull();
    });
  });

  describe('emailExists', () => {
    it('should return true for existing email', async () => {
      console.log('[UserModel Test] Testing emailExists with existing email');
      
      await createTestUser('exists@example.com', 'Exists User');
      const exists = await UserModel.emailExists('exists@example.com');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent email', async () => {
      console.log('[UserModel Test] Testing emailExists with non-existent email');
      
      const exists = await UserModel.emailExists('notexists@example.com');
      expect(exists).toBe(false);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      console.log('[UserModel Test] Testing verifyPassword with correct password');
      
      const password = 'correctpassword123';
      const hash = await bcrypt.hash(password, 10);
      
      const isValid = await UserModel.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      console.log('[UserModel Test] Testing verifyPassword with incorrect password');
      
      const password = 'correctpassword123';
      const hash = await bcrypt.hash(password, 10);
      
      const isValid = await UserModel.verifyPassword('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('toResponse', () => {
    it('should remove password_hash from user object', async () => {
      console.log('[UserModel Test] Testing toResponse');
      
      const user = await createTestUser('response@example.com', 'Response User');
      const response = UserModel.toResponse(user);

      expect(response).toBeDefined();
      expect(response.id).toBe(user.id);
      expect(response.email).toBe(user.email);
      expect(response.name).toBe(user.name);
      expect(response.created_at).toBeDefined();
      expect((response as any).password_hash).toBeUndefined();
    });
  });
});
