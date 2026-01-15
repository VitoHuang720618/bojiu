<template>
  <div class="config-manager">
    <div class="config-header">
      <h1>配置管理</h1>
      <div class="actions">
        <button @click="loadConfig" class="btn btn-secondary">重新載入</button>
        <button @click="saveConfig" class="btn btn-primary" :disabled="!hasChanges">保存配置</button>
      </div>
    </div>

    <!-- 主要 Tabs -->
    <div class="main-tabs">
      <button :class="['main-tab-btn', { active: mainActiveTab === 'preview' }]" @click="mainActiveTab = 'preview'">
        預覽
      </button>
      <button :class="['main-tab-btn', { active: mainActiveTab === 'config' }]" @click="mainActiveTab = 'config'">
        配置管理
      </button>
    </div>

    <div class="config-content">
      <!-- 預覽區域 -->
      <div v-if="mainActiveTab === 'preview'" class="preview-section full-width">
        <div class="preview-controls">
          <div class="device-switcher">
            <button v-for="device in devices" :key="device.id"
              :class="['device-btn', { active: previewDevice === device.id }]" @click="previewDevice = device.id"
              :title="device.label">
              <span class="icon">{{ device.icon }}</span>
              <span class="label">{{ device.label }}</span>
            </button>
          </div>
          <div class="preview-info">
            當前尺寸: {{ currentDeviceWidth }} x {{ currentDeviceHeight }}
          </div>
        </div>
        <div class="preview-container" :class="previewDevice">
          <iframe ref="previewFrame" :src="getPreviewUrl()" class="preview-frame" :style="previewFrameStyle"
            @load="onPreviewLoad"></iframe>
        </div>
      </div>

      <!-- 配置區域 -->
      <div v-if="mainActiveTab === 'config'" class="config-section full-width">
        <div class="config-tabs">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]">
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- Banner 配置 -->
          <BannerConfigPanel v-if="activeTab === 'banner'" :banner="config.banner" :getImageUrl="getImageUrl"
            @upload="handleBannerUpload" @batch-upload="handleBatchBannerUpload" @crop="openCropper"
            @clear="clearBanner" />

          <!-- Background 配置 -->
          <BackgroundConfigPanel v-if="activeTab === 'background'" :backgroundImage="config.backgroundImage"
            @upload="(e) => handleImageUpload(e, 'backgroundImage')" @clear="clearImage('backgroundImage')" />

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
            @removeImage="removeRouteLinksImage" />

          <!-- Carousel 配置 -->
          <CarouselConfigPanel v-if="activeTab === 'carousel'" :carouselSlides="config.carouselSlides"
            @add="addCarouselSlide" @remove="removeCarouselSlide" @upload="handleCarouselImageUpload"
            @clearImage="clearCarouselImage" @change="hasChanges = true" />

          <!-- Video Thumbnails 配置 -->
          <ThumbnailConfigPanel v-if="activeTab === 'videos'" title="精選短視頻設置" itemLabel="視頻"
            :items="config.videoThumbnails" @add="addVideo" @remove="removeVideo" @upload="handleVideoImageUpload"
            @removeImage="removeVideoImage" @change="hasChanges = true" />

          <!-- Program Thumbnails 配置 -->
          <ThumbnailConfigPanel v-if="activeTab === 'programs'" title="火熱節目設置" itemLabel="節目"
            :items="config.programThumbnails" @add="addProgram" @remove="removeProgram"
            @upload="handleProgramImageUpload" @removeImage="removeProgramImage" @change="hasChanges = true" />

          <!-- Float Ad Buttons 配置 -->
          <FloatAdConfigPanel v-if="activeTab === 'floatads'" :floatAdButtons="config.floatAdButtons"
            :getImageUrl="getImageUrl" @reset="resetFloatAdButtons" @add="addFloatAdButton"
            @remove="removeFloatAdButton" @upload="handleFloatAdImageUpload" @removeImage="removeFloatAdImage"
            @change="hasChanges = true" />
        </div>
      </div>
    </div>
    <!-- Loading 狀態 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">載入中...</div>
    </div>
    <!-- Image Cropper Modal -->
    <ImageCropper :show="cropperState.show" :imageUrl="cropperState.imageUrl" :device="cropperState.device"
      @close="cropperState.show = false" @confirm="handleCropConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import ImageCropper from './ImageCropper.vue'
