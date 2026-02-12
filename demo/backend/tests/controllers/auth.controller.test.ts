import request from 'supertest';
import express, { Express } from 'express';
import { AuthController } from '../../src/controllers/auth.controller';
import { clearDatabase, testPool } from '../setup';
import { createTestUser } from '../utils/testDb';
import { Pool } from 'pg';

// Mock pool to use test database
jest.mock('../../src/config/database', () => {
  const { testPool } = require('../setup');
  return {
    pool: testPool,
  };
});

describe('AuthController Integration Tests', () => {
  let app: Express;
  let pool: Pool = testPool;

  beforeAll(() => {
    // Set up Express app with auth routes
    app = express();
    app.use(express.json());
    
    // Register routes
    app.post('/api/auth/register', AuthController.register);
    app.post('/api/auth/login', AuthController.login);
    app.get('/api/auth/me', (req, res, next) => {
      // Mock authenticate middleware
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      // Simple mock: extract userId from token (in real tests, verify JWT)
      try {
        const AuthService = require('../../src/services/auth.service').AuthService;
        const decoded = AuthService.verifyToken(token);
        if (!decoded) {
          return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        req.user = { userId: decoded.userId };
        next();
      } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    }, AuthController.getMe);

    console.log('[AuthController Test] Express app configured');
  });

  beforeEach(async () => {
    await clearDatabase();
    process.env.JWT_SECRET = 'test-jwt-secret';
    console.log('[AuthController Test] Database cleared');
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      console.log('[Test] Registering new user...');
      
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.password_hash).toBeUndefined();

      console.log('[Test] User registered successfully');
    });

    it('should return 400 for missing email', async () => {
      console.log('[Test] Testing missing email...');
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123', name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email is required');

      console.log('[Test] Missing email correctly rejected');
    });

    it('should return 400 for missing password', async () => {
      console.log('[Test] Testing missing password...');
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Password is required');

      console.log('[Test] Missing password correctly rejected');
    });

    it('should return 400 for missing name', async () => {
      console.log('[Test] Testing missing name...');
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Name is required');

      console.log('[Test] Missing name correctly rejected');
    });

    it('should return 400 for invalid email format', async () => {
      console.log('[Test] Testing invalid email format...');
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email', password: 'password123', name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email format');

      console.log('[Test] Invalid email format correctly rejected');
    });

    it('should return 400 for password shorter than 8 characters', async () => {
      console.log('[Test] Testing short password...');
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'short', name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('at least 8 characters');

      console.log('[Test] Short password correctly rejected');
    });

    it('should return 409 for duplicate email', async () => {
      console.log('[Test] Testing duplicate email...');
      
      await createTestUser(pool, 'existing@example.com');

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'existing@example.com', password: 'password123', name: 'Test' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email already exists');

      console.log('[Test] Duplicate email correctly rejected');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      console.log('[Test] Logging in with correct credentials...');
      
      await createTestUser(pool, 'login@example.com', 'password123', 'Login User');

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'password123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('login@example.com');
      expect(response.body.data.user.password_hash).toBeUndefined();

      console.log('[Test] Login successful');
    });

    it('should return 400 for missing email', async () => {
      console.log('[Test] Testing login without email...');
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email is required');

      console.log('[Test] Missing email correctly rejected');
    });

    it('should return 400 for missing password', async () => {
      console.log('[Test] Testing login without password...');
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Password is required');

      console.log('[Test] Missing password correctly rejected');
    });

    it('should return 401 for non-existent user', async () => {
      console.log('[Test] Testing login with non-existent user...');
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');

      console.log('[Test] Non-existent user correctly rejected');
    });

    it('should return 401 for incorrect password', async () => {
      console.log('[Test] Testing login with incorrect password...');
      
      await createTestUser(pool, 'user@example.com', 'correctpassword');

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');

      console.log('[Test] Incorrect password correctly rejected');
    });

    it('should not reveal whether email exists', async () => {
      console.log('[Test] Testing generic error message...');
      
      await createTestUser(pool, 'exists@example.com', 'password123');

      // Try with non-existent email
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);

      // Try with wrong password
      const response2 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'exists@example.com', password: 'wrongpassword' })
        .expect(401);

      // Both should have same error message
      expect(response1.body.message).toBe(response2.body.message);

      console.log('[Test] Generic error message prevents email enumeration');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      console.log('[Test] Getting current user...');
      
      const user = await createTestUser(pool, 'current@example.com', 'password123');
      
      const AuthService = require('../../src/services/auth.service').AuthService;
      const token = AuthService.generateToken(user.id);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('current@example.com');
      expect(response.body.data.user.password_hash).toBeUndefined();

      console.log('[Test] Current user retrieved successfully');
    });

    it('should return 401 without token', async () => {
      console.log('[Test] Testing request without token...');
      
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);

      console.log('[Test] Request without token correctly rejected');
    });

    it('should return 401 with invalid token', async () => {
      console.log('[Test] Testing request with invalid token...');
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);

      console.log('[Test] Invalid token correctly rejected');
    });

    it('should return 404 for deleted user', async () => {
      console.log('[Test] Testing deleted user...');
      
      const user = await createTestUser(pool, 'deleted@example.com');
      
      const AuthService = require('../../src/services/auth.service').AuthService;
      const token = AuthService.generateToken(user.id);

      // Delete user
      await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');

      console.log('[Test] Deleted user correctly handled');
    });
  });
});
