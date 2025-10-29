/**
 * API Service for backend communication
 * Handles all HTTP requests to the Trainlytics API
 */

import {
  UserSignup,
  UserLogin,
  TokenResponse,
  RefreshTokenRequest,
  UserProfile,
  UserProfileUpdate,
  ConnectionPublic,
  OAuthInitRequest,
  OAuthInitResponse,
  OAuthCallbackRequest,
  OAuthCallbackResponse,
  Activity,
  ActivityCreate,
  ActivityUpdate,
  Workout,
  WorkoutCreate,
  WorkoutUpdate,
  MessageResponse,
  ErrorResponse,
  ApiError,
} from '../types/api';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Set auth token in localStorage
 */
const setAuthToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

/**
 * Remove auth token from localStorage
 */
const removeAuthToken = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle error responses
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        error: 'Unknown error',
        detail: response.statusText,
      }));

      throw new ApiError(
        response.status,
        errorData.error || 'Request failed',
        errorData.detail
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      0,
      'Network error',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Auth API
 */
export const authApi = {
  /**
   * Sign up a new user
   */
  async signup(data: UserSignup): Promise<TokenResponse> {
    const response = await fetchApi<TokenResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setAuthToken(response.access_token);
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  },

  /**
   * Login with email and password
   */
  async login(credentials: UserLogin): Promise<TokenResponse> {
    const response = await fetchApi<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    setAuthToken(response.access_token);
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new ApiError(401, 'No refresh token available');
    }

    const data: RefreshTokenRequest = { refresh_token: refreshToken };
    const response = await fetchApi<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setAuthToken(response.access_token);
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<MessageResponse> {
    try {
      const response = await fetchApi<MessageResponse>('/auth/logout', {
        method: 'POST',
      });
      return response;
    } finally {
      removeAuthToken();
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    return fetchApi<UserProfile>('/auth/me');
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: UserProfileUpdate): Promise<UserProfile> {
    return fetchApi<UserProfile>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete current user account
   */
  async deleteAccount(): Promise<MessageResponse> {
    const response = await fetchApi<MessageResponse>('/auth/me', {
      method: 'DELETE',
    });
    removeAuthToken();
    return response;
  },
};

/**
 * Connections API
 */
export const connectionsApi = {
  /**
   * Get all connections for current user
   */
  async getConnections(): Promise<ConnectionPublic[]> {
    return fetchApi<ConnectionPublic[]>('/connections');
  },

  /**
   * Get a specific connection by ID
   */
  async getConnection(connectionId: string): Promise<ConnectionPublic> {
    return fetchApi<ConnectionPublic>(`/connections/${connectionId}`);
  },

  /**
   * Delete a connection
   */
  async deleteConnection(connectionId: string): Promise<MessageResponse> {
    return fetchApi<MessageResponse>(`/connections/${connectionId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Sync activities from a connection
   */
  async syncConnection(connectionId: string): Promise<MessageResponse> {
    return fetchApi<MessageResponse>(`/connections/${connectionId}/sync`, {
      method: 'POST',
    });
  },
};

/**
 * OAuth API
 */
export const oauthApi = {
  /**
   * Initialize OAuth flow
   */
  async initOAuth(data: OAuthInitRequest): Promise<OAuthInitResponse> {
    return fetchApi<OAuthInitResponse>('/oauth/init', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Handle OAuth callback
   */
  async handleCallback(data: OAuthCallbackRequest): Promise<OAuthCallbackResponse> {
    return fetchApi<OAuthCallbackResponse>('/oauth/callback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Activities API
 */
export const activitiesApi = {
  /**
   * Get all activities for current user
   */
  async getActivities(params?: {
    limit?: number;
    offset?: number;
    activity_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Activity[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.activity_type) queryParams.set('activity_type', params.activity_type);
    if (params?.start_date) queryParams.set('start_date', params.start_date);
    if (params?.end_date) queryParams.set('end_date', params.end_date);

    const query = queryParams.toString();
    return fetchApi<Activity[]>(`/activities${query ? `?${query}` : ''}`);
  },

  /**
   * Get a specific activity by ID
   */
  async getActivity(activityId: string): Promise<Activity> {
    return fetchApi<Activity>(`/activities/${activityId}`);
  },

  /**
   * Create a new activity
   */
  async createActivity(data: ActivityCreate): Promise<Activity> {
    return fetchApi<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an activity
   */
  async updateActivity(activityId: string, data: ActivityUpdate): Promise<Activity> {
    return fetchApi<Activity>(`/activities/${activityId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an activity
   */
  async deleteActivity(activityId: string): Promise<MessageResponse> {
    return fetchApi<MessageResponse>(`/activities/${activityId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Workouts API
 */
export const workoutsApi = {
  /**
   * Get all workouts for current user
   */
  async getWorkouts(params?: {
    limit?: number;
    offset?: number;
    completed?: boolean;
  }): Promise<Workout[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.completed !== undefined) queryParams.set('completed', params.completed.toString());

    const query = queryParams.toString();
    return fetchApi<Workout[]>(`/workouts${query ? `?${query}` : ''}`);
  },

  /**
   * Get a specific workout by ID
   */
  async getWorkout(workoutId: string): Promise<Workout> {
    return fetchApi<Workout>(`/workouts/${workoutId}`);
  },

  /**
   * Create a new workout
   */
  async createWorkout(data: WorkoutCreate): Promise<Workout> {
    return fetchApi<Workout>('/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a workout
   */
  async updateWorkout(workoutId: string, data: WorkoutUpdate): Promise<Workout> {
    return fetchApi<Workout>(`/workouts/${workoutId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a workout
   */
  async deleteWorkout(workoutId: string): Promise<MessageResponse> {
    return fetchApi<MessageResponse>(`/workouts/${workoutId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Complete a workout
   */
  async completeWorkout(workoutId: string, activityId?: string): Promise<Workout> {
    return fetchApi<Workout>(`/workouts/${workoutId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ activity_id: activityId }),
    });
  },
};

/**
 * Export all API methods
 */
export const api = {
  auth: authApi,
  connections: connectionsApi,
  oauth: oauthApi,
  activities: activitiesApi,
  workouts: workoutsApi,
};

export default api;
