<template>
  <div class="config-manager-layout">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" :class="{ 'collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <h1 v-show="!isSidebarCollapsed">配置管理</h1>
        <button class="toggle-btn" @click="isSidebarCollapsed = !isSidebarCollapsed">
          {{ isSidebarCollapsed ? '☰' : '◀' }}
        </button>
      </div>

      <nav class="nav-menu">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]" :title="isSidebarCollapsed ? tab.label : ''">
          <span class="nav-icon" v-if="tab.icon">{{ tab.icon }}</span>
          <span class="nav-label" v-show="!isSidebarCollapsed">{{ tab.label }}</span>
        </button>
        <button v-if="authStore.user?.role === 'admin'" @click="activeTab = 'users'"
          :class="['nav-item', 'nav-item--system', { active: activeTab === 'users' }]"
          :title="isSidebarCollapsed ? '用戶管理' : ''">
          <span class="nav-icon">👥</span>
          <span class="nav-label" v-show="!isSidebarCollapsed">用戶管理</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button @click="loadConfig" class="btn btn-secondary" :title="isSidebarCollapsed ? '重新載入' : ''">
          <span v-if="isSidebarCollapsed">↻</span>
          <span v-else>重新載入</span>
        </button>
        <button @click="saveConfig" class="btn btn-primary" :disabled="!hasChanges"
          :title="isSidebarCollapsed ? '保存配置' : ''">
          <span v-if="isSidebarCollapsed">💾</span>
          <span v-else>保存配置</span>
        </button>
        <div class="publish-section">
          <button @click="publishConfig" class="btn btn-danger btn-block" :disabled="hasChanges"
            :title="isSidebarCollapsed ? '發布為靜態預設' : ''">
            <span v-if="isSidebarCollapsed">🚀</span>
            <span v-else>發布為靜態預設</span>
          </button>
        </div>
        <button @click="handleLogout" class="btn btn-logout btn-block" :title="isSidebarCollapsed ? '登出系統' : ''">
          <span v-if="isSidebarCollapsed">↪</span>
          <span v-else>登出系統</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="panels-container">
        <!-- Editor Pane (Middle) -->
        <div class="editor-pane" v-show="activeTab !== 'preview'">
          <div class="editor-header">
            <h2>{{ currentTabLabel }}</h2>
          </div>

          <div class="editor-body">
            <!-- Basic 配置 -->
            <BasicConfigPanel v-if="activeTab === 'basic'" 
              :logo="config.logo"
              :headerStyles="config.headerStyles"
              :recommendStyles="config.recommendStyles"
              :sectionColors="config.sectionColors"
              :titles="config.titles"
              :getImageUrl="getImageUrl"
              @update:headerStyles="(val) => updateConfigValue('headerStyles', val)"
              @update:recommendStyles="(val) => updateConfigValue('recommendStyles', val)"
              @update:sectionColors="(val) => updateConfigValue('sectionColors', val)"
              @upload="(e, field) => handleImageUpload(e, field as any)"
              @clear="(field) => clearImage(field as any)"
              @uploadTitleImage="(e, field) => uploadTitleImage(e, field as any)"
              @clearTitleImage="(field) => clearTitleImage(field as any)" />

            <!-- Banner 配置 -->
            <BannerConfigPanel v-if="activeTab === 'banner'" :banner="config.banner" :getImageUrl="getImageUrl"
              @upload="handleBannerUpload" @clear="clearBanner" />

            <!-- Background 配置 -->
            <BackgroundConfigPanel v-if="activeTab === 'background'" :backgroundImage="config.backgroundImage"
              :backgroundSettings="config.backgroundSettings"
              :getImageUrl="getImageUrl" @upload="(e) => handleImageUpload(e, 'backgroundImage')"
              @clear="clearImage('backgroundImage')"
              @update:backgroundSettings="(val) => updateConfigValue('backgroundSettings', val)" />

            <!-- Button Links 配置 -->
            <ButtonLinksConfigPanel v-if="activeTab === 'buttonlinks'" :buttonLinks="config.buttonLinks"
              :getImageUrl="getImageUrl" @reset="resetButtonLinks" @add="addButtonLink" @remove="removeButtonLink"
              @upload="handleButtonImageUpload" @removeImage="removeButtonImage" @change="hasChanges = true" />

            <!-- Tool Icons 配置 -->
            <ToolIconsConfigPanel v-if="activeTab === 'toolicons'" :toolIcons="config.toolIcons"
              :getImageUrl="getImageUrl" @reset="resetToolIcons" @add="addToolIcon" @remove="removeToolIcon"
              @upload="handleToolIconImageUpload" @removeImage="removeToolIconImage" @change="hasChanges = true" />

            <!-- Route Links 配置 -->
            <RouteLinksConfigPanel v-if="activeTab === 'routelinks'" :routeLinks="config.routeLinks"
              :getImageUrl="getImageUrl" @reset="resetRouteLinks" @upload="handleRouteLinksImageUpload"
              @removeImage="removeRouteLinksImage" @update="updateRouteLink" />

            <!-- Carousel 配置 -->
            <CarouselConfigPanel v-if="activeTab === 'carousel'" :carouselSlides="config.carouselSlides"
              :getImageUrl="getImageUrl" @add="addCarouselSlide" @remove="removeCarouselSlide"
              @upload="handleCarouselImageUpload" @clearImage="clearCarouselImage" @change="hasChanges = true" />

            <!-- 影片區配置 -->
            <div v-if="activeTab === 'videos'" class="video-sections-panel">
              <ThumbnailConfigPanel title="左側影片區設定" itemLabel="影片"
                :items="config.videoThumbnails" :getImageUrl="getImageUrl" @add="addVideoThumbnail"
                @remove="removeVideoThumbnail" @upload="handleVideoUpload" @removeImage="removeVideoImage"
                @change="hasChanges = true" />

              <ThumbnailConfigPanel title="右側影片區設定" itemLabel="影片"
                :items="config.programThumbnails" :getImageUrl="getImageUrl" @add="addProgramThumbnail"
                @remove="removeProgramThumbnail" @upload="handleProgramUpload" @removeImage="removeProgramImage"
                @change="hasChanges = true" />
            </div>

            <!-- 用戶管理 -->
            <UsersView v-if="activeTab === 'users'" />

            <!-- Float Ad Buttons 配置 -->
            <FloatAdConfigPanel v-if="activeTab === 'floatads'" :floatAdButtons="config.floatAdButtons"
              :getImageUrl="getImageUrl" @reset="resetFloatAdButtons" @add="addFloatAdButton"
              @remove="removeFloatAdButton" @upload="handleFloatAdImageUpload" @removeImage="removeFloatAdImage"
              @change="hasChanges = true" />
          </div>
        </div>

        <!-- Preview Pane (Right) -->
        <div class="preview-pane" v-show="activeTab === 'preview'">
          <div class="preview-header">
            <div class="device-switcher">
              <button v-for="device in devices" :key="device.id"
                :class="['device-btn', { active: previewDevice === device.id }]" @click="previewDevice = device.id"
                :title="device.label">
                <span>{{ device.icon }}</span>
              </button>
            </div>
            <div class="preview-dims">
              {{ currentDeviceWidth }} x {{ currentDeviceHeight }}
            </div>
          </div>

          <div class="preview-viewport-wrapper">
            <div class="preview-viewport" :class="previewDevice">
              <iframe ref="previewFrame" :src="getPreviewUrl()" class="preview-frame" :style="previewFrameStyle"
                @load="onPreviewLoad"></iframe>
            </div>
          </div>
        </div>
      </div> <!-- End of panels-container -->
    </main>

    <!-- Loading and Modals -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">載入中...</div>
    </div>

    <ConfirmModal ref="confirmModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import BannerConfigPanel from './config-panels/BannerConfigPanel.vue'
