import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import { ReactNode } from 'react';

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
    console.log('[AuthContext Test] Test environment reset');
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Initial State', () => {
    it('should have initial state with no user', async () => {
      console.log('[Test] Testing initial state...');
      
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();

      console.log('[Test] Initial state correct');
    });

    it('should throw error when used outside provider', () => {
      console.log('[Test] Testing hook outside provider...');
      
      // Suppress console error for this test
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      spy.mockRestore();
      console.log('[Test] Error correctly thrown');
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      console.log('[Test] Testing login...');
      
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', created_at: new Date() };
      const mockToken = 'mock-jwt-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { token: mockToken, user: mockUser },
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password123' });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(localStorage.getItem('auth_token')).toBe(mockToken);

      console.log('[Test] Login successful');
    });

    it('should handle login failure', async () => {
      console.log('[Test] Testing login failure...');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Invalid credentials',
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login({ email: 'wrong@example.com', password: 'wrong' });
        });
      }).rejects.toThrow();

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();

      console.log('[Test] Login failure handled correctly');
    });
  });

  describe('Register', () => {
    it('should register successfully', async () => {
      console.log('[Test] Testing registration...');
      
      const mockUser = { id: 2, email: 'new@example.com', name: 'New User', created_at: new Date() };
      const mockToken = 'new-jwt-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { token: mockToken, user: mockUser },
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(localStorage.getItem('auth_token')).toBe(mockToken);

      console.log('[Test] Registration successful');
    });

    it('should handle registration failure', async () => {
      console.log('[Test] Testing registration failure...');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Email already exists',
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.register({
            email: 'existing@example.com',
            password: 'password123',
            name: 'Test',
          });
        });
      }).rejects.toThrow();

      expect(result.current.user).toBeNull();

      console.log('[Test] Registration failure handled correctly');
    });
  });

  describe('Logout', () => {
    it('should logout and clear state', async () => {
      console.log('[Test] Testing logout...');
      
      const mockUser = { id: 3, email: 'logout@example.com', name: 'Logout User', created_at: new Date() };
      const mockToken = 'logout-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { token: mockToken, user: mockUser },
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Login first
      await act(async () => {
        await result.current.login({ email: 'logout@example.com', password: 'password123' });
      });

      expect(result.current.user).toEqual(mockUser);

      // Now logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();

      console.log('[Test] Logout successful');
    });
  });

  describe('Token Restoration', () => {
    it('should restore user from stored token on mount', async () => {
      console.log('[Test] Testing token restoration...');
      
      const mockUser = { id: 4, email: 'restored@example.com', name: 'Restored User', created_at: new Date() };
      const storedToken = 'stored-jwt-token';

      localStorage.setItem('auth_token', storedToken);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { user: mockUser },
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(storedToken);

      console.log('[Test] User restored from token successfully');
    });

    it('should clear invalid token on mount', async () => {
      console.log('[Test] Testing invalid token clearance...');
      
      localStorage.setItem('auth_token', 'invalid-token');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Invalid token',
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();

      console.log('[Test] Invalid token cleared correctly');
    });
  });
});
