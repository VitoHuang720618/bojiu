<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert('請輸入帳號密碼')
    return
  }
  
  isLoading.value = true
  
  // 模擬登入延遲
  setTimeout(() => {
    authStore.login(username.value)
    isLoading.value = false
    router.push('/dashboard')
  }, 800)
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>B9 管理系統</h1>
        <p>請登入您的帳號</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>帳號</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="請輸入帳號"
            required
          />
        </div>
        
        <div class="form-group">
          <label>密碼</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="請輸入密碼"
            required
          />
        </div>
        
        <button type="submit" :disabled="isLoading" class="login-btn">
          {{ isLoading ? '登入中...' : '登入' }}
        </button>
      </form>
      
      <div class="login-footer">
        <p>© 2025 B9 Entertainment. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  background-image: radial-gradient(circle at center, #2c050a 0%, #16181b 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-xl);
  background: rgba(35, 35, 35, 0.9);
  border: 1px solid var(--color-primary);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-header h1 {
  color: var(--color-primary);
  font-size: 24px;
  margin-bottom: var(--spacing-xs);
}

.login-header p {
  color: var(--color-accent);
  font-size: 14px;
}

.login-form .form-group {
  margin-bottom: var(--spacing-md);
}

.login-form label {
  display: block;
  color: var(--color-text);
  margin-bottom: 8px;
  font-size: 14px;
}

.login-form input {
  width: 100%;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  color: white;
  transition: border-color 0.3s;
}

.login-form input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: var(--gradient-header);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  margin-top: var(--spacing-sm);
  transition: transform 0.2s, opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
  color: #666;
  font-size: 12px;
}
</style>