import BackgroundConfigPanel from './config-panels/BackgroundConfigPanel.vue'
import BasicConfigPanel from './config-panels/BasicConfigPanel.vue'
import ButtonLinksConfigPanel from './config-panels/ButtonLinksConfigPanel.vue'
import ToolIconsConfigPanel from './config-panels/ToolIconsConfigPanel.vue'
import RouteLinksConfigPanel from './config-panels/RouteLinksConfigPanel.vue'
import CarouselConfigPanel from './config-panels/CarouselConfigPanel.vue'
import ThumbnailConfigPanel from './config-panels/ThumbnailConfigPanel.vue'
import FloatAdConfigPanel from './config-panels/FloatAdConfigPanel.vue'
import LayoutConfigPanel from './config-panels/LayoutConfigPanel.vue'
import { configService, type ConfigData } from '../services/configService'
import { useToastStore } from '../stores/toastStore'
import { useAuthStore } from '../stores/auth'
import ConfirmModal from './ConfirmModal.vue'
import UsersView from '../views/UsersView.vue'





const toast = useToastStore()
const router = useRouter()
const authStore = useAuthStore()
const confirmModal = ref<InstanceType<typeof ConfirmModal>>()
const loading = ref(false)
const hasChanges = ref(false)
const isSidebarCollapsed = ref(false)
// removed mainActiveTab logic

const activeTab = ref('banner')
const previewFrame = ref<HTMLIFrameElement>()
const previewDevice = ref('pc')
const devices = [
  { id: 'pc', label: '電腦', icon: '💻', width: '100%', height: '100%' },
  { id: 'tablet', label: '平板', icon: '📱', width: '820', height: '1180' },
  { id: 'mobile', label: '手機', icon: '📱', width: '430', height: '932' }
]

const currentDeviceWidth = computed(() => {
  const device = devices.find(d => d.id === previewDevice.value)
  return device?.width === '100%' ? '自動' : device?.width + 'px'
})

const currentDeviceHeight = computed(() => {
  const device = devices.find(d => d.id === previewDevice.value)
  return device?.height === '100%' ? '自動' : device?.height + 'px'
})

const previewFrameStyle = computed(() => {
  const device = devices.find(d => d.id === previewDevice.value)
  if (!device || device.id === 'pc') {
    return {
      width: '117.65%',
      height: '117.65%',
      transform: 'scale(0.85)',
      transformOrigin: 'top left'
    }
  }

  return {
    width: `${device.width}px`,
    height: `${device.height}px`,
    transform: 'none',
    transformOrigin: 'unset'
  }
})

const tabs = [
  { id: 'basic', label: '基本設置', icon: '⚙️' },
  { id: 'banner', label: 'Banner', icon: '🖼️' },
  { id: 'background', label: '背景圖', icon: '🌄' },
  { id: 'buttonlinks', label: '按鈕鏈接', icon: '🔗' },
  { id: 'toolicons', label: '推薦工具', icon: '🧰' },
  { id: 'routelinks', label: '推薦路線', icon: '🛣️' },
  { id: 'carousel', label: '輪播圖', icon: '🎠' },
  { id: 'videos', label: '影片區', icon: '🎞️' },
  { id: 'floatads', label: '浮動廣告', icon: '📢' },
  { id: 'preview', label: '預覽頁面', icon: '👁️' }
]

const handleLogout = async () => {
  if (!confirm('確定要登出系統嗎？')) return
  await authStore.logout()
  router.push('/login')
}

const currentTabLabel = computed(() => {
  if (activeTab.value === 'users') return '用戶管理'
  const tab = tabs.find(t => t.id === activeTab.value)
  return tab?.label || '配置'
})

const config = reactive<ConfigData>({
  logo: '',
  banner: {
    pc: '',
    tablet: '',
    mobile: ''
  },
  backgroundImage: '',
  backgroundSettings: {
    displayMode: 'repeat',
    topBorderEnabled: true,
    topBorderColor: '#dfb082',
    topBorderWidth: 4
  },
  headerStyles: {
    height: 75,
    backgroundMode: 'gradient',
    solidColor: '#3041b9',
    opacity: 1.0,
    gradient: {
      color1: '#3041b9',
      color2: '#081fb3',
      angle: 0
    },
    boxShadow: {
      enabled: true,
      x: 0,
      y: 0,
      blur: 20,
      spread: 0,
      color: '#000000',
      opacity: 0.3
    }
  },
  recommendStyles: {
    backgroundMode: 'solid',
    solidColor: '#140a68',
    opacity: 1.0,
    gradient: {
      color1: '#140a68',
      color2: '#0a0540',
      angle: 180
    },
    boxShadow: {
      enabled: false,
      x: 0,
      y: 0,
      blur: 10,
      spread: 0,
      color: '#000000',
      opacity: 0.5
    }
  },
  sectionColors: {
    recommendFooterTitleBackground: '#200cc5',
    recommendFooterItemBackground: '#221e1e',
    recommendFooterItemHoverBackground: '#3625c3',
    recommendFooterTopBorderColor: '#dfb082',
    thumbnailTitleBackground: '#3b27de',
    thumbnailBorderColor: '#f8eec9',
    thumbnailTextColor: '#ffffff',
    footerBackground: '#060417'
  },
  headerCss: '',
  recommendContentCss: '',
  buttonLinks: [],
  carouselSlides: [],
  titles: {
    recommendedRoutes: '',
    recommendedBrowsers: '',
    selectedVideos: '',
    hotPrograms: ''
  },
  routeLinks: [],
  toolIcons: [],
  videoThumbnails: [],
  programThumbnails: [],
  floatAdButtons: [],
  pageLayout: ['banner', 'buttonLinks', 'recommend', 'programme', 'floatAd'],
  programmeLayout: ['selectedVideos', 'hotPrograms']
}) // 載入配置

