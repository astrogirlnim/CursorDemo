import { User, AuthResponse } from '../types/user.types';

/**
 * API base URL from environment variable
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * LocalStorage key for JWT token
 */
const TOKEN_KEY = 'auth_token';

/**
 * Auth Service - handles authentication API calls
 * Provides methods for register, login, getCurrentUser, and token management
 */
export class AuthService {
  /**
   * Register a new user
   * @param data - Registration data (email, password, name)
   * @returns AuthResponse with token and user
   */
  static async register(email: string, password: string, name: string): Promise<AuthResponse> {
    console.log('[AuthService] Registering user:', email);
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[AuthService] Registration failed:', result.message);
      throw new Error(result.message || 'Registration failed');
    }

    console.log('[AuthService] Registration successful');
    return result.data;
  }

  /**
   * Login with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns AuthResponse with token and user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    console.log('[AuthService] Logging in user:', email);
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[AuthService] Login failed:', result.message);
      throw new Error(result.message || 'Login failed');
    }

    console.log('[AuthService] Login successful');
    return result.data;
  }

  /**
   * Get current user from token
   * @param token - JWT token
   * @returns User object
   */
  static async getCurrentUser(token: string): Promise<User> {
    console.log('[AuthService] Fetching current user...');
    
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[AuthService] Failed to get current user:', result.message);
      throw new Error(result.message || 'Failed to get current user');
    }

    console.log('[AuthService] Current user fetched:', result.data.user.email);
    return result.data.user;
  }

  /**
   * Save token to localStorage
   * @param token - JWT token to store
   */
  static setToken(token: string): void {
    console.log('[AuthService] Saving token to localStorage');
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Get token from localStorage
   * @returns Token string or null if not found
   */
  static getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('[AuthService] Getting token from localStorage:', token ? 'Found' : 'Not found');
    return token;
  }

  /**
   * Remove token from localStorage
   * Used during logout
   */
  static removeToken(): void {
    console.log('[AuthService] Removing token from localStorage');
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   * @returns True if token exists, false otherwise
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const isAuth = token !== null;
    console.log('[AuthService] Is authenticated:', isAuth);
    return isAuth;
  }
}
