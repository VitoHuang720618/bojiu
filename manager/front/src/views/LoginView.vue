<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

// Check if user is already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/config')
  }
})

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '請輸入帳號和密碼'
    return
  }
  
  error.value = ''
  
  const result = await authStore.login({
    username: username.value,
    password: password.value
  })
  
  if (result.success) {
    // Check if user must change password
    if (result.user?.mustChangePassword) {
      router.push('/change-password')
    } else {
      router.push('/config')
    }
  } else {
    error.value = result.error || '登入失敗，請檢查帳號密碼'
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="login-container">
    <div class="login-shell">
      <aside class="login-brand" aria-hidden="true">
        <div class="brand-mark">✉</div>
        <div>
          <span class="brand-eyebrow">MAIL ADMINISTRATION</span>
          <h2>郵件管理<br />安全掌握</h2>
          <p>集中管理郵件帳號與系統服務。</p>
        </div>
        <div class="brand-grid"></div>
      </aside>

    <div class="login-card">
      <div class="login-header">
        <h1>郵件管理系統</h1>
        <p>請使用您的系統帳號登入</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>帳號</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="請輸入帳號"
            :disabled="authStore.isLoading"
            required
            autocomplete="username"
          />
        </div>
        
        <div class="form-group">
          <label>密碼</label>
          <div class="password-input">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="請輸入密碼"
              :disabled="authStore.isLoading"
              required
              autocomplete="current-password"
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="togglePasswordVisibility"
              :disabled="authStore.isLoading"
            >
              {{ showPassword ? '隱藏' : '顯示' }}
            </button>
          </div>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button type="submit" :disabled="authStore.isLoading" class="login-btn">
          {{ authStore.isLoading ? '登入中...' : '登入' }}
        </button>
      </form>
      
      <div class="login-footer">
        <p>© 2025 Mail Administration System</p>
      </div>
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
  box-sizing: border-box;
}

.login-form input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.login-form input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-input {
  position: relative;
  display: flex;
}

.password-input input {
  flex: 1;
  padding-right: 60px;
}

.password-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.password-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: var(--spacing-md);
  font-size: 14px;
  text-align: center;
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

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
  color: #666;
  font-size: 12px;
}

.login-footer p:first-child {
  color: var(--color-accent);
  margin-bottom: 8px;
  font-weight: 500;
}

/* Refined admin entry screen */
.login-container {
  min-height: 100vh;
  height: auto;
  padding: 2rem;
  background: #eef1f4;
}

.login-shell {
  width: min(100%, 880px);
  min-height: 520px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  overflow: hidden;
  border: 1px solid #d7dde4;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(30, 41, 59, 0.1);
}

.login-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.75rem;
  overflow: hidden;
  color: #f8fafc;
  background: #34495e;
}

.login-brand::before {
  display: none;
}

.brand-mark,
.login-brand > div:not(.brand-grid) { position: relative; z-index: 1; }
.brand-mark { font-size: 1.6rem; font-weight: 600; letter-spacing: 0; color: #d7e0e9; }
.brand-eyebrow { display: block; margin-bottom: 0.9rem; color: #b8c5d1; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; }
.login-brand h2 { margin: 0; font-size: clamp(1.85rem, 3vw, 2.5rem); line-height: 1.25; font-weight: 600; letter-spacing: 0; }
.login-brand p { max-width: 17rem; margin: 0.85rem 0 0; color: #c4ced8; font-size: 0.9rem; line-height: 1.7; }
.brand-grid { display: none; }

.login-card {
  max-width: none;
  margin: 0;
  padding: 3rem;
  border: 0;
  border-radius: 0;
  background: #ffffff;
  box-shadow: none;
  backdrop-filter: none;
}

.login-header { text-align: left; margin-bottom: 2.4rem; }
.login-header h1 { color: #25384b; font-size: 1.55rem; letter-spacing: 0; }
.login-header p { color: #718096; }
.login-form label { color: #40556c; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.04em; }
.login-form input { background: #f8fafc; border-color: #dbe4ed; border-radius: 9px; color: #1c2d3f; }
.login-form input:focus { border-color: #607d99; box-shadow: 0 0 0 3px rgba(96, 125, 153, 0.12); }
.password-toggle { color: #526b84; font-weight: 600; }
.login-btn { padding: 0.82rem 1rem; border-radius: 7px; background: #405b76; box-shadow: none; }
.login-btn:hover:not(:disabled) { background: #344d66; opacity: 1; transform: none; }
.login-footer { margin-top: 2.2rem; text-align: left; color: #94a3b8; }
.login-footer p:first-child { color: #94a3b8; font-weight: 400; }
.error-message { border-radius: 9px; text-align: left; }

@media (max-width: 720px) {
  .login-container { padding: 1rem; }
  .login-shell { grid-template-columns: 1fr; min-height: 0; }
  .login-brand { min-height: 190px; padding: 1.8rem; }
  .login-brand h2 { font-size: 1.65rem; }
  .login-brand p { display: none; }
  .login-card { padding: 2rem 1.5rem; }
}
</style>