const loadConfig = async () => {
  loading.value = true
  try {
    const data = await configService.getConfig()

    // Normalize banner if it's still a string
    if (typeof data.banner === 'string') {
      data.banner = {
        pc: data.banner,
        tablet: data.banner,
        mobile: data.banner
      }
    }

    Object.assign(config, data)
    config.backgroundSettings = {
      displayMode: 'repeat',
      topBorderEnabled: true,
      topBorderColor: '#dfb082',
      topBorderWidth: 4,
      ...(data.backgroundSettings || {})
    }
    config.sectionColors = {
      recommendFooterTitleBackground: '#200cc5',
      recommendFooterItemBackground: '#221e1e',
      recommendFooterItemHoverBackground: '#3625c3',
      recommendFooterTopBorderColor: '#dfb082',
      thumbnailTitleBackground: '#3b27de',
      thumbnailBorderColor: '#f8eec9',
      thumbnailTextColor: '#ffffff',
      footerBackground: '#060417',
      ...(data.sectionColors || {})
    }

    // 初始化佈局預設值
    if (!config.pageLayout) {
      config.pageLayout = ['banner', 'buttonLinks', 'recommend', 'programme', 'floatAd']
    }
    if (!config.programmeLayout) {
      config.programmeLayout = ['selectedVideos', 'hotPrograms']
    }

    // Migration for RouteLinks (Object -> Array)
    if (config.routeLinks && !Array.isArray(config.routeLinks)) {
      const old = config.routeLinks as any
      config.routeLinks = Array(6).fill(null).map(() => ({
        default: old.default || '',
        hover: old.hover || '',
        href: ''
      })) as any
    }

    // 如果 buttonLinks 為空或不完整，初始化預設值
    if (!config.buttonLinks || config.buttonLinks.length === 0) {
      config.buttonLinks = [
        {
          text: '寰宇瀏覽器',
          href: 'https://www.ub66.com/',
          target: '_blank',
          defaultImage: '/assets/images/2d60d632-004e-4b69-ac84-8fc1817ce52e.png',
          hoverImage: '/assets/images/6ef6554f-4b80-4cd0-9bbf-782dc066c330.png'
        },
        {
          text: 'APP',
          href: 'https://haa68686.com:9900/web/simple.php#/aioDownload',
          target: '_blank',
          defaultImage: '/assets/images/1630a76f-f7e7-4af7-8099-082bc201512c.png',
          hoverImage: '/assets/images/4d106ec5-aa73-4fd5-915e-7e1c6311afa5.png'
        },
        {
          text: 'FUN乐园',
          href: 'https://fun99666.com/',
          target: '_blank',
          defaultImage: '/assets/images/64e1d47d-537d-45d0-bfd4-801e473bb525.png',
          hoverImage: '/assets/images/87fe8990-8297-4e70-9693-e37c665ee087.png'
        },
        {
          text: '合作夥伴',
          href: 'https://haa68686.com:9900/web/#/article/at3',
          target: '_blank',
          defaultImage: '/assets/images/95e17bec-043c-49ea-a438-e8057a39f4ad.png',
          hoverImage: '/assets/images/e9df8ef5-cd97-4c06-b051-a894e67f0935.png'
        }
      ]
    } else {
      // 確保現有的 buttonLinks 有完整的字段
      config.buttonLinks = config.buttonLinks.map((button) => ({
        text: button.text || '',
        href: button.href || '',
        target: button.target || '_blank',
        defaultImage: button.defaultImage || '',
        hoverImage: button.hoverImage || ''
      }))
    }

    // 如果 toolIcons 為空或不完整，初始化預設值
    if (!config.toolIcons || config.toolIcons.length === 0) {
      config.toolIcons = [
        {
          href: "https://www.xiaohongshu.com",
          default: "/assets/images/528b90ea-525d-40e3-ab72-e84c2d5a0c48.png",
          hover: "/assets/images/e3e86498-1b63-4206-8dee-a37119ca35fc.png"
        },
        {
          href: "https://www.douyin.com",
          default: "/assets/images/5e0418de-ace2-4990-9941-e1431d865040.png",
          hover: "/assets/images/480863fc-6a80-4015-9ad1-9fb4e13aeb93.png"
        },
        {
          href: "https://www.baidu.com",
          default: "/assets/images/9ba24a2e-89f3-4555-9bce-406b5241ec19.png",
          hover: "/assets/images/696e04f0-1e4b-46f3-b8d0-1a1f5e435151.png"
        },
        {
          href: "https://www.youku.com",
          default: "/assets/images/7e2227c0-d36b-4e07-aa82-627b814e9019.png",
          hover: "/assets/images/0bade21c-9e90-45bf-96d9-e531a926738a.png"
        },
        {
          href: "https://www.iqiyi.com",
          default: "/assets/images/1037fae9-36e7-4029-8cf0-98c7bd730ec6.png",
          hover: "/assets/images/7323e4c6-e84e-4dc0-b3a7-9da22ad4c52b.png"
        },
        {
          href: "https://x.com",
          default: "/assets/images/a9fbeba0-1070-46bd-98c9-0e96b0ad2778.png",
          hover: "/assets/images/ad9555d9-6d93-4544-a7f0-a75098a5f638.png"
        }
      ]
    } else {
      // 確保現有的 toolIcons 有完整的字段
      config.toolIcons = config.toolIcons.map((tool) => ({
        href: tool.href || '',
        default: tool.default || '',
        hover: tool.hover || ''
      }))
    }

    // 如果 floatAdButtons 為空或不完整，初始化預設值
    if (!config.floatAdButtons || config.floatAdButtons.length === 0) {
      config.floatAdButtons = [
        {
          href: "https://example.com/customer-service",
          default: "/assets/images/df3c0216-67b1-4944-addf-fa61dde067d8.png",
          hover: "/assets/images/3020cc60-d081-41d9-819e-d9dadafcb3a3.png",
          tablet: "",
          mobile: ""
        },
        {
          href: "https://example.com/girl-douyin",
          default: "/assets/images/f9840969-4947-4f70-85f0-6959ecf0219f.png",
          hover: "/assets/images/583ef505-1e0f-4708-9187-8ebe4500802b.png",
          tablet: "",
          mobile: ""
        },
        {
          href: "https://example.com/sports-douyin",
          default: "/assets/images/6d7bbe82-c8bf-4d9b-bc50-629fc982748b.png",
          hover: "/assets/images/38da2308-5535-4ca8-9689-fa9b15bceaf0.png",
          tablet: "",
          mobile: ""
        }
      ]
    } else {
      // 確保現有的 floatAdButtons 有完整的字段
      config.floatAdButtons = config.floatAdButtons.map((button: any) => ({
        href: button.href || '',
        default: button.default || '',
        hover: button.hover || '',
        tablet: button.tablet || '',
        mobile: button.mobile || ''
      }))
    }

    hasChanges.value = false
  } catch (error) {
    console.error('載入配置失敗:', error)
    toast.error('載入配置失敗')
  } finally {
    loading.value = false
  }
}

