/**
 * API Service
 * Handles HTTP requests to the backend API
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
    isActive: boolean;
    mustChangePassword: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
  };
  token?: string;
  refreshToken?: string;
  error?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  error?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

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

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export interface UsersListResponse {
  success: boolean;
  users?: User[];
  error?: string;
}

export interface UserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class ApiService {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // Use environment variable or default to relative path for container deployment
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    // Remove trailing slash if present
    this.baseUrl = this.baseUrl.replace(/\/$/, '')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipTokenRefresh = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      // Handle token expiration
      if (response.status === 401 && !skipTokenRefresh && endpoint !== '/auth/refresh') {
        const refreshed = await this.handleTokenRefresh();
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(endpoint, options, true);
        } else {
          // Refresh failed, redirect to login
          this.handleAuthFailure();
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }

  private async performTokenRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: RefreshTokenResponse = await response.json();
        if (data.success && data.token) {
          localStorage.setItem('auth_token', data.token);
          if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken);
          }
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private handleAuthFailure(): void {
    // Clear stored tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');

    // Redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, true); // Skip token refresh for login
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return this.request<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, true); // Skip token refresh for refresh endpoint
  }

  async logout(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/me');
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/health');
  }

  // User management endpoints
  async getUsers(): Promise<UsersListResponse> {
    return this.request<UsersListResponse>('/users');
  }

  async getUser(id: number): Promise<UserResponse> {
    return this.request<UserResponse>(`/users/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    return this.request<UserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<UserResponse> {
    return this.request<UserResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();