<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const allMenuItems = [
  { id: 'config', label: '配置管理', icon: '⚙️', path: '/config', roles: ['admin', 'user'] },
  { id: 'users', label: '用戶管理', icon: '👥', path: '/users', roles: ['admin'] },
]

// Filter menu items based on user role
const menuItems = computed(() => {
  if (!authStore.user) return []
  return allMenuItems.filter(item =>
    item.roles.includes(authStore.user!.role)
  )
})

// Get active menu based on current route
const activeMenu = computed(() => {
  const currentPath = route.path
  const activeItem = menuItems.value.find(item => item.path === currentPath)
  return activeItem?.id || 'config'
})

const handleMenuClick = (item: any) => {
  router.push(item.path)
}

const handleLogout = async () => {
  if (confirm('確定要登出嗎？')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>


<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-logo">
      <span class="logo-text" v-show="!isCollapsed">B9 Admin</span>
      <button class="toggle-btn" @click="toggleSidebar" :title="isCollapsed ? '展開' : '收起'">
        {{ isCollapsed ? '☰' : '◀' }}
      </button>
    </div>

    <nav class="sidebar-nav">
      <ul>
        <li v-for="item in menuItems" :key="item.id" :class="{ active: activeMenu === item.id }"
          @click="handleMenuClick(item)">
          <span class="icon">{{ item.icon }}</span>
          <span class="label" v-show="!isCollapsed">{{ item.label }}</span>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-btn" :title="isCollapsed ? '登出系統' : ''">
        <span class="icon">🚪</span>
        <span class="label" v-show="!isCollapsed">登出系統</span>
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
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-logo {
  padding: var(--spacing-lg);
  text-align: center;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.sidebar.collapsed .sidebar-logo {
  justify-content: center;
  padding: 10px;
}

.toggle-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.3s;
}

.toggle-btn:hover {
  color: #fff;
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

.sidebar.collapsed .sidebar-nav li {
  padding: 12px;
  justify-content: center;
}

.sidebar-nav .icon {
  margin-right: 12px;
  font-size: 18px;
}

.sidebar.collapsed .sidebar-nav .icon {
  margin-right: 0;
  font-size: 20px;
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

.sidebar.collapsed .logout-btn {
  padding: 10px 0;
}

.sidebar.collapsed .logout-btn .icon {
  margin-right: 0;
}
</style>