// 保存配置
const saveConfig = async () => {
  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    toast.success('配置保存成功')
    // 重新載入預覽
    reloadPreview()
  } catch (error) {
    console.error('保存配置失敗:', error)
    toast.error('保存配置失敗')
  } finally {
    loading.value = false
  }
}

const publishConfig = async () => {
  const confirmed = await confirmModal.value?.open(
    '確定要公開更新嗎？',
    '按下「確定」後，客人看到的網站就會變成現在這個樣子。',
    '這樣就算系統重開機，設定也不會跑掉。確定沒問題再按喔！'
  )
  if (!confirmed) return

  loading.value = true
  try {
    await configService.publishConfig()
    toast.success('發布成功！\n現在您可以關閉 API 依賴，Demo 網站將使用這些靜態設定。')
  } catch (error) {
    console.error('Failed to publish config:', error)
    toast.error('發布失敗: ' + (error instanceof Error ? error.message : '未知錯誤'))
  } finally {
    loading.value = false
  }
}



const handleBannerUpload = async (event: Event, device: 'pc' | 'tablet' | 'mobile') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  loading.value = true
  try {
    const response = await configService.uploadImage(file, `banner.${device}`, 'single')
    if (response.success && response.data) {
      if (typeof config.banner === 'string') {
        config.banner = {
          pc: config.banner,
          tablet: config.banner,
          mobile: config.banner
        }
      }
      (config.banner as any)[device] = response.data.path
      hasChanges.value = true
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    }
  } catch (error) {
    console.error('Failed to upload banner:', error)
    toast.error('圖片上傳失敗')
  } finally {
    loading.value = false
      ; (event.target as HTMLInputElement).value = ''
  }
}

const clearBanner = async (device: 'pc' | 'tablet' | 'mobile') => {
  // 如果是字串，先轉換為物件
  if (typeof config.banner === 'string') {
    config.banner = {
      pc: config.banner,
      tablet: config.banner,
      mobile: config.banner
    }
  }

  if (config.banner && typeof config.banner === 'object') {
    (config.banner as any)[device] = ''
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('移除 Banner 失敗:', error)
      toast.error('移除失敗')
    } finally {
      loading.value = false
    }
  }
}


const handleImageUpload = async (event: Event, field: keyof ConfigData) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  loading.value = true
  try {
    const response = await configService.uploadImage(file, field as string)
    if (response.success && response.data) {
      (config as any)[field] = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } else {
      toast.error(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    toast.error('上傳失敗')
  } finally {
    loading.value = false
  }
}

// 處理輪播圖上傳
const handleCarouselImageUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  loading.value = true
  try {
    const response = await configService.uploadImage(file, `carouselSlides.${index}.image`)
    if (response.success && response.data) {
      config.carouselSlides[index].image = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } else {
      toast.error(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    toast.error('上傳失敗')
  } finally {
    loading.value = false
  }
}

// 處理視頻縮圖上傳
const handleVideoUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  loading.value = true
  try {
    const response = await configService.uploadImage(file, `videoThumbnails.${index}.image`)
    if (response.success && response.data) {
      config.videoThumbnails[index].image = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } else {
      toast.error(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    toast.error('上傳失敗')
  } finally {
    loading.value = false
  }
}

// 處理節目縮圖上傳
const handleProgramUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  loading.value = true
  try {
    const response = await configService.uploadImage(file, `programThumbnails.${index}.image`)
    if (response.success && response.data) {
      config.programThumbnails[index].image = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } else {
      toast.error(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    toast.error('上傳失敗')
  } finally {
    loading.value = false
  }
}

// 移除
const clearImage = async (field: keyof ConfigData) => {
  (config as any)[field] = ''
  hasChanges.value = true
  // 立即保存並重新載入預覽
  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    reloadPreview()
  } catch (error) {
    console.error('移除失敗:', error)
    toast.error('移除失敗')
  } finally {
    loading.value = false
  }
}

// 一般設定（包含色彩）先標記為未保存，由使用者按「保存配置」統一寫入。
const updateConfigValue = (field: keyof ConfigData, value: any) => {
  if (JSON.stringify((config as any)[field]) === JSON.stringify(value)) return
  (config as any)[field] = value
  hasChanges.value = true
}

// 上傳標題圖片
const uploadTitleImage = async (e: Event, field: 'recommendedRoutes' | 'recommendedBrowsers' | 'selectedVideos' | 'hotPrograms') => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  loading.value = true
  try {
    const response = await configService.uploadImage(file, field, 'title')
    if (response.success && response.data) {
      ;(config.titles as any)[field] = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
      toast.success('標題圖片上傳成功')
    }
  } catch (error) {
    console.error('上傳標題圖片失敗:', error)
    toast.error('上傳標題圖片失敗')
  } finally {
    loading.value = false
  }
}

// 移除標題圖片
const clearTitleImage = async (field: 'recommendedRoutes' | 'recommendedBrowsers' | 'selectedVideos' | 'hotPrograms') => {
  ;(config.titles as any)[field] = ''
  hasChanges.value = true

  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    reloadPreview()
    toast.success('標題圖片已移除')
  } catch (error) {
    console.error('移除標題圖片失敗:', error)
    toast.error('移除標題圖片失敗')
  } finally {
    loading.value = false
  }
}

// 移除輪播圖片
const clearCarouselImage = async (index: number) => {
  config.carouselSlides[index].image = ''
  hasChanges.value = true
  // 立即保存並重新載入預覽
  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    reloadPreview()
  } catch (error) {
    console.error('移除輪播圖片失敗:', error)
    alert('移除輪播圖片失敗')
  } finally {
    loading.value = false
  }
}

