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
        <div class="brand-mark">B9</div>
        <div>
          <span class="brand-eyebrow">CONTROL ROOM</span>
          <h2>內容管理<br />從容掌握</h2>
          <p>管理網站內容、視覺與發布設定。</p>
        </div>
        <div class="brand-grid"></div>
      </aside>

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
        <p>© 2025 B9 Entertainment. All rights reserved.</p>
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
  background:
    radial-gradient(circle at 82% 18%, rgba(211, 157, 72, 0.16), transparent 26rem),
    linear-gradient(135deg, #0a1624 0%, #12283c 55%, #0c1827 100%);
}

.login-shell {
  width: min(100%, 960px);
  min-height: 560px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  overflow: hidden;
  border: 1px solid rgba(238, 191, 112, 0.25);
  border-radius: 22px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.36);
}

.login-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem;
  overflow: hidden;
  color: #f8fafc;
  background: linear-gradient(155deg, #183750 0%, #122b42 56%, #0d1e30 100%);
}

.login-brand::before {
  content: '';
  position: absolute;
  width: 22rem;
  height: 22rem;
  right: -8rem;
  top: -10rem;
  border: 1px solid rgba(238, 191, 112, 0.32);
  border-radius: 50%;
  box-shadow: 0 0 0 28px rgba(238, 191, 112, 0.04), 0 0 0 56px rgba(238, 191, 112, 0.025);
}

.brand-mark,
.login-brand > div:not(.brand-grid) { position: relative; z-index: 1; }
.brand-mark { font-size: 2.1rem; font-weight: 800; letter-spacing: 0.12em; color: #f1bc6d; }
.brand-eyebrow { display: block; margin-bottom: 1rem; color: #e7b769; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.16em; }
.login-brand h2 { margin: 0; font-size: clamp(2rem, 4vw, 3rem); line-height: 1.18; letter-spacing: 0.02em; }
.login-brand p { max-width: 17rem; margin: 1rem 0 0; color: #b9c8d7; font-size: 0.95rem; line-height: 1.8; }
.brand-grid { position: absolute; inset: auto -3rem -5rem auto; width: 18rem; height: 18rem; opacity: 0.22; background-image: linear-gradient(rgba(236, 187, 108, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 187, 108, 0.35) 1px, transparent 1px); background-size: 22px 22px; transform: rotate(15deg); }

.login-card {
  max-width: none;
  margin: 0;
  padding: 3.25rem;
  border: 0;
  border-radius: 0;
  background: #ffffff;
  box-shadow: none;
  backdrop-filter: none;
}

.login-header { text-align: left; margin-bottom: 2.4rem; }
.login-header h1 { color: #172b40; font-size: 1.7rem; letter-spacing: 0.02em; }
.login-header p { color: #718096; }
.login-form label { color: #40556c; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.04em; }
.login-form input { background: #f8fafc; border-color: #dbe4ed; border-radius: 9px; color: #1c2d3f; }
.login-form input:focus { border-color: #c58c3e; box-shadow: 0 0 0 3px rgba(197, 140, 62, 0.14); }
.password-toggle { color: #a16b25; font-weight: 700; }
.login-btn { padding: 0.82rem 1rem; border-radius: 9px; background: linear-gradient(135deg, #b97a2d, #8d511c); box-shadow: 0 8px 18px rgba(148, 83, 25, 0.22); }
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
