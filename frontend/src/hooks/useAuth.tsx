/**
 * Authentication hook with session management
 * Provides authentication state and methods
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../services/api';
import {
  UserSignup,
  UserLogin,
  UserProfile,
  UserProfileUpdate,
  ApiError,
} from '../types/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  signup: (data: UserSignup) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UserProfileUpdate) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Wraps the app and provides authentication context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user profile on mount if token exists
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userProfile = await api.auth.getCurrentUser();
        setUser(userProfile);
      } catch (error) {
        console.error('Failed to load user:', error);

        // Try to refresh token if expired
        try {
          await api.auth.refreshToken();
          const userProfile = await api.auth.getCurrentUser();
          setUser(userProfile);
        } catch (refreshError) {
          // If refresh fails, clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = async (credentials: UserLogin) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.auth.login(credentials);

      if (response.user) {
        setUser(response.user as UserProfile);
      } else {
        // Fetch user profile if not included in login response
        const userProfile = await api.auth.getCurrentUser();
        setUser(userProfile);
      }

      // Navigate based on user type
      const userType = response.user?.user_type || 'athlete';
      switch (userType) {
        case 'coach':
          window.location.href = '/coach';
          break;
        case 'pro':
          window.location.href = '/pro';
          break;
        case 'lab':
          window.location.href = '/lab';
          break;
        default:
          window.location.href = '/athlete';
      }
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign up a new user
   */
  const signup = async (data: UserSignup) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.auth.signup(data);

      if (response.user) {
        setUser(response.user as UserProfile);
      } else {
        // Fetch user profile if not included in signup response
        const userProfile = await api.auth.getCurrentUser();
        setUser(userProfile);
      }

      // Navigate based on user type
      const userType = data.user_type || 'athlete';
      switch (userType) {
        case 'coach':
          window.location.href = '/coach';
          break;
        case 'pro':
          window.location.href = '/pro';
          break;
        case 'lab':
          window.location.href = '/lab';
          break;
        default:
          window.location.href = '/athlete';
      }
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Signup failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
      window.location.href = '/';
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (data: UserProfileUpdate) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedProfile = await api.auth.updateProfile(data);
      setUser(updatedProfile);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Profile update failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user profile from server
   */
  const refreshUser = async () => {
    try {
      const userProfile = await api.auth.getCurrentUser();
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