// 新增輪播圖
const addCarouselSlide = () => {
  config.carouselSlides.push({
    image: '',
    title: '',
    href: '',
    description: ''
  })
  hasChanges.value = true
}

// 刪除輪播圖
const removeCarouselSlide = async (index: number) => {
  if (await confirmModal.value?.open('真的要刪除嗎？', '這張輪播圖刪掉就不見囉，確定不要了嗎？')) {
    config.carouselSlides.splice(index, 1)
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('刪除輪播圖失敗:', error)
      alert('刪除輪播圖失敗')
    } finally {
      loading.value = false
    }
  }
}

// 移除視頻縮圖
const removeVideoImage = async (index: number) => {
  config.videoThumbnails[index].image = ''
  hasChanges.value = true
  // 立即保存並重新載入預覽
  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    reloadPreview()
  } catch (error) {
    console.error('移除視頻縮圖失敗:', error)
    alert('移除視頻縮圖失敗')
  } finally {
    loading.value = false
  }
}

// 移除節目縮圖
const removeProgramImage = async (index: number) => {
  config.programThumbnails[index].image = ''
  hasChanges.value = true
  // 立即保存並重新載入預覽
  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    reloadPreview()
  } catch (error) {
    console.error('移除節目縮圖失敗:', error)
    alert('移除節目縮圖失敗')
  } finally {
    loading.value = false
  }
}

// 新增視頻
const addVideoThumbnail = () => {
  config.videoThumbnails.push({
    image: '',
    href: '',
    title: '',
    alt: ''
  })
  hasChanges.value = true
}

// 刪除視頻
const removeVideoThumbnail = async (index: number) => {
  if (await confirmModal.value?.open('真的要刪除嗎？', '這個影片刪掉就不見囉，確定不要了嗎？')) {
    config.videoThumbnails.splice(index, 1)
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('刪除視頻失敗:', error)
      alert('刪除視頻失敗')
    } finally {
      loading.value = false
    }
  }
}


// 新增節目
const addProgramThumbnail = () => {
  config.programThumbnails.push({
    image: '',
    href: '',
    title: '',
    alt: ''
  })
  hasChanges.value = true
}

// 刪除節目
const removeProgramThumbnail = async (index: number) => {
  if (await confirmModal.value?.open('真的要刪除嗎？', '這個節目刪掉就不見囉，確定不要了嗎？')) {
    config.programThumbnails.splice(index, 1)
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('刪除節目失敗:', error)
      alert('刪除節目失敗')
    } finally {
      loading.value = false
    }
  }
}

// ButtonLinks 管理方法
// 新增按鈕鏈接
const addButtonLink = () => {
  config.buttonLinks.push({
    text: '',
    href: '',
    target: '_blank',
    defaultImage: '',
    hoverImage: ''
  })
  hasChanges.value = true
}

// 處理按鈕圖片上傳
const handleButtonImageUpload = async (event: Event, index: number, imageType: 'defaultImage' | 'hoverImage') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  loading.value = true
  try {
    const response = await configService.uploadImage(file, `buttonLinks.${index}.${imageType}`)
    if (response.success && response.data) {
      config.buttonLinks[index][imageType] = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } else {
      toast.error(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    toast.error('上傳失敗')
  } finally {
    loading.value = false
  }
}

// 刪除按鈕圖片
const removeButtonImage = async (index: number, imageType: 'defaultImage' | 'hoverImage') => {
  config.buttonLinks[index][imageType] = ''
  hasChanges.value = true
  // 立即保存並重新載入預覽
  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    reloadPreview()
  } catch (error) {
    console.error('刪除按鈕圖片失敗:', error)
    alert('刪除按鈕圖片失敗')
  } finally {
    loading.value = false
  }
}

// 刪除按鈕鏈接
const removeButtonLink = async (index: number) => {
  if (confirm('確定要刪除這個按鈕鏈接嗎？')) {
    config.buttonLinks.splice(index, 1)
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('刪除按鈕鏈接失敗:', error)
      alert('刪除按鈕鏈接失敗')
    } finally {
      loading.value = false
    }
  }
}

// 重置按鈕鏈接為預設值
const resetButtonLinks = async () => {
  if (confirm('確定要重置按鈕鏈接為預設配置嗎？這將移除所有自定義設置。')) {
    // 設置為預設的按鈕鏈接配置
    config.buttonLinks = [
      {
        text: '寰宇瀏覽器',
        href: 'https://www.ub66.com/',
        target: '_blank',
        defaultImage: '/assets/images/2d60d632-004e-4b69-ac84-8fc1817ce52e.png',
        hoverImage: '/assets/images/6ef6554f-4b80-4cd0-9bbf-782dc066c330.png'
      },
      {
        text: 'APP',
        href: 'https://haa68686.com:9900/web/simple.php#/aioDownload',
        target: '_blank',
        defaultImage: '/assets/images/1630a76f-f7e7-4af7-8099-082bc201512c.png',
        hoverImage: '/assets/images/4d106ec5-aa73-4fd5-915e-7e1c6311afa5.png'
      },
      {
        text: 'FUN乐园',
        href: 'https://fun99666.com/',
        target: '_blank',
        defaultImage: '/assets/images/64e1d47d-537d-45d0-bfd4-801e473bb525.png',
        hoverImage: '/assets/images/87fe8990-8297-4e70-9693-e37c665ee087.png'
      },
      {
        text: '合作夥伴',
        href: 'https://haa68686.com:9900/web/#/article/at3',
        target: '_blank',
        defaultImage: '/assets/images/95e17bec-043c-49ea-a438-e8057a39f4ad.png',
        hoverImage: '/assets/images/e9df8ef5-cd97-4c06-b051-a894e67f0935.png'
      }
    ]
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('重置按鈕鏈接失敗:', error)
      alert('重置按鈕鏈接失敗')
    } finally {
      loading.value = false
    }
  }
}

// ToolIcons 管理方法
// 新增工具圖標
const addToolIcon = () => {
  config.toolIcons.push({
    href: '',
    default: '',
    hover: ''
  })
  hasChanges.value = true
}

// 處理工具圖標圖片上傳
const handleToolIconImageUpload = async (event: Event, index: number, imageType: 'default' | 'hover') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  loading.value = true
  try {
    const response = await configService.uploadImage(file, `toolIcons.${index}.${imageType}`)
    if (response.success && response.data) {
      config.toolIcons[index][imageType] = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } else {
      toast.error(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    toast.error('上傳失敗')
  } finally {
    loading.value = false
  }
}

// 刪除工具圖標圖片
const removeToolIconImage = async (index: number, imageType: 'default' | 'hover') => {
  config.toolIcons[index][imageType] = ''
  hasChanges.value = true
  // 立即保存並重新載入預覽
  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    reloadPreview()
  } catch (error) {
    console.error('刪除工具圖標圖片失敗:', error)
    alert('刪除工具圖標圖片失敗')
  } finally {
    loading.value = false
  }
}

