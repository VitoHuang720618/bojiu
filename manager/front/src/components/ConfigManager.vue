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
      <button 
        :class="['main-tab-btn', { active: mainActiveTab === 'preview' }]"
        @click="mainActiveTab = 'preview'"
      >
        預覽
      </button>
      <button 
        :class="['main-tab-btn', { active: mainActiveTab === 'config' }]"
        @click="mainActiveTab = 'config'"
      >
        配置管理
      </button>
    </div>

    <div class="config-content">
      <!-- 預覽區域 -->
      <div v-if="mainActiveTab === 'preview'" class="preview-section full-width">
        <div class="preview-container">
          <iframe 
            ref="previewFrame"
            :src="getPreviewUrl()" 
            class="preview-frame"
            @load="onPreviewLoad"
          ></iframe>
        </div>
      </div>

      <!-- 配置區域 -->
      <div v-if="mainActiveTab === 'config'" class="config-section full-width">
        <div class="config-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <!-- Banner 配置 -->
          <div v-if="activeTab === 'banner'" class="config-panel">
            <h3>Banner 設置</h3>
            <div class="form-group">
              <label>Banner 圖片</label>
              <div class="image-upload">
                <img v-if="config.banner" :src="config.banner" alt="Banner" class="preview-img" />
                <div v-else class="placeholder">無圖片</div>
                <input 
                  type="file" 
                  @change="(e) => handleImageUpload(e, 'banner')"
                  accept="image/*"
                  class="file-input"
                />
                <button @click="clearImage('banner')" class="btn btn-danger btn-sm">清除</button>
              </div>
            </div>
          </div>

          <!-- Background 配置 -->
          <div v-if="activeTab === 'background'" class="config-panel">
            <h3>背景圖設置</h3>
            <div class="form-group">
              <label>背景圖片</label>
              <div class="image-upload">
                <img v-if="config.backgroundImage" :src="config.backgroundImage" alt="Background" class="preview-img" />
                <div v-else class="placeholder">無背景圖（顯示預設圖案）</div>
                <input 
                  type="file" 
                  @change="(e) => handleImageUpload(e, 'backgroundImage')"
                  accept="image/*"
                  class="file-input"
                />
                <button @click="clearImage('backgroundImage')" class="btn btn-danger btn-sm">清除</button>
              </div>
            </div>
          </div>

          <!-- Carousel 配置 -->
          <div v-if="activeTab === 'carousel'" class="config-panel">
            <h3>輪播圖設置</h3>
            <div v-for="(slide, index) in config.carouselSlides" :key="index" class="carousel-item">
              <h4>輪播圖 {{ index + 1 }}</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>圖片</label>
                  <div class="image-upload">
                    <img v-if="slide.image" :src="slide.image" alt="Carousel" class="preview-img small" />
                    <div v-else class="placeholder small">無圖片</div>
                    <input 
                      type="file" 
                      @change="(e) => handleCarouselImageUpload(e, index)"
                      accept="image/*"
                      class="file-input"
                    />
                    <button @click="clearCarouselImage(index)" class="btn btn-danger btn-sm">刪除</button>
                  </div>
                </div>
                <div class="form-group">
                  <label>連結</label>
                  <input 
                    v-model="slide.href" 
                    type="url" 
                    class="form-control"
                    placeholder="https://example.com"
                    @input="hasChanges = true"
                  />
                </div>
                <div class="form-group">
                  <label>描述</label>
                  <input 
                    v-model="slide.alt" 
                    type="text" 
                    class="form-control"
                    placeholder="圖片描述"
                    @input="hasChanges = true"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Video Thumbnails 配置 -->
          <div v-if="activeTab === 'videos'" class="config-panel">
            <div class="section-header">
              <h3>精選短視頻設置</h3>
              <button @click="addVideoItem" class="btn btn-primary">新增視頻</button>
            </div>
            <div v-for="(video, index) in config.videoThumbnails" :key="index" class="thumbnail-item">
              <div class="item-header">
                <h4>視頻 {{ index + 1 }}</h4>
                <button @click="removeVideoItem(index)" class="btn btn-danger btn-sm">刪除項目</button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>縮圖</label>
                  <div class="image-upload">
                    <img v-if="video.image" :src="video.image" alt="Video" class="preview-img small" />
                    <div v-else class="placeholder small">無圖片</div>
                    <input 
                      type="file" 
                      @change="(e) => handleVideoImageUpload(e, index)"
                      accept="image/*"
                      class="file-input"
                    />
                    <button @click="clearVideoImage(index)" class="btn btn-danger btn-sm">刪除圖片</button>
                  </div>
                </div>
                <div class="form-group">
                  <label>連結</label>
                  <input 
                    v-model="video.href" 
                    type="url" 
                    class="form-control"
                    placeholder="https://example.com"
                    @input="hasChanges = true"
                  />
                </div>
                <div class="form-group">
                  <label>標題</label>
                  <input 
                    v-model="video.title" 
                    type="text" 
                    class="form-control"
                    placeholder="視頻標題"
                    @input="hasChanges = true"
                  />
                </div>
                <div class="form-group">
                  <label>描述</label>
                  <input 
                    v-model="video.alt" 
                    type="text" 
                    class="form-control"
                    placeholder="圖片描述"
                    @input="hasChanges = true"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Program Thumbnails 配置 -->
          <div v-if="activeTab === 'programs'" class="config-panel">
            <div class="section-header">
              <h3>火熱節目設置</h3>
              <button @click="addProgramItem" class="btn btn-primary">新增節目</button>
            </div>
            <div v-for="(program, index) in config.programThumbnails" :key="index" class="thumbnail-item">
              <div class="item-header">
                <h4>節目 {{ index + 1 }}</h4>
                <button @click="removeProgramItem(index)" class="btn btn-danger btn-sm">刪除項目</button>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>縮圖</label>
                  <div class="image-upload">
                    <img v-if="program.image" :src="program.image" alt="Program" class="preview-img small" />
                    <div v-else class="placeholder small">無圖片</div>
                    <input 
                      type="file" 
                      @change="(e) => handleProgramImageUpload(e, index)"
                      accept="image/*"
                      class="file-input"
                    />
                    <button @click="clearProgramImage(index)" class="btn btn-danger btn-sm">刪除圖片</button>
                  </div>
                </div>
                <div class="form-group">
                  <label>連結</label>
                  <input 
                    v-model="program.href" 
                    type="url" 
                    class="form-control"
                    placeholder="https://example.com"
                    @input="hasChanges = true"
                  />
                </div>
                <div class="form-group">
                  <label>標題</label>
                  <input 
                    v-model="program.title" 
                    type="text" 
                    class="form-control"
                    placeholder="節目標題"
                    @input="hasChanges = true"
                  />
                </div>
                <div class="form-group">
                  <label>描述</label>
                  <input 
                    v-model="program.alt" 
                    type="text" 
                    class="form-control"
                    placeholder="圖片描述"
                    @input="hasChanges = true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading 狀態 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">載入中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { configService, type ConfigData } from '../services/configService'

