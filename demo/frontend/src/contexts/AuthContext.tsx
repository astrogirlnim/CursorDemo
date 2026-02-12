import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/user.types';

/**
 * Auth Context Type Definition
 * Provides authentication state and methods throughout the app
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

/**
 * Auth Context - manages authentication state globally
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * LocalStorage key for storing JWT token
 */
const TOKEN_KEY = 'auth_token';

/**
 * API base URL from environment variable
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Auth Provider Component
 * Wraps the app and provides authentication context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  console.log('[AuthContext] State:', { user: user?.email, hasToken: !!token, loading });

  /**
   * Load token from localStorage and fetch user on mount
   */
  useEffect(() => {
    console.log('[AuthContext] Initializing - checking for stored token...');
    
    const loadUser = async () => {
      try {
        // Check if token exists in localStorage
        const storedToken = localStorage.getItem(TOKEN_KEY);
        
        if (!storedToken) {
          console.log('[AuthContext] No stored token found');
          setLoading(false);
          return;
        }

        console.log('[AuthContext] Stored token found, fetching user...');
        setToken(storedToken);

        // Fetch current user with stored token
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          console.log('[AuthContext] Token validation failed, clearing token');
          // Token is invalid, clear it
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setLoading(false);
          return;
        }

        const result = await response.json();
        console.log('[AuthContext] User fetched successfully:', result.data.user.email);
        setUser(result.data.user);
      } catch (error) {
        console.error('[AuthContext] Error loading user:', error);
        // Clear invalid token
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login function - authenticate with email and password
   * @param credentials - Email and password
   */
  const login = async (credentials: LoginCredentials) => {
    console.log('[AuthContext] Logging in user:', credentials.email);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[AuthContext] Login failed:', result.message);
        throw new Error(result.message || 'Login failed');
      }

      console.log('[AuthContext] Login successful:', result.data.user.email);

      // Store token in localStorage
      localStorage.setItem(TOKEN_KEY, result.data.token);
      
      // Update state
      setToken(result.data.token);
      setUser(result.data.user);
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    }
  };

  /**
   * Register function - create new user account
   * @param data - Email, password, and name
   */
  const register = async (data: RegisterData) => {
    console.log('[AuthContext] Registering new user:', data.email);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[AuthContext] Registration failed:', result.message);
        throw new Error(result.message || 'Registration failed');
      }

      console.log('[AuthContext] Registration successful:', result.data.user.email);

      // Store token in localStorage
      localStorage.setItem(TOKEN_KEY, result.data.token);
      
      // Update state
      setToken(result.data.token);
      setUser(result.data.user);
    } catch (error) {
      console.error('[AuthContext] Registration error:', error);
      throw error;
    }
  };

  /**
   * Logout function - clear authentication state
   */
  const logout = () => {
    console.log('[AuthContext] Logging out user:', user?.email);
    
    // Clear token from localStorage
    localStorage.removeItem(TOKEN_KEY);
    
    // Clear state
    setToken(null);
    setUser(null);
    
    console.log('[AuthContext] Logout complete');
  };

  /**
   * Context value provided to consumers
   */
  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Custom hook to access auth context
 * @returns AuthContextType
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