// 刪除工具圖標
const removeToolIcon = async (index: number) => {
  if (confirm('確定要刪除這個工具圖標嗎？')) {
    config.toolIcons.splice(index, 1)
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('刪除工具圖標失敗:', error)
      alert('刪除工具圖標失敗')
    } finally {
      loading.value = false
    }
  }
}

// 重置工具圖標為預設值
const resetToolIcons = async () => {
  if (confirm('確定要重置工具圖標為預設配置嗎？這將移除所有自定義設置。')) {
    // 設置為預設的工具圖標配置
    config.toolIcons = [
      {
        href: "https://www.xiaohongshu.com",
        default: "/assets/images/528b90ea-525d-40e3-ab72-e84c2d5a0c48.png",
        hover: "/assets/images/e3e86498-1b63-4206-8dee-a37119ca35fc.png"
      },
      {
        href: "https://www.douyin.com",
        default: "/assets/images/5e0418de-ace2-4990-9941-e1431d865040.png",
        hover: "/assets/images/480863fc-6a80-4015-9ad1-9fb4e13aeb93.png"
      },
      {
        href: "https://www.baidu.com",
        default: "/assets/images/9ba24a2e-89f3-4555-9bce-406b5241ec19.png",
        hover: "/assets/images/696e04f0-1e4b-46f3-b8d0-1a1f5e435151.png"
      },
      {
        href: "https://www.youku.com",
        default: "/assets/images/7e2227c0-d36b-4e07-aa82-627b814e9019.png",
        hover: "/assets/images/0bade21c-9e90-45bf-96d9-e531a926738a.png"
      },
      {
        href: "https://www.iqiyi.com",
        default: "/assets/images/1037fae9-36e7-4029-8cf0-98c7bd730ec6.png",
        hover: "/assets/images/7323e4c6-e84e-4dc0-b3a7-9da22ad4c52b.png"
      },
      {
        href: "https://x.com",
        default: "/assets/images/a9fbeba0-1070-46bd-98c9-0e96b0ad2778.png",
        hover: "/assets/images/ad9555d9-6d93-4544-a7f0-a75098a5f638.png"
      }
    ]
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('重置工具圖標失敗:', error)
      alert('重置工具圖標失敗')
    } finally {
      loading.value = false
    }
  }
}

// FloatAdButtons 管理方法
// 新增浮動廣告按鈕
const addFloatAdButton = () => {
  config.floatAdButtons.push({
    href: '',
    default: '',
    hover: '',
    tablet: '',
    mobile: ''
  })
  hasChanges.value = true
}

// 處理浮動廣告按鈕圖片上傳
const handleFloatAdImageUpload = async (event: Event, index: number, imageType: 'default' | 'hover' | 'tablet' | 'mobile') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  loading.value = true
  try {
    const response = await configService.uploadImage(file, `floatAdButtons.${index}.${imageType}`)
    if (response.success && response.data) {
      config.floatAdButtons[index][imageType] = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } else {
      toast.error(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳浮動廣告圖片失敗:', error)
    alert('上傳浮動廣告圖片失敗')
  } finally {
    loading.value = false
  }
}

// 刪除浮動廣告按鈕圖片
const removeFloatAdImage = async (index: number, imageType: 'default' | 'hover' | 'tablet' | 'mobile') => {
  config.floatAdButtons[index][imageType] = ''
  hasChanges.value = true
  // 立即保存並重新載入預覽
  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    reloadPreview()
  } catch (error) {
    console.error('刪除浮動廣告圖片失敗:', error)
    alert('刪除浮動廣告圖片失敗')
  } finally {
    loading.value = false
  }
}

// 刪除浮動廣告按鈕
const removeFloatAdButton = async (index: number) => {
  if (confirm('確定要刪除這個浮動廣告按鈕嗎？')) {
    config.floatAdButtons.splice(index, 1)
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('刪除浮動廣告按鈕失敗:', error)
      alert('刪除浮動廣告按鈕失敗')
    } finally {
      loading.value = false
    }
  }
}

// 重置浮動廣告按鈕為預設值
const resetFloatAdButtons = async () => {
  if (confirm('確定要重置浮動廣告按鈕為預設配置嗎？這將移除所有自定義設置。')) {
    // 設置為預設的浮動廣告按鈕配置
    config.floatAdButtons = [
      {
        href: "https://example.com/customer-service",
        default: "/assets/images/df3c0216-67b1-4944-addf-fa61dde067d8.png",
        hover: "/assets/images/3020cc60-d081-41d9-819e-d9dadafcb3a3.png",
        tablet: "",
        mobile: "/assets/images/13013a52-9b2f-4b08-9dfc-279288134763.png"
      },
      {
        href: "https://example.com/girl-douyin",
        default: "/assets/images/f9840969-4947-4f70-85f0-6959ecf0219f.png",
        hover: "/assets/images/583ef505-1e0f-4708-9187-8ebe4500802b.png",
        tablet: "",
        mobile: ""
      },
      {
        href: "https://example.com/sports-douyin",
        default: "/assets/images/6d7bbe82-c8bf-4d9b-bc50-629fc982748b.png",
        hover: "/assets/images/38da2308-5535-4ca8-9689-fa9b15bceaf0.png",
        tablet: "",
        mobile: ""
      }
    ]
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('重置浮動廣告按鈕失敗:', error)
      alert('重置浮動廣告按鈕失敗')
    } finally {
      loading.value = false
    }
  }
}

// RouteLi// RouteLinks 管理方法
// 處理推薦路線圖片上傳
const handleRouteLinksImageUpload = async (event: Event, index: number, imageType: 'default' | 'hover') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  loading.value = true
  try {
    const response = await configService.uploadImage(file, `routeLinks.${index}.${imageType}`)
    if (response.success && response.data) {
      if (!config.routeLinks[index]) {
        // Ensure object exists
        (config.routeLinks as any)[index] = { default: '', hover: '' }
      }
      (config.routeLinks as any)[index][imageType] = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } else {
      toast.error(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳推薦路線圖片失敗:', error)
    alert('上傳推薦路線圖片失敗')
  } finally {
    loading.value = false
  }
}

// 刪除推薦路線圖片
const removeRouteLinksImage = async (index: number, imageType: 'default' | 'hover') => {
  if ((config.routeLinks as any)[index]) {
    (config.routeLinks as any)[index][imageType] = ''
  }
  hasChanges.value = true
  // 立即保存並重新載入預覽
  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    reloadPreview()
  } catch (error) {
    console.error('刪除推薦路線圖片失敗:', error)
    alert('刪除推薦路線圖片失敗')
  } finally {
    loading.value = false
  }
}

