/**
 * TypeScript types matching backend API schemas
 * Generated from backend/app/schemas.py
 */

// Enums
export enum UserType {
  ATHLETE = 'athlete',
  COACH = 'coach',
  PRO = 'pro',
  LAB = 'lab',
}

export enum ProviderType {
  GARMIN = 'garmin',
  STRAVA = 'strava',
  POLAR = 'polar',
  COROS = 'coros',
  WAHOO = 'wahoo',
  FITBIT = 'fitbit',
}

// Auth types
export interface UserSignup {
  email: string;
  password: string;
  full_name?: string;
  user_type?: UserType;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user?: Record<string, any>;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// User profile types
export interface UserProfileBase {
  full_name?: string;
  avatar_url?: string;
  user_type?: UserType;
  preferences?: Record<string, any>;
}

export interface UserProfileCreate extends UserProfileBase {
  id: string;
  email: string;
}

export interface UserProfileUpdate {
  full_name?: string;
  avatar_url?: string;
  user_type?: UserType;
  preferences?: Record<string, any>;
}

export interface UserProfile extends UserProfileBase {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Connection types
export interface ConnectionBase {
  provider: ProviderType;
  provider_user_id: string;
  provider_email?: string;
  scopes?: string[];
  connection_metadata?: Record<string, any>;
}

export interface ConnectionCreate extends ConnectionBase {
  user_id: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
}

export interface ConnectionUpdate {
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  is_active?: boolean;
  last_sync_at?: string;
  connection_metadata?: Record<string, any>;
}

export interface Connection extends ConnectionBase {
  id: string;
  user_id: string;
  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionPublic {
  id: string;
  provider: ProviderType;
  provider_email?: string;
  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
}

// OAuth types
export interface OAuthInitRequest {
  provider: ProviderType;
  redirect_uri?: string;
}

export interface OAuthInitResponse {
  authorization_url: string;
  state: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
  provider?: ProviderType;
}

export interface OAuthCallbackResponse {
  success: boolean;
  message: string;
  connection?: ConnectionPublic;
}

// Activity types
export interface ActivityBase {
  activity_type: string;
  activity_name?: string;
  start_time: string;
  end_time?: string;
  duration?: number; // seconds
  distance?: number; // meters
  elevation_gain?: number; // meters
  calories?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_power?: number;
  max_power?: number;
  avg_pace?: number; // seconds per km
  avg_speed?: number; // km/h
  activity_data?: Record<string, any>;
}

export interface ActivityCreate extends ActivityBase {
  connection_id?: string;
  external_id?: string;
}

export interface ActivityUpdate {
  activity_name?: string;
  activity_data?: Record<string, any>;
}

export interface Activity extends ActivityBase {
  id: string;
  user_id: string;
  connection_id?: string;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

// Workout types
export interface WorkoutBase {
  workout_name: string;
  workout_type?: string;
  description?: string;
  scheduled_date?: string;
  workout_data?: Record<string, any>;
}

export interface WorkoutCreate extends WorkoutBase {}

export interface WorkoutUpdate {
  workout_name?: string;
  workout_type?: string;
  description?: string;
  scheduled_date?: string;
  completed_at?: string;
  activity_id?: string;
  workout_data?: Record<string, any>;
}

export interface Workout extends WorkoutBase {
  id: string;
  user_id: string;
  completed_at?: string;
  activity_id?: string;
  created_at: string;
  updated_at: string;
}

// Generic response types
export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
}

// API Error type for handling errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public detail?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
