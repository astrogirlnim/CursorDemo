/**
 * User interface matching backend UserResponse
 * This is what we receive from the API (password_hash excluded)
 */
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

/**
 * Auth response from backend
 * Returned by /api/auth/register and /api/auth/login
 */
export interface AuthResponse {
  token: string;
  user: User;
}