const loading = ref(false)
const hasChanges = ref(false)
const mainActiveTab = ref('preview') // 主要 tab，預設顯示預覽
const activeTab = ref('banner')
const previewFrame = ref<HTMLIFrameElement>()

const tabs = [
  { id: 'banner', label: 'Banner' },
  { id: 'background', label: '背景圖' },
  { id: 'carousel', label: '輪播圖' },
  { id: 'videos', label: '精選視頻' },
  { id: 'programs', label: '火熱節目' }
]

const config = reactive<ConfigData>({
  logo: '',
  banner: '',
  backgroundImage: '',
  buttonLinks: [],
  carouselSlides: [],
  titles: {
    recommendedRoutes: '',
    recommendedBrowsers: '',
    selectedVideos: '',
    hotPrograms: ''
  },
  routeLinks: {
    default: '',
    hover: ''
  },
  toolIcons: [],
  videoThumbnails: [],
  programThumbnails: [],
  floatAdButtons: []
})

// 載入配置
const loadConfig = async () => {
  loading.value = true
  try {
    const data = await configService.getConfig()
    Object.assign(config, data)
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

// 處理圖片上傳
const handleImageUpload = async (event: Event, field: keyof ConfigData) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  loading.value = true
  try {
    const response = await configService.uploadImage(file, field as string)
    if (response.success && response.data) {
      ;(config as any)[field] = response.data.path
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
  ;(config as any)[field] = ''
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

// 清除視頻縮圖
const clearVideoImage = async (index: number) => {
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
const clearProgramImage = async (index: number) => {
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

// 新增視頻項目
const addVideoItem = () => {
  config.videoThumbnails.push({
    image: '',
    href: '',
    title: '',
    alt: ''
  })
  hasChanges.value = true
}

// 刪除視頻項目
const removeVideoItem = (index: number) => {
  if (config.videoThumbnails.length > 0) {
    config.videoThumbnails.splice(index, 1)
    hasChanges.value = true
  }
}

// 新增節目項目
const addProgramItem = () => {
  config.programThumbnails.push({
    image: '',
    href: '',
    title: '',
    alt: ''
  })
  hasChanges.value = true
}

// 刪除節目項目
const removeProgramItem = (index: number) => {
  if (config.programThumbnails.length > 0) {
    config.programThumbnails.splice(index, 1)
    hasChanges.value = true
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

onMounted(() => {
  loadConfig()
})
</script>

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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  padding: 2rem;
  height: calc(100vh - 140px);
}

.preview-section.full-width {
  width: 100%;
}

.preview-section h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.preview-container {
  height: calc(100% - 3rem);
  border: 2px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  transform: scale(0.85);
  transform-origin: top left;
  width: 117.65%; /* 100% / 0.85 */
  height: 117.65%; /* 100% / 0.85 */
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
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
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

.carousel-item,
.thumbnail-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
}

.carousel-item h4,
.thumbnail-item h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  font-size: 1.2rem;
}

/* 區塊標題樣式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.section-header h3 {
  margin: 0;
}

/* 項目標題樣式 */
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.item-header h4 {
  margin: 0;
}

/* 按鈕樣式 */
.btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.15s ease-in-out;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
</style>