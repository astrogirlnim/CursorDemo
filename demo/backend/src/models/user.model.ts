import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import { handleDatabaseError } from '../utils/errors';

/**
 * User interface matching database schema
 * Note: password_hash should NEVER be returned to clients
 */
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * DTO for creating a new user (registration)
 * Plain password is provided, will be hashed before storage
 */
export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

/**
 * Safe user response that excludes sensitive data
 * This is what gets returned to clients
 */
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  created_at: Date;
}

/**
 * User Model - handles all database operations for users
 * Includes password hashing and secure user data handling
 */
export class UserModel {
  /**
   * Create a new user with hashed password
   * @param data - User registration data with plain password
   * @returns Newly created user with hashed password
   */
  static async createUser(data: CreateUserDTO): Promise<User> {
    console.log('[UserModel] Creating new user:', data.email);
    
    try {
      const { email, password, name } = data;
      
      // Hash password with bcrypt (10 salt rounds for security)
      console.log('[UserModel] Hashing password...');
      const password_hash = await bcrypt.hash(password, 10);
      console.log('[UserModel] Password hashed successfully');
      
      // Insert user into database with prepared statement
      console.log('[UserModel] Inserting user into database...');
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, name)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [email, password_hash, name]
      );
      
      console.log(`[UserModel] User created successfully with id: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      console.error('[UserModel] Error creating user:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Find a user by email address
   * Used for login authentication
   * @param email - User's email address
   * @returns User with password_hash or null if not found
   */
  static async findByEmail(email: string): Promise<User | null> {
    console.log(`[UserModel] Finding user by email: ${email}`);
    
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        console.log('[UserModel] User not found');
        return null;
      }
      
      console.log(`[UserModel] Found user: ${result.rows[0].name} (id: ${result.rows[0].id})`);
      return result.rows[0];
    } catch (error) {
      console.error('[UserModel] Error finding user by email:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Find a user by ID
   * Used for token verification and user info retrieval
   * @param id - User ID
   * @returns User with password_hash or null if not found
   */
  static async findById(id: number): Promise<User | null> {
    console.log(`[UserModel] Finding user by id: ${id}`);
    
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        console.log('[UserModel] User not found');
        return null;
      }
      
      console.log(`[UserModel] Found user: ${result.rows[0].name} (email: ${result.rows[0].email})`);
      return result.rows[0];
    } catch (error) {
      console.error('[UserModel] Error finding user by ID:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Convert User to UserResponse by removing password_hash
   * CRITICAL: Always use this before returning user data to clients
   * @param user - User object with password_hash
   * @returns Safe user object without password_hash
   */
  static toResponse(user: User): UserResponse {
    console.log(`[UserModel] Converting user ${user.id} to safe response format`);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
    };
  }

  /**
   * Check if an email already exists in the database
   * Uses EXISTS for better performance than COUNT(*)
   * @param email - Email address to check
   * @returns True if email exists, false otherwise
   */
  static async emailExists(email: string): Promise<boolean> {
    console.log(`[UserModel] Checking if email exists: ${email}`);
    
    try {
      const result = await pool.query(
        'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists',
        [email]
      );
      
      const exists = result.rows[0].exists;
      console.log(`[UserModel] Email exists: ${exists}`);
      
      return exists;
    } catch (error) {
      console.error('[UserModel] Error checking email existence:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Verify a password against a stored hash
   * Used during login authentication
   * @param plainPassword - Plain text password from login form
   * @param passwordHash - Hashed password from database
   * @returns True if password matches, false otherwise
   */
  static async verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
    console.log('[UserModel] Verifying password...');
    
    const isValid = await bcrypt.compare(plainPassword, passwordHash);
    
    console.log(`[UserModel] Password verification result: ${isValid ? 'VALID' : 'INVALID'}`);
    return isValid;
  }
}
