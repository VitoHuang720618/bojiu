import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<string | null>(localStorage.getItem('user'))
  const isAuthenticated = computed(() => !!user.value)

  function login(username: string) {
    user.value = username
    localStorage.setItem('user', username)
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
  }

  return {
    user,
    isAuthenticated,
    login,
    logout
  }
})
