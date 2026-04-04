import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from './api';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo mode
const createMockUser = (name: string, email: string, role: UserRole): AuthUser => ({
  id: crypto.randomUUID(),
  name,
  email,
  role,
  createdAt: new Date().toISOString(),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('eduvault_token');
    const savedUser = localStorage.getItem('eduvault_user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Check if server is available
  const checkServerConnection = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    // Try API first, fallback to mock
    try {
      const result = await authApi.login(email, password);

      if (result.error) {
        // Check if it's a network error and fallback to mock
        if (result.error.includes('Network error') || result.error.includes('connect')) {
          // Fallback to mock authentication
          const mockUser = createMockUser(email.split('@')[0], email, role);
          setUser(mockUser);
          localStorage.setItem('eduvault_token', 'mock-token-' + Date.now());
          localStorage.setItem('eduvault_user', JSON.stringify(mockUser));
          setIsMockMode(true);
          return { success: true };
        }
        return { success: false, error: result.error };
      }

      if (result.data) {
        const { user: apiUser, token } = result.data;
        setUser(apiUser);
        localStorage.setItem('edulib_token', token);
        localStorage.setItem('edulib_user', JSON.stringify(apiUser));
        setIsMockMode(false);
        return { success: true };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      // Fallback to mock authentication on any error
      const mockUser = createMockUser(email.split('@')[0], email, role);
      setUser(mockUser);
      localStorage.setItem('edulib_token', 'mock-token-' + Date.now());
      localStorage.setItem('edulib_user', JSON.stringify(mockUser));
      setIsMockMode(true);
      return { success: true };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    // Try API first, fallback to mock
    try {
      const result = await authApi.register(name, email, password, role);

      if (result.error) {
        // Check if it's a network error and fallback to mock
        if (result.error.includes('Network error') || result.error.includes('connect')) {
          // Fallback to mock authentication
          const mockUser = createMockUser(name, email, role);
          setUser(mockUser);
          localStorage.setItem('eduvault_token', 'mock-token-' + Date.now());
          localStorage.setItem('eduvault_user', JSON.stringify(mockUser));
          setIsMockMode(true);
          return { success: true };
        }
        return { success: false, error: result.error };
      }

      if (result.data) {
        const { user: apiUser, token } = result.data;
        setUser(apiUser);
        localStorage.setItem('edulib_token', token);
        localStorage.setItem('edulib_user', JSON.stringify(apiUser));
        setIsMockMode(false);
        return { success: true };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      // Fallback to mock authentication on any error
      const mockUser = createMockUser(name, email, role);
      setUser(mockUser);
      localStorage.setItem('edulib_token', 'mock-token-' + Date.now());
      localStorage.setItem('edulib_user', JSON.stringify(mockUser));
      setIsMockMode(true);
      return { success: true };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsMockMode(false);
    localStorage.removeItem('edulib_token');
    localStorage.removeItem('edulib_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading, isMockMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