// 重置推薦路線為預設值
const resetRouteLinks = async () => {
  if (confirm('確定要重置推薦路線為預設配置嗎？這將移除所有自定義設置。')) {
    // 設置為預設的推薦路線配置 (6組)
    config.routeLinks = Array(6).fill(null).map(() => ({
      default: "/assets/images/d83f37fd-f535-4c9a-bed2-ac5adc7e5e81.png",
      hover: "/assets/images/43d1eb1c-91ed-4e12-903e-197a2042d7cf.png",
      href: ''
    })) as any

    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('重置推薦路線失敗:', error)
      alert('重置推薦路線失敗')
    } finally {
      loading.value = false
    }
  }
}

// 更新推薦路線文字欄位 (如 href)
const updateRouteLink = async (index: number, key: string, value: string) => {
  if (!config.routeLinks[index]) {
    (config.routeLinks as any)[index] = { default: '', hover: '', href: '' }
  }
  (config.routeLinks as any)[index][key] = value
  hasChanges.value = true

  // 這裡不自動儲存，僅標記變更，因為使用者可能還在打字
  // 但如果需要即時生效到預覽(如果有渲染連結的話)，可以考慮 debounce save
  // 這裡簡單起見，我們手動保存或等使用者切換，但考慮到 Panel 行為...
  // 使用者通常打完字希望生效，我們可以可以直接儲存

  loading.value = true
  try {
    await configService.updateConfig(config)
    hasChanges.value = false
    // reloadPreview() // 預覽如果有點擊功能可 reload，目前主要是視覺
  } catch (error) {
    console.error('更新推薦路線連結失敗:', error)
  } finally {
    loading.value = false
  }
}

// 重新載入預覽
const reloadPreview = () => {
  if (previewFrame.value) {
    // 添加時間戳避免緩存
    const timestamp = Date.now()
    const currentSrc = previewFrame.value.src.split('?')[0]
    previewFrame.value.src = `${currentSrc}?t=${timestamp}`
  }
}

// 獲取預覽 URL
const getPreviewUrl = () => {
  // In container deployment, demo is served at root path
  if (import.meta.env.PROD) {
    return '/'
  }
  // In development, use localhost:3000 (demo frontend)
  return 'http://localhost:3000'
}

// 預覽載入完成
const onPreviewLoad = () => {
  console.log('預覽載入完成')
}

// 處理圖片 URL，確保能正確顯示
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return ''
  // 如果是 /uploads/ 路徑，直接使用
  if (imagePath.startsWith('/uploads/')) {
    return imagePath
  }
  // 如果是 /assets/ 路徑，需要轉換為 demo 前端的路徑
  if (imagePath.startsWith('/assets/')) {
    // 在開發環境中，demo 運行在 localhost:3000
    if (import.meta.env.DEV) {
      return `http://localhost:3000${imagePath}`
    }
    // 在生產環境中，假設 demo 在根路徑
    return imagePath
  }
  // 其他情況直接返回
  return imagePath
}

onMounted(() => {
  loadConfig()

}) </script>

<style scoped>
/* Layout Container */
.config-manager-layout {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #edf2f7;
  flex-direction: row;
  /* Default to Row (Sidebar Left) for Desktop */
}

/* Sidebar (Desktop) */
.sidebar {
  width: 232px;
  height: 100%;
  background: linear-gradient(180deg, #182b40 0%, #112235 100%);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 10;
  color: white;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  color: white;
  margin: 0;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.75rem;
  gap: 0.2rem;
}

.nav-item {
  width: 100%;
  text-align: left;
  padding: 0.72rem 0.85rem;
  background: none;
  border: none;
  border-left: 3px solid transparent;
  border-radius: 8px;
  color: #aebdcd;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}

.sidebar.collapsed .nav-item {
  padding: 0.8rem 0;
  justify-content: center;
}

.nav-icon {
  margin-right: 10px;
}

.sidebar.collapsed .nav-icon {
  margin-right: 0;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
}

.nav-item.active {
  background: rgba(94, 135, 173, 0.32);
  color: white;
  border-left-color: #f0b765;
}

.sidebar-footer {
  padding: 0.85rem;
  background-color: rgba(0, 0, 0, 0.16);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.publish-section {
  grid-column: 1 / -1;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 10px;
  margin-top: 5px;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  min-width: 0;
  /* Prevent flex overflow */
}

/* Responsive: Mobile/Tablet (< 1024px) */
@media (max-width: 1024px) {
  .config-manager-layout {
    flex-direction: column;
    /* Stack vertically */
  }

  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    align-items: center;
    padding:
      0.5rem;
    background: #2c3e50;
    overflow-x: auto;
    /* Allow horizontal scroll for nav */
  }

  .sidebar-header {
    padding:
      0.5rem 1rem;
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    margin-right: 0.5rem;
  }

  .sidebar-header h1 {
    font-size: 1rem;
  }

  .nav-menu {
    flex-direction: row;
    padding: 0;
    overflow-x: auto;
    align-items:
      center;
    height: 100%;
  }

  .nav-item {
    width: auto;
    padding: 0.5rem 1rem;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .nav-item.active {
    border-left-color: transparent;
    border-bottom-color: #007bff;
  }

  .sidebar-footer {
    display: none;
    /* Hide footer buttons in top bar to save space, maybe move to a modal or bottom bar? */
    /*
  Alternatively, keep them but compact */
  }

  /* Show a mobile specific action bar or keep them if space allows */
}

/*
  Specific fix: If sidebar-footer is hidden on mobile, we need a way to access actions. Let's keep them but make them
  compact or put them in a separate bar. For now, let's allow them to wrap or stay on the right. */
@media (max-width: 1024px) {
  .sidebar-footer {
    display: flex;
    flex-direction: row;
    padding: 0.25rem;
    background: none;
    border-top: none;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    margin-left: auto;
    /* Push to right */
    gap: 5px;
  }

  .publish-section {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    padding-left: 10px;
    margin-left: 5px;
  }

  .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}

.panels-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  background:
    #fff;
  border-right: 1px solid #e1e4e8;
  min-width: 0;
}

.editor-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid #e1e4e8;
  background: #fff;
}

.editor-header h2 {
  font-size: 1.1rem;
  margin: 0;
  color: #1a1f36;
}

.editor-body {
  flex:
    1;
  overflow-y: auto;
  padding: clamp(1.25rem, 2.5vw, 2.5rem);
  background: #f7f9fc;
}

.video-sections-panel {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Preview Pane */
.preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  min-width: 0;
  /* Prevent flex overflow */
}

.preview-header {
  display:
    flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #fff;
  border-bottom: 1px solid #e1e4e8;
}

.device-switcher {
  display: flex;
  gap: 0.5rem;
  background: #f1f3f5;
  padding: 0.25rem;
  border-radius:
    8px;
}

.device-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  color:
    #6c757d;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-btn:hover {
  background-color: #e9ecef;
  color: #495057;
}

