<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const validatePassword = (password: string): string[] => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('密碼長度至少需要 8 個字符')
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('密碼需要包含至少一個小寫字母')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('密碼需要包含至少一個大寫字母')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('密碼需要包含至少一個數字')
  }
  
  return errors
}

const handleChangePassword = async () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = '請填寫所有欄位'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    error.value = '新密碼與確認密碼不符'
    return
  }
  
  const passwordErrors = validatePassword(newPassword.value)
  if (passwordErrors.length > 0) {
    error.value = passwordErrors.join('、')
    return
  }
  
  error.value = ''
  
  const result = await authStore.changePassword(currentPassword.value, newPassword.value)
  
  if (result.success) {
    alert('密碼變更成功！')
    router.push('/config')
  } else {
    error.value = result.error || '密碼變更失敗'
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="change-password-container">
    <div class="change-password-card">
      <div class="change-password-header">
        <h1>變更密碼</h1>
        <p>為了安全起見，請變更您的預設密碼</p>
      </div>
      
      <form @submit.prevent="handleChangePassword" class="change-password-form">
        <div class="form-group">
          <label>目前密碼</label>
          <div class="password-input">
            <input 
              v-model="currentPassword" 
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="請輸入目前密碼"
              :disabled="authStore.isLoading"
              required
              autocomplete="current-password"
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="showCurrentPassword = !showCurrentPassword"
              :disabled="authStore.isLoading"
            >
              {{ showCurrentPassword ? '隱藏' : '顯示' }}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>新密碼</label>
          <div class="password-input">
            <input 
              v-model="newPassword" 
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="請輸入新密碼"
              :disabled="authStore.isLoading"
              required
              autocomplete="new-password"
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="showNewPassword = !showNewPassword"
              :disabled="authStore.isLoading"
            >
              {{ showNewPassword ? '隱藏' : '顯示' }}
            </button>
          </div>
          <div class="password-requirements">
            <p>密碼要求：</p>
            <ul>
              <li>至少 8 個字符</li>
              <li>包含大寫字母</li>
              <li>包含小寫字母</li>
              <li>包含數字</li>
            </ul>
          </div>
        </div>
        
        <div class="form-group">
          <label>確認新密碼</label>
          <div class="password-input">
            <input 
              v-model="confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="請再次輸入新密碼"
              :disabled="authStore.isLoading"
              required
              autocomplete="new-password"
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
              :disabled="authStore.isLoading"
            >
              {{ showConfirmPassword ? '隱藏' : '顯示' }}
            </button>
          </div>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="button-group">
          <button type="submit" :disabled="authStore.isLoading" class="change-password-btn">
            {{ authStore.isLoading ? '變更中...' : '變更密碼' }}
          </button>
          
          <button type="button" @click="handleLogout" class="logout-btn" :disabled="authStore.isLoading">
            登出
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.change-password-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  background-image: radial-gradient(circle at center, #2c050a 0%, #16181b 100%);
}

.change-password-card {
  width: 100%;
  max-width: 500px;
  padding: var(--spacing-xl);
  background: rgba(35, 35, 35, 0.9);
  border: 1px solid var(--color-primary);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.change-password-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.change-password-header h1 {
  color: var(--color-primary);
  font-size: 24px;
  margin-bottom: var(--spacing-xs);
}

.change-password-header p {
  color: var(--color-accent);
  font-size: 14px;
}

.change-password-form .form-group {
  margin-bottom: var(--spacing-md);
}

.change-password-form label {
  display: block;
  color: var(--color-text);
  margin-bottom: 8px;
  font-size: 14px;
}

.change-password-form input {
  width: 100%;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  color: white;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.change-password-form input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.change-password-form input:disabled {
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

.password-requirements {
  margin-top: 8px;
  padding: 12px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
  border-radius: 6px;
  font-size: 12px;
}

.password-requirements p {
  color: #ffc107;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.password-requirements ul {
  color: var(--color-text);
  margin: 0;
  padding-left: 16px;
}

.password-requirements li {
  margin-bottom: 4px;
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

.button-group {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.change-password-btn {
  flex: 1;
  padding: 12px;
  background: var(--gradient-header);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.change-password-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.change-password-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.logout-btn {
  padding: 12px 24px;
  background: transparent;
  border: 1px solid #666;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.logout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>