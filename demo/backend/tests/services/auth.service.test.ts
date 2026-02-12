import { AuthService } from '../../src/services/auth.service';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeAll(() => {
    // Set JWT secret for tests
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    console.log('[AuthService Test] JWT_SECRET set for testing');
  });

  afterAll(() => {
    // Restore original env
    process.env.JWT_SECRET = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      console.log('[Test] Generating JWT token...');
      
      const userId = 123;
      const token = AuthService.generateToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts

      console.log('[Test] JWT token generated successfully');
    });

    it('should generate different tokens for different users', () => {
      console.log('[Test] Generating tokens for different users...');
      
      const token1 = AuthService.generateToken(1);
      const token2 = AuthService.generateToken(2);

      expect(token1).not.toBe(token2);
      console.log('[Test] Different tokens generated correctly');
    });

    it('should throw error when JWT_SECRET is not set', () => {
      console.log('[Test] Testing missing JWT_SECRET...');
      
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => AuthService.generateToken(1)).toThrow('JWT_SECRET is not configured');

      process.env.JWT_SECRET = originalSecret;
      console.log('[Test] Error correctly thrown for missing JWT_SECRET');
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      console.log('[Test] Verifying valid token...');
      
      const userId = 456;
      const token = AuthService.generateToken(userId);

      const decoded = AuthService.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(userId);

      console.log('[Test] Token verified and decoded successfully');
    });

    it('should return null for invalid token', () => {
      console.log('[Test] Verifying invalid token...');
      
      const decoded = AuthService.verifyToken('invalid.token.here');

      expect(decoded).toBeNull();
      console.log('[Test] Invalid token correctly rejected');
    });

    it('should return null for empty token', () => {
      console.log('[Test] Verifying empty token...');
      
      const decoded = AuthService.verifyToken('');

      expect(decoded).toBeNull();
      console.log('[Test] Empty token correctly rejected');
    });

    it('should return null when JWT_SECRET is not set', () => {
      console.log('[Test] Verifying token without JWT_SECRET...');
      
      const token = AuthService.generateToken(1);
      
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const decoded = AuthService.verifyToken(token);

      expect(decoded).toBeNull();

      process.env.JWT_SECRET = originalSecret;
      console.log('[Test] Token verification correctly failed without JWT_SECRET');
    });

    it('should return null for token with wrong secret', () => {
      console.log('[Test] Verifying token with wrong secret...');
      
      const userId = 789;
      const token = AuthService.generateToken(userId);

      // Change the secret
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'different-secret';

      const decoded = AuthService.verifyToken(token);

      expect(decoded).toBeNull();

      process.env.JWT_SECRET = originalSecret;
      console.log('[Test] Token with wrong secret correctly rejected');
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      console.log('[Test] Hashing password...');
      
      const password = 'mySecurePassword123';
      const hash = await AuthService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[ab]\$/); // bcrypt hash format

      console.log('[Test] Password hashed successfully');
    });

    it('should generate different hashes for same password', async () => {
      console.log('[Test] Generating multiple hashes for same password...');
      
      const password = 'samePassword';
      const hash1 = await AuthService.hashPassword(password);
      const hash2 = await AuthService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
      console.log('[Test] Different hashes generated correctly');
    });

    it('should hash empty string', async () => {
      console.log('[Test] Hashing empty string...');
      
      const hash = await AuthService.hashPassword('');

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ab]\$/);
      console.log('[Test] Empty string hashed successfully');
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      console.log('[Test] Comparing correct password...');
      
      const password = 'correctPassword';
      const hash = await AuthService.hashPassword(password);

      const isMatch = await AuthService.comparePassword(password, hash);

      expect(isMatch).toBe(true);
      console.log('[Test] Correct password verified');
    });

    it('should return false for incorrect password', async () => {
      console.log('[Test] Comparing incorrect password...');
      
      const correctPassword = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hash = await AuthService.hashPassword(correctPassword);

      const isMatch = await AuthService.comparePassword(wrongPassword, hash);

      expect(isMatch).toBe(false);
      console.log('[Test] Incorrect password rejected');
    });

    it('should return false for empty password', async () => {
      console.log('[Test] Comparing empty password...');
      
      const password = 'realPassword';
      const hash = await AuthService.hashPassword(password);

      const isMatch = await AuthService.comparePassword('', hash);

      expect(isMatch).toBe(false);
      console.log('[Test] Empty password rejected');
    });

    it('should handle case-sensitive passwords', async () => {
      console.log('[Test] Testing case sensitivity...');
      
      const password = 'MyPassword';
      const hash = await AuthService.hashPassword(password);

      const lowerMatch = await AuthService.comparePassword('mypassword', hash);
      const upperMatch = await AuthService.comparePassword('MYPASSWORD', hash);
      const correctMatch = await AuthService.comparePassword('MyPassword', hash);

      expect(lowerMatch).toBe(false);
      expect(upperMatch).toBe(false);
      expect(correctMatch).toBe(true);

      console.log('[Test] Password comparison is correctly case-sensitive');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      console.log('[Test] Extracting token from header...');
      
      const token = 'abc123xyz';
      const header = `Bearer ${token}`;

      const extracted = AuthService.extractTokenFromHeader(header);

      expect(extracted).toBe(token);
      console.log('[Test] Token extracted successfully');
    });

    it('should return null for missing header', () => {
      console.log('[Test] Testing missing header...');
      
      const extracted = AuthService.extractTokenFromHeader(undefined);

      expect(extracted).toBeNull();
      console.log('[Test] Correctly returned null for missing header');
    });

    it('should return null for header without Bearer prefix', () => {
      console.log('[Test] Testing header without Bearer...');
      
      const extracted = AuthService.extractTokenFromHeader('abc123xyz');

      expect(extracted).toBeNull();
      console.log('[Test] Correctly returned null for missing Bearer prefix');
    });

    it('should return null for empty token after Bearer', () => {
      console.log('[Test] Testing empty token...');
      
      const extracted = AuthService.extractTokenFromHeader('Bearer ');

      expect(extracted).toBeNull();
      console.log('[Test] Correctly returned null for empty token');
    });

    it('should handle Bearer with lowercase', () => {
      console.log('[Test] Testing lowercase bearer...');
      
      const extracted = AuthService.extractTokenFromHeader('bearer abc123');

      expect(extracted).toBeNull(); // Should be case-sensitive
      console.log('[Test] Lowercase bearer correctly rejected');
    });

    it('should extract token with special characters', () => {
      console.log('[Test] Testing token with special characters...');
      
      const token = 'abc.123-xyz_456';
      const header = `Bearer ${token}`;

      const extracted = AuthService.extractTokenFromHeader(header);

      expect(extracted).toBe(token);
      console.log('[Test] Token with special characters extracted correctly');
    });
  });
});