import BannerConfigPanel from './config-panels/BannerConfigPanel.vue'
import BackgroundConfigPanel from './config-panels/BackgroundConfigPanel.vue'
import ButtonLinksConfigPanel from './config-panels/ButtonLinksConfigPanel.vue'
import ToolIconsConfigPanel from './config-panels/ToolIconsConfigPanel.vue'
import RouteLinksConfigPanel from './config-panels/RouteLinksConfigPanel.vue'
import CarouselConfigPanel from './config-panels/CarouselConfigPanel.vue'
import ThumbnailConfigPanel from './config-panels/ThumbnailConfigPanel.vue'
import FloatAdConfigPanel from './config-panels/FloatAdConfigPanel.vue'
import { configService, type ConfigData } from '../services/configService'

// Cropper State
const cropperState = reactive({
  show: false,
  imageUrl: '',
  device: 'pc' as 'pc' | 'tablet' | 'mobile'
})

const loading = ref(false)
const hasChanges = ref(false)
const mainActiveTab = ref('preview') // 主要 tab，預設顯示預覽

const activeTab = ref('banner')
const previewFrame = ref<HTMLIFrameElement>()
const previewDevice = ref('pc')
const devices = [
  { id: 'pc', label: '電腦 (PC)', icon: '💻', width: '100%', height: '100%' },
  { id: 'tablet', label: '平板 (Tablet)', icon: '📱', width: '820', height: '1180' },
  { id: 'mobile', label: '手機 (Mobile)', icon: '📱', width: '430', height: '932' }
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
  { id: 'banner', label: 'Banner' },
  { id: 'background', label: '背景圖' },
  { id: 'buttonlinks', label: '按鈕鏈接' },
  { id: 'toolicons', label: '工具圖標' },
  { id: 'routelinks', label: '推薦路線' },
  { id: 'carousel', label: '輪播圖' },
  { id: 'videos', label: '精選視頻' },
  { id: 'programs', label: '火熱節目' },
  { id: 'floatads', label: '浮動廣告' }
]

const config = reactive<ConfigData>({
  logo: '',
  banner: {
    pc: '',
    tablet: '',
    mobile: ''
  }

  ,
  backgroundImage: '',
  buttonLinks: [],
  carouselSlides: [],
  titles: {
    recommendedRoutes: '',
    recommendedBrowsers: '',
    selectedVideos: '',
    hotPrograms: ''
  }

  ,
  routeLinks: {
    default: '',
    hover: ''
  }

  ,
  toolIcons: [],
  videoThumbnails: [],
  programThumbnails: [],
  floatAdButtons: []
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
          hover: "/assets/images/3020cc60-d081-41d9-819e-d9dadafcb3a3.png"
        },
        {
          href: "https://example.com/girl-douyin",
          default: "/assets/images/f9840969-4947-4f70-85f0-6959ecf0219f.png",
          hover: "/assets/images/583ef505-1e0f-4708-9187-8ebe4500802b.png"
        },
        {
          href: "https://example.com/sports-douyin",
          default: "/assets/images/6d7bbe82-c8bf-4d9b-bc50-629fc982748b.png",
          hover: "/assets/images/38da2308-5535-4ca8-9689-fa9b15bceaf0.png"
        }
      ]
    } else {
      // 確保現有的 floatAdButtons 有完整的字段
      config.floatAdButtons = config.floatAdButtons.map((button) => ({
        href: button.href || '',
        default: button.default || '',
        hover: button.hover || ''
      }))
    }

    hasChanges.value = false
  } catch (error) {
    console.error('載入配置失敗:', error)
    alert('載入配置失敗')
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
    alert('配置保存成功')
    // 重新載入預覽
    reloadPreview()
  } catch (error) {
    console.error('保存配置失敗:', error)
    alert('保存配置失敗')
  } finally {
    loading.value = false
  }
}