.device-btn.active {
  background-color: #fff;
  color: #007bff;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05);
}

.preview-dims {
  font-family: monospace;
  color: #6c757d;
  font-size: 0.9rem;
}

.preview-viewport-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
  padding: 2rem;
  background-image: linear-gradient(45deg, #e4e6eb 25%, transparent 25%), linear-gradient(-45deg, #e4e6eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e6eb 75%), linear-gradient(-45deg, transparent 75%,
      #e4e6eb 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.preview-viewport {
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 25px 50px -12px rgba(0, 0,
      0, 0.25);
  background: white;
}

.preview-frame {
  display: block;
  border: none;
  background: white;
}

/* Device Specific
  Styles for Preview Wrapper */
.preview-viewport.mobile {
  border-radius: 40px;
  padding: 10px;
  background: #1a1f36;
}

.preview-viewport.mobile .preview-frame {
  border-radius: 30px;
  width: 430px;
  height: 932px;
}

.preview-viewport.tablet {
  border-radius: 20px;
  padding: 10px;
  background: #1a1f36;
}

.preview-viewport.tablet .preview-frame {
  border-radius:
    12px;
  width: 820px;
  height: 1180px;
}

.preview-viewport.pc {
  width: 100%;
  height: 100%;
  box-shadow: none;
  background:
    transparent;
}

/* Utility buttons */
.btn {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight:
    500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  box-shadow: none;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #2563a4;
  color: white;
  border-color: #2563a4;
}

.btn-primary:hover {
  background-color: #1d4f84;
  border-color: #1d4f84;
}

.btn-primary:disabled {
  background-color: #a0a0a0;
  border-color: #a0a0a0;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e9ecef;
  color: #495057;
  border-color: #dde0e3;
}

.btn-secondary:hover {
  background-color: #dde0e3;
  color: #212529;
}

.btn-block {
  width: 100%;
  display: block;
}

.btn-danger {
  background-color: #b7414b;
  color: white;
}

.btn-danger:hover {
  background-color: #92353e;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content:
    center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  padding: 1rem 2rem;
  background: #333;
  color: white;
  border-radius: 4px;
}

/* Config Section */
.config-section {
  background: white;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
}

.config-section.full-width {
  width: 100%;
}

.config-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.tab-btn {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  color: #6c757d;
}

.tab-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.tab-btn.active {
  border-bottom-color: #007bff;
  color: #007bff;
  font-weight: 500;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.config-panel {
  padding: 2rem;
}

.config-panel h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-header h3 {
  margin: 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.item-header h4 {
  margin: 0;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius:
    4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123,
      255, 0.25);
}

.image-upload {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px dashed #ddd;
  border-radius: 4px;
  background: #fafafa;
}

.preview-img {
  max-width: 200px;
  max-height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.preview-img.small {
  max-width: 120px;
  max-height: 80px;
}

.placeholder {
  width: 200px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  color:
    #999;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.placeholder.small {
  width: 120px;
  height: 80px;
}

.file-input {
  flex: 1;
}

@media (max-width: 768px) {
  .button-actions {
    flex-direction: column;
  }
}

/* Casino control-room finish */
.config-manager-layout { background: #090d13; }
.sidebar {
  width: 248px;
  background:
    radial-gradient(circle at 15% 0%, rgba(166, 28, 47, 0.3), transparent 16rem),
    linear-gradient(180deg, #161a22 0%, #0d1118 100%);
  border-right-color: rgba(229, 183, 99, 0.22);
}
.sidebar-header { padding: 1.4rem 1rem 1.15rem; border-bottom-color: rgba(229, 183, 99, 0.16); }
.sidebar-header h1 { color: #f3c06e; font-size: 1.1rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.toggle-btn { color: #d6a656; border: 1px solid rgba(229, 183, 99, 0.28); border-radius: 6px; padding: 0.25rem 0.45rem; }
.nav-menu { padding: 0.8rem; gap: 0.3rem; }
.nav-item { color: #aeb6c2; border-left-width: 3px; border-radius: 5px; }
.nav-item:hover { background: rgba(229, 183, 99, 0.09); color: #f8ddae; }
.nav-item.active { background: linear-gradient(90deg, rgba(165, 21, 43, 0.9), rgba(116, 18, 36, 0.58)); border-left-color: #f2bf68; box-shadow: inset 0 1px 0 rgba(255,255,255,0.1); }
.nav-item--system { margin-top: 0.75rem; border-top: 1px solid rgba(229, 183, 99, 0.16); border-radius: 0; padding-top: 1rem; }
.sidebar-footer { background: rgba(0, 0, 0, 0.3); border-top-color: rgba(229, 183, 99, 0.14); }
.btn-primary { background: linear-gradient(135deg, #b84b32, #8c2028); border-color: #c96545; }
.btn-primary:hover { background: linear-gradient(135deg, #cf6042, #9e2732); border-color: #e1805d; }
.btn-secondary { background: #202a36; color: #d8dee7; border-color: #3a4654; }
.btn-danger { background: linear-gradient(135deg, #d14936, #a71d2b); border-color: #e76b53; }
.btn-logout { grid-column: 1 / -1; background: transparent; color: #e5b86e; border-color: rgba(229, 184, 110, 0.35); }
.btn-logout:hover { background: rgba(229, 184, 110, 0.1); border-color: rgba(229, 184, 110, 0.7); }
.editor-pane { background: #111720; border-right-color: rgba(229, 183, 99, 0.16); }
.editor-header { padding: 1.15rem 2rem; background: linear-gradient(90deg, #151d28, #10151d); border-bottom-color: rgba(229, 183, 99, 0.16); }
.editor-header h2 { color: #f4c778; font-size: 1.15rem; letter-spacing: 0.05em; }
.editor-body { background: radial-gradient(circle at 80% 0%, rgba(157, 30, 44, 0.12), transparent 24rem), #0d1219; }
</style>
