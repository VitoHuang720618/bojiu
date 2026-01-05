/**
 * User Management System Types
 * Defines interfaces and types for user authentication and management
 */

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UserWithPassword extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  id?: number;
  password: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  mustChangePassword?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
  mustChangePassword?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface JWTPayload {
  sub: string; // user_id
  username: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}

export interface DatabaseUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: number; // SQLite uses integers for booleans
  must_change_password: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}