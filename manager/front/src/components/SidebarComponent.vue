<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  { id: 'config', label: '配置管理', icon: '⚙️', path: '/config' },
  { id: 'users', label: '用戶管理', icon: '👥', path: '/users' },
  { id: 'games', label: '遊戲配置', icon: '🎮', path: '/games' },
  { id: 'finance', label: '財務報表', icon: '💰', path: '/finance' },
  { id: 'settings', label: '系統設置', icon: '🔧', path: '/settings' },
]

const activeMenu = ref('config')

const handleMenuClick = (item: any) => {
  activeMenu.value = item.id
  router.push(item.path)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>


<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="logo-text">B9 Admin</span>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        <li 
          v-for="item in menuItems" 
          :key="item.id"
          :class="{ active: activeMenu === item.id }"
          @click="handleMenuClick(item)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </li>
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-btn">
        <span class="icon">🚪</span>
        <span class="label">登出系統</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background: #1a1c1e;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  color: var(--color-text);
}

.sidebar-logo {
  padding: var(--spacing-lg);
  text-align: center;
  border-bottom: 1px solid #333;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-primary);
  letter-spacing: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-sm) 0;
}

.sidebar-nav ul {
  list-style: none;
}

.sidebar-nav li {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #aaa;
}

.sidebar-nav li:hover {
  background: rgba(186, 8, 31, 0.1);
  color: white;
}

.sidebar-nav li.active {
  background: var(--color-primary);
  color: white;
  border-right: 4px solid var(--color-accent);
}

.sidebar-nav .icon {
  margin-right: 12px;
  font-size: 18px;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid #333;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid #444;
  border-radius: 4px;
  color: #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.logout-btn:hover {
  border-color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

.logout-btn .icon {
  margin-right: 8px;
}
</style>