// Banner 管理方法
const getBannerUrl = (device: 'pc' | 'tablet' | 'mobile') => {
  if (typeof config.banner === 'string') {
    return config.banner
  }
  return (config.banner as any)?.[device] || ''
}

const openCropper = (device: 'pc' | 'tablet' | 'mobile') => {
  const url = getBannerUrl(device)
  if (url) {
    cropperState.imageUrl = getImageUrl(url)
    cropperState.device = device
    cropperState.show = true
  }
}

const handleCropConfirm = async (file: File) => {
  cropperState.show = false
  loading.value = true
  try {
    const response = await configService.uploadImage(file, `banner.${cropperState.device}`, 'single')
    if (response.success && response.data) {
      if (typeof config.banner === 'string') {
        config.banner = {
          pc: config.banner,
          tablet: config.banner,
          mobile: config.banner
        }
      }
      (config.banner as any)[cropperState.device] = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    }
  } catch (error) {
    console.error('Failed to upload cropped image:', error)
    alert('裁切上傳失敗')
  } finally {
    loading.value = false
  }
}

const handleBatchBannerUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  loading.value = true
  try {
    // 讀取圖片並獲取尺寸
    const img = new Image()
    const reader = new FileReader()

    const loadImage = () => new Promise<HTMLImageElement>((resolve, reject) => {
      reader.onload = (e) => {
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const sourceImg = await loadImage()
    const devices = [
      { id: 'pc', width: 1920, height: 500 },
      { id: 'tablet', width: 820, height: 340 },
      { id: 'mobile', width: 430, height: 340 }
    ] as const

    for (const device of devices) {
      // 進行中心裁切
      const canvas = document.createElement('canvas')
      canvas.width = device.width
      canvas.height = device.height
      const ctx = canvas.getContext('2d')

      if (ctx) {
        const targetRatio = device.width / device.height
        const sourceRatio = sourceImg.width / sourceImg.height

        let drawW, drawH, curX, curY

        if (sourceRatio > targetRatio) {
          // 來源比較寬，以高度為準，裁左兩側
          drawH = sourceImg.height
          drawW = sourceImg.height * targetRatio
          curX = (sourceImg.width - drawW) / 2
          curY = 0
        } else {
          // 來源比較窄，以寬度為準，裁上下
          drawW = sourceImg.width
          drawH = sourceImg.width / targetRatio
          curX = 0
          curY = (sourceImg.height - drawH) / 2
        }

        ctx.drawImage(sourceImg, curX, curY, drawW, drawH, 0, 0, device.width, device.height)

        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
        const croppedFile = new File([blob], `banner-${device.id}.png`, { type: 'image/png' })

        const response = await configService.uploadImage(croppedFile, `banner.${device.id}`, 'single')
        if (response.success && response.data) {
          if (typeof config.banner === 'string') {
            config.banner = { pc: '', tablet: '', mobile: '' }
          }
          (config.banner as any)[device.id] = response.data.path
        }
      }
    }

    hasChanges.value = true
    await configService.updateConfig(config)
    hasChanges.value = false
    reloadPreview()
    alert('自動生成成功！已套用至所有裝置。')
  } catch (error) {
    console.error('Batch banner upload failed:', error)
    alert('批量處理失敗，請檢查圖片格式')
  } finally {
    loading.value = false
      ; (event.target as HTMLInputElement).value = ''
  }
}

const handleBannerUpload = async (event: Event, device: 'pc' | 'tablet' | 'mobile') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 讀取本地檔案並開啟裁切器
  const reader = new FileReader()
  reader.onload = (e) => {
    cropperState.imageUrl = e.target?.result as string
    cropperState.device = device
    cropperState.show = true
  }
  reader.readAsDataURL(file)

    // 清除 input 值，以便下次選取相同檔案也能觸發 change
    ; (event.target as HTMLInputElement).value = ''
}

const clearBanner = async (device: 'pc' | 'tablet' | 'mobile') => {
  if (typeof config.banner === 'object') {
    (config.banner as any)[device] = ''
    hasChanges.value = true
    // 立即保存並重新載入預覽
    loading.value = true
    try {
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } catch (error) {
      console.error('清除 Banner 失敗:', error)
      alert('清除失敗')
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
      alert(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    alert('上傳失敗')
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
      alert(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    alert('上傳失敗')
  } finally {
    loading.value = false
  }
}

// 處理視頻縮圖上傳
const handleVideoImageUpload = async (event: Event, index: number) => {
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
      alert(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    alert('上傳失敗')
  } finally {
    loading.value = false
  }
}

// 處理節目縮圖上傳
const handleProgramImageUpload = async (event: Event, index: number) => {
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
      alert(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    alert('上傳失敗')
  } finally {
    loading.value = false
  }
}

// 清除圖片
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
    console.error('清除圖片失敗:', error)
    alert('清除圖片失敗')
  } finally {
    loading.value = false
  }
}

// 清除輪播圖片
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
    console.error('清除輪播圖片失敗:', error)
    alert('清除輪播圖片失敗')
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
  if (confirm('確定要刪除這張輪播圖嗎？')) {
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

// 清除視頻縮圖
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
    console.error('清除視頻縮圖失敗:', error)
    alert('清除視頻縮圖失敗')
  } finally {
    loading.value = false
  }
}

// 清除節目縮圖
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
    console.error('清除節目縮圖失敗:', error)
    alert('清除節目縮圖失敗')
  } finally {
    loading.value = false
  }
}

