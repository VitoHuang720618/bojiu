import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type LoginRequest } from '../services/api'

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

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const tokenRefreshTimer = ref<number | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Token refresh timer (50 minutes)
  const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000

  const startTokenRefreshTimer = () => {
    if (tokenRefreshTimer.value) {
      clearInterval(tokenRefreshTimer.value)
    }

    tokenRefreshTimer.value = window.setInterval(async () => {
      if (isAuthenticated.value) {
        await refreshAuthToken()
      } else {
        stopTokenRefreshTimer()
      }
    }, TOKEN_REFRESH_INTERVAL)
  }

  const stopTokenRefreshTimer = () => {
    if (tokenRefreshTimer.value) {
      clearInterval(tokenRefreshTimer.value)
      tokenRefreshTimer.value = null
    }
  }

  // Initialize user from stored data
  const initializeAuth = async () => {
    const storedUser = localStorage.getItem('user_data')
    if (storedUser && token.value) {
      try {
        user.value = JSON.parse(storedUser)
        // Verify token is still valid
        await apiService.getCurrentUser()
        // Start token refresh timer
        startTokenRefreshTimer()
      } catch (error) {
        console.error('Token validation failed:', error)
        logout()
      }
    }
  }

  const login = async (credentials: LoginRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.login(credentials)
      
      if (response.success && response.user && response.token) {
        user.value = response.user
        token.value = response.token
        refreshToken.value = response.refreshToken || null

        // Store in localStorage
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('user_data', JSON.stringify(response.user))
        if (response.refreshToken) {
          localStorage.setItem('refresh_token', response.refreshToken)
        }

        // Start token refresh timer
        startTokenRefreshTimer()

        return { success: true, user: response.user }
      } else {
        error.value = response.error || 'Login failed'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await apiService.logout()
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Stop token refresh timer
      stopTokenRefreshTimer()
      
      // Clear state regardless of API call success
      user.value = null
      token.value = null
      refreshToken.value = null
      error.value = null

      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
    }
  }

  const refreshAuthToken = async () => {
    if (!refreshToken.value) {
      logout()
      return false
    }

    try {
      const response = await apiService.refreshToken(refreshToken.value)
      
      if (response.success && response.token) {
        token.value = response.token
        refreshToken.value = response.refreshToken || refreshToken.value

        localStorage.setItem('auth_token', response.token)
        if (response.refreshToken) {
          localStorage.setItem('refresh_token', response.refreshToken)
        }

        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.changePassword({
        currentPassword,
        newPassword
      })

      if (response.success) {
        // Update user's mustChangePassword flag if needed
        if (user.value) {
          user.value.mustChangePassword = false
          localStorage.setItem('user_data', JSON.stringify(user.value))
        }
        return { success: true }
      } else {
        error.value = response.error || 'Password change failed'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password change failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    initializeAuth,
    login,
    logout,
    refreshAuthToken,
    changePassword,
    startTokenRefreshTimer,
    stopTokenRefreshTimer
  }
})
