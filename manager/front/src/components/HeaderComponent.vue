<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ImageComponent from './ImageComponent.vue'
import { assetManifest } from '../config/assetManifest'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  if (confirm('確定要登出嗎？')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <header id="header">
    <div class="header__logo">
      <ImageComponent
        :src="assetManifest.logo"
        alt="博九娱乐网 - 管理系统"
        :lazy="false"
      />
    </div>
    
    <div class="header__user" v-if="authStore.user">
      <div class="user-info">
        <span class="username">{{ authStore.user.username }}</span>
        <span class="role" :class="authStore.user.role">{{ authStore.user.role === 'admin' ? '管理員' : '用戶' }}</span>
      </div>
      
      <button @click="handleLogout" class="logout-btn" :disabled="authStore.isLoading">
        登出
      </button>
    </div>
  </header>
</template>

<style scoped>
#header {
  align-items: center;
  background: linear-gradient(0deg, #ba081f, #8b0012) #000;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
  display: flex;
  height: 60px;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  position: relative;
  width: 100%;
  z-index: 98;
}

@media (max-width: 1024px) {
  #header {
    height: 40px;
    padding: 0 var(--spacing-md);
  }
}

.header__logo {
  height: 86px;
}

@media (max-width: 1024px) {
  .header__logo {
    height: 56px;
  }
}

.header__logo img {
  display: block;
  height: 100%;
  width: auto;
}

.header__user {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.username {
  color: white;
  font-weight: 500;
  font-size: 14px;
}

.role {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.role.admin {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.role.user {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid #6c757d;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.logout-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.logout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .user-info {
    display: none;
  }
  
  .logout-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>