<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ImageComponent from './ImageComponent.vue'
import ImageButton from './ImageButton.vue'
import { assetManifest } from '../config/assetManifest'
import {
  siteConfig,
  recommendedRoutes,
  recommendedTools,
  videoContent,
  programContent,
  carouselSlides,
  floatAdButtons
} from '../config/siteConfig'

const currentSlide = ref(0)
let carouselInterval: number | null = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % carouselSlides.length
}

const startCarousel = () => {
  carouselInterval = window.setInterval(nextSlide, 3000)
}

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  stopCarousel()
})
</script>

<template>
  <div class="main-inner">
    <!-- Management System Banner -->
    <div id="banner">
      <div class="banner-content">
        <h1>博九娱乐网 - 管理系统</h1>
        <p>B9 Entertainment Website Management System</p>
      </div>
    </div>

    <!-- Main Content -->
    <div id="home-main">
      <div class="home-main__inner">
        <!-- Management Dashboard -->
        <div class="dashboard-section">
          <div class="section-title">
            <h2>管理面板</h2>
          </div>
          
          <div class="dashboard-grid">
            <div class="dashboard-card">
              <h3>內容管理</h3>
              <p>管理網站內容、輪播圖片和推薦連結</p>
            </div>
            
            <div class="dashboard-card">
              <h3>用戶管理</h3>
              <p>管理用戶帳戶和權限設定</p>
            </div>
            
            <div class="dashboard-card">
              <h3>數據統計</h3>
              <p>查看網站訪問統計和用戶行為分析</p>
            </div>
            
            <div class="dashboard-card">
              <h3>系統設定</h3>
              <p>配置系統參數和安全設定</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <div class="section-title">
            <h2>快速操作</h2>
          </div>
          
          <div class="actions-grid">
            <button class="action-btn primary">新增內容</button>
            <button class="action-btn secondary">查看報告</button>
            <button class="action-btn secondary">用戶管理</button>
            <button class="action-btn secondary">系統日誌</button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity">
          <div class="section-title">
            <h2>最近活動</h2>
          </div>
          
          <div class="activity-list">
            <div class="activity-item">
              <span class="time">2024-12-23 14:30</span>
              <span class="action">用戶登入</span>
              <span class="details">管理員 admin 登入系統</span>
            </div>
            
            <div class="activity-item">
              <span class="time">2024-12-23 14:25</span>
              <span class="action">內容更新</span>
              <span class="details">更新了首頁輪播圖片</span>
            </div>
            
            <div class="activity-item">
              <span class="time">2024-12-23 14:20</span>
              <span class="action">系統備份</span>
              <span class="details">自動備份完成</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#banner {
  background: linear-gradient(135deg, #ba081f 0%, #8b0012 100%);
  padding: 3rem 2rem;
  text-align: center;
  color: white;
}

.banner-content h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.banner-content p {
  font-size: 1.2rem;
  opacity: 0.9;
}

#home-main {
  background-color: #0a0a0a;
  background-image: 
    radial-gradient(circle, rgba(80, 80, 80, 0.4) 1.5px, transparent 1.5px),
    radial-gradient(circle, rgba(60, 60, 60, 0.3) 1px, transparent 1px);
  background-size: 16px 16px, 32px 32px;
  background-position: 0 0, 8px 8px;
  border-color: #dfb082;
  border-style: solid;
  border-width: 4px 0;
  padding: 3rem 2rem;
}

.home-main__inner {
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
}

.section-title {
  margin-bottom: 2rem;
}

.section-title h2 {
  color: #ffd08c;
  font-size: 1.8rem;
  border-bottom: 2px solid #dfb082;
  padding-bottom: 0.5rem;
}

.dashboard-section {
  margin-bottom: 3rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #dfb082;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  border-color: #ffd08c;
}

.dashboard-card h3 {
  color: #ffd08c;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.dashboard-card p {
  color: #dfb082;
  line-height: 1.5;
}

.quick-actions {
  margin-bottom: 3rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #ba081f;
  color: white;
}

.action-btn.primary:hover {
  background: #8b0012;
}

.action-btn.secondary {
  background: transparent;
  color: #ffd08c;
  border: 2px solid #dfb082;
}

.action-btn.secondary:hover {
  background: #dfb082;
  color: #000;
}

.recent-activity {
  margin-bottom: 2rem;
}

.activity-list {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #dfb082;
  border-radius: 8px;
  padding: 1.5rem;
}

.activity-item {
  display: grid;
  grid-template-columns: 120px 100px 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #333;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item .time {
  color: #999;
  font-size: 0.9rem;
}

.activity-item .action {
  color: #ffd08c;
  font-weight: 600;
}

.activity-item .details {
  color: #dfb082;
}

@media (max-width: 768px) {
  #banner {
    padding: 2rem 1rem;
  }
  
  .banner-content h1 {
    font-size: 2rem;
  }
  
  .banner-content p {
    font-size: 1rem;
  }
  
  #home-main {
    padding: 2rem 1rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>