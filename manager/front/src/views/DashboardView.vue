<script setup lang="ts">
import WysiwygEditor from '../components/WysiwygEditor.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="dashboard-view">
    <div class="admin-welcome">
      <h2>歡迎回來，{{ authStore.user }}</h2>
      <p>目前系統運行正常，您可以開始管理後台數據。</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>今日訪客</h3>
        <p class="value">1,284</p>
      </div>
      <div class="stat-card">
        <h3>新增用戶</h3>
        <p class="value">42</p>
      </div>
      <div class="stat-card">
        <h3>總營收</h3>
        <p class="value">￥ 52,400</p>
      </div>
    </div>

    <!-- WYSIWYG Editor Section -->
    <div class="content-section">
      <WysiwygEditor />
    </div>
  </div>
</template>

<style scoped>
.admin-welcome {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  background: rgba(186, 8, 31, 0.05);
  border-left: 4px solid var(--color-primary);
  border-radius: 4px;
}

.admin-welcome h2 {
  color: var(--color-primary);
}

.admin-welcome p {
  color: var(--color-accent);
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: #232323;
  padding: var(--spacing-md);
  border-radius: 8px;
  border: 1px solid #333;
}

.stat-card h3 {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 8px;
}

.stat-card .value {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
}

.content-section {
  background: #1a1a1a;
  padding: var(--spacing-md);
  border-radius: 8px;
}

.content-section h3 {
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}
</style>