// 新增視頻
const addVideo = () => {
  config.videoThumbnails.push({
    image: '',
    href: '',
    title: '',
    alt: ''
  })
  hasChanges.value = true
}

// 刪除視頻
const removeVideo = async (index: number) => {
  if (confirm('確定要刪除這個視頻嗎？')) {
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
const addProgram = () => {
  config.programThumbnails.push({
    image: '',
    href: '',
    title: '',
    alt: ''
  })
  hasChanges.value = true
}

// 刪除節目
const removeProgram = async (index: number) => {
  if (confirm('確定要刪除這個節目嗎？')) {
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
      alert(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    alert('上傳失敗')
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
  if (confirm('確定要重置按鈕鏈接為預設配置嗎？這將清除所有自定義設置。')) {
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
      alert(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳失敗:', error)
    alert('上傳失敗')
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
  if (confirm('確定要重置工具圖標為預設配置嗎？這將清除所有自定義設置。')) {
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
    hover: ''
  })
  hasChanges.value = true
}

// 處理浮動廣告按鈕圖片上傳
const handleFloatAdImageUpload = async (event: Event, index: number, imageType: 'default' | 'hover') => {
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
      alert(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳浮動廣告圖片失敗:', error)
    alert('上傳浮動廣告圖片失敗')
  } finally {
    loading.value = false
  }
}

// 刪除浮動廣告按鈕圖片
const removeFloatAdImage = async (index: number, imageType: 'default' | 'hover') => {
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
  if (confirm('確定要重置浮動廣告按鈕為預設配置嗎？這將清除所有自定義設置。')) {
    // 設置為預設的浮動廣告按鈕配置
    config.floatAdButtons = [
      {
        href: "https://example.com/customer-service",
        default: "/assets/images/df3c0216-67b1-4944-addf-fa61dde067d8.png",
        hover: "/assets/images/3020cc60-d081-41d9-819e-d9dadafcb3a3.png"
      },
      {
        href: "https://example.com/girl-douyin",
        default: "/assets/images/f9840969-4947-4f70-85f0-6959ecf0219f.png",
        hover: "/assets/images/583ef505-1e0f-4708-9187-8ebe4500802b.png"
      },
      {
        href: "https://example.com/sports-douyin",
        default: "/assets/images/6d7bbe82-c8bf-4d9b-bc50-629fc982748b.png",
        hover: "/assets/images/38da2308-5535-4ca8-9689-fa9b15bceaf0.png"
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

// RouteLinks 管理方法
// 處理推薦路線圖片上傳
const handleRouteLinksImageUpload = async (event: Event, imageType: 'default' | 'hover') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  loading.value = true
  try {
    const response = await configService.uploadImage(file, `routeLinks.${imageType}`)
    if (response.success && response.data) {
      config.routeLinks[imageType] = response.data.path
      hasChanges.value = true
      // 立即保存並重新載入預覽
      await configService.updateConfig(config)
      hasChanges.value = false
      reloadPreview()
    } else {
      alert(response.error || '上傳失敗')
    }
  } catch (error) {
    console.error('上傳推薦路線圖片失敗:', error)
    alert('上傳推薦路線圖片失敗')
  } finally {
    loading.value = false
  }
}

// 刪除推薦路線圖片
const removeRouteLinksImage = async (imageType: 'default' | 'hover') => {
  config.routeLinks[imageType] = ''
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
  if (confirm('確定要重置推薦路線為預設配置嗎？這將清除所有自定義設置。')) {
    // 設置為預設的推薦路線配置
    config.routeLinks = {
      default: "/assets/images/d83f37fd-f535-4c9a-bed2-ac5adc7e5e81.png",
      hover: "/assets/images/43d1eb1c-91ed-4e12-903e-197a2042d7cf.png"
    }
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
.config-manager {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.config-header h1 {
  margin: 0;
  color: #333;
}

.actions {
  display: flex;
  gap: 1rem;
}

.config-content {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.main-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #ddd;
  padding: 0 2rem;
}

.main-tab-btn {
  padding: 1rem 2rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  font-size: 1rem;
  font-weight: 500;
}

.main-tab-btn:hover {
  background: #f8f9fa;
}

.main-tab-btn.active {
  border-bottom-color: #007bff;
  color: #007bff;
}

.preview-section {
  background: white;
  padding: 1.5rem 2rem;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.preview-section.full-width {
  width: 100%;
}

.preview-section h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.preview-container {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: auto;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
}

.preview-container.mobile,
.preview-container.tablet {
  align-items: flex-start;
  /* Prevent clipping when taller than container */
  padding-top: 40px;
  /* Add some top spacing for better look */
}

.preview-container.pc {
  padding: 0;
  display: block;
  overflow: auto;
  align-items: flex-start;
}

.preview-frame {
  background: white;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border-radius: 0;
}

/* PC 模式特殊處理：直接鋪滿並適度縮放 */
.preview-container.pc .preview-frame {
  width: 117.65%;
  height: 117.65%;
  transform: scale(0.85);
  transform-origin: top left;
  box-shadow: none;
}

/* 設備邊框設計 */
.preview-container.tablet .preview-frame,
.preview-container.mobile .preview-frame {
  border: 12px solid #1a1a1a;
  border-radius: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  position: relative;
}

.preview-container.mobile .preview-frame {
  border-radius: 36px;
  border-width: 14px;
}

/* 手機頂部聽筒效果元件 (示意) */
.preview-container.mobile::after {
  content: "";
  position: absolute;
  top: calc(50% - 333.5px + 10px);
  /* 居中對齊手機高度一半 */
  width: 60px;
  height: 4px;
  background: #333;
  border-radius: 2px;
  z-index: 10;
  display: none;
  /* 暫時隱藏，視情況開啟 */
}

.preview-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background: white;
  padding: 10px 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.device-switcher {
  display: flex;
  background: #f1f3f5;
  padding: 4px;
  border-radius: 10px;
  gap: 2px;
}

.device-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
  font-weight: 500;
  font-size: 0.9rem;
}

.device-btn .icon {
  font-size: 1.1rem;
}

.device-btn:hover {
  background: rgba(0, 0, 0, 0.03);
  color: #212529;
}

.device-btn.active {
  background: white;
  color: #007bff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.preview-info {
  color: #adb5bd;
  font-size: 0.85rem;
  font-family: monospace;
}

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
}

.tab-btn:hover {
  background: #f8f9fa;
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
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
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
  color: #999;
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
</style>