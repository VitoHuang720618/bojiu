/**
 * Token Refresh Composable
 * Handles automatic token refresh
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'

export function useTokenRefresh() {
  const authStore = useAuthStore()
  const refreshInterval = ref<number | null>(null)
  
  // Refresh token every 50 minutes (tokens expire in 1 hour)
  const REFRESH_INTERVAL = 50 * 60 * 1000 // 50 minutes in milliseconds

  const startTokenRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
    }

    refreshInterval.value = window.setInterval(async () => {
      if (authStore.isAuthenticated) {
        try {
          await authStore.refreshAuthToken()
        } catch (error) {
          console.error('Automatic token refresh failed:', error)
          // The auth store will handle logout on refresh failure
        }
      } else {
        stopTokenRefresh()
      }
    }, REFRESH_INTERVAL)
  }

  const stopTokenRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  onMounted(() => {
    if (authStore.isAuthenticated) {
      startTokenRefresh()
    }
  })

  onUnmounted(() => {
    stopTokenRefresh()
  })

  return {
    startTokenRefresh,
    stopTokenRefresh
  }
}