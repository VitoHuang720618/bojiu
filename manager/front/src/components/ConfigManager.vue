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

          <!-- Button Links 配置 -->
          <div v-if="activeTab === 'buttonlinks'" class="config-panel">
            <div class="panel-header">
              <h3>按鈕鏈接設置</h3>
              <div class="button-actions">
                <button @click="resetButtonLinks" class="btn btn-secondary">重置為預設</button>
                <button @click="addButtonLink" class="btn btn-primary">新增按鈕</button>
              </div>
            </div>
            
            <div class="button-links-info">
              <p class="info-text">
                <strong>說明：</strong>這裡配置的按鈕會替換前端頁面頂部的按鈕。
                可以上傳自定義的按鈕圖片（默認圖和懸停圖），並設置鏈接地址和顯示文字。
                所有鏈接都會在新視窗中打開。
              </p>
            </div>
            
            <!-- 如果沒有按鈕鏈接，顯示提示 -->
            <div v-if="config.buttonLinks.length === 0" class="empty-state">
              <p>目前沒有按鈕鏈接配置，將使用預設配置</p>
              <button @click="addButtonLink" class="btn btn-primary btn-lg">新增第一個按鈕鏈接</button>
            </div>
            
            <div v-for="(button, index) in config.buttonLinks" :key="index" class="button-link-item">
              <div class="item-header">
                <h4>按鈕 {{ index + 1 }}</h4>
                <button @click="removeButtonLink(index)" class="btn btn-danger btn-sm">刪除</button>
              </div>
              <div class="button-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>顯示文字</label>
                    <input 
                      v-model="button.text" 
                      type="text" 
                      class="form-control"
                      placeholder="例如：官方網站"
                      @input="hasChanges = true"
                    />
                  </div>
                  <div class="form-group">
                    <label>鏈接地址</label>
                    <input 
                      v-model="button.href" 
                      type="url" 
                      class="form-control"
                      placeholder="https://example.com"
                      @input="hasChanges = true"
                    />
                  </div>
                </div>
                <div class="image-row">
                  <div class="form-group">
                    <label>默認圖片</label>
                    <div class="image-upload">
                      <img v-if="button.defaultImage" :src="getImageUrl(button.defaultImage)" alt="Default" class="preview-img small" />
                      <div v-else class="placeholder small">無圖片</div>
                      <input 
                        type="file" 
                        @change="(e) => handleButtonImageUpload(e, index, 'defaultImage')"
                        accept="image/*"
                        class="file-input"
                      />
                      <button @click="removeButtonImage(index, 'defaultImage')" class="btn btn-danger btn-sm">刪除圖片</button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>懸停圖片</label>
                    <div class="image-upload">
                      <img v-if="button.hoverImage" :src="getImageUrl(button.hoverImage)" alt="Hover" class="preview-img small" />
                      <div v-else class="placeholder small">無圖片</div>
                      <input 
                        type="file" 
                        @change="(e) => handleButtonImageUpload(e, index, 'hoverImage')"
                        accept="image/*"
                        class="file-input"
                      />
                      <button @click="removeButtonImage(index, 'hoverImage')" class="btn btn-danger btn-sm">刪除圖片</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tool Icons 配置 -->
          <div v-if="activeTab === 'toolicons'" class="config-panel">
            <div class="panel-header">
              <h3>工具圖標設置</h3>
              <div class="button-actions">
                <button @click="resetToolIcons" class="btn btn-secondary">重置為預設</button>
                <button @click="addToolIcon" class="btn btn-primary">新增圖標</button>
              </div>
            </div>
            
            <div class="button-links-info">
              <p class="info-text">
                <strong>說明：</strong>這裡配置的工具圖標會替換前端頁面推薦瀏覽器區域的圖標。
                可以上傳自定義的圖標（默認圖和懸停圖），並設置圖標名稱。
                所有圖標都會在新視窗中打開。
              </p>
            </div>
            
            <!-- 如果沒有工具圖標，顯示提示 -->
            <div v-if="config.toolIcons.length === 0" class="empty-state">
              <p>目前沒有工具圖標配置，將使用預設配置</p>
              <button @click="addToolIcon" class="btn btn-primary btn-lg">新增第一個工具圖標</button>
            </div>
            
            <div v-for="(tool, index) in config.toolIcons" :key="index" class="button-link-item">
              <div class="item-header">
                <h4>工具圖標 {{ index + 1 }}</h4>
                <button @click="removeToolIcon(index)" class="btn btn-danger btn-sm">刪除</button>
              </div>
              <div class="button-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>連結網址</label>
                    <input 
                      v-model="tool.href" 
                      type="url" 
                      class="form-control"
                      placeholder="https://example.com"
                      @input="hasChanges = true"
                    />
                  </div>
                </div>
                <div class="image-row">
                  <div class="form-group">
                    <label>默認圖標</label>
                    <div class="image-upload">
                      <img v-if="tool.default" :src="getImageUrl(tool.default)" alt="Default" class="preview-img small" />
                      <div v-else class="placeholder small">無圖片</div>
                      <input 
                        type="file" 
                        @change="(e) => handleToolIconImageUpload(e, index, 'default')"
                        accept="image/*"
                        class="file-input"
                      />
                      <button @click="removeToolIconImage(index, 'default')" class="btn btn-danger btn-sm">刪除圖片</button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>懸停圖標</label>
                    <div class="image-upload">
                      <img v-if="tool.hover" :src="getImageUrl(tool.hover)" alt="Hover" class="preview-img small" />
                      <div v-else class="placeholder small">無圖片</div>
                      <input 
                        type="file" 
                        @change="(e) => handleToolIconImageUpload(e, index, 'hover')"
                        accept="image/*"
                        class="file-input"
                      />
                      <button @click="removeToolIconImage(index, 'hover')" class="btn btn-danger btn-sm">刪除圖片</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Route Links 配置 -->
          <div v-if="activeTab === 'routelinks'" class="config-panel">
            <div class="panel-header">
              <h3>推薦路線設置</h3>
              <div class="button-actions">
                <button @click="resetRouteLinks" class="btn btn-secondary">重置為預設</button>
              </div>
            </div>
            
            <div class="button-links-info">
              <p class="info-text">
                <strong>說明：</strong>這裡配置推薦優質線路區域的按鈕圖片。
                可以上傳自定義的圖片（默認圖和懸停圖）。
                這個按鈕會顯示在推薦優質線路標題下方。
              </p>
            </div>
            
            <div class="route-links-item">
              <div class="item-header">
                <h4>推薦路線按鈕</h4>
              </div>
              <div class="button-form">
                <div class="image-row">
                  <div class="form-group">
                    <label>默認圖片</label>
                    <div class="image-upload">
                      <img v-if="config.routeLinks.default" :src="getImageUrl(config.routeLinks.default)" alt="Default" class="preview-img small" />
                      <div v-else class="placeholder small">無圖片</div>
                      <input 
                        type="file" 
                        @change="(e) => handleRouteLinksImageUpload(e, 'default')"
                        accept="image/*"
                        class="file-input"
                      />
                      <button @click="removeRouteLinksImage('default')" class="btn btn-danger btn-sm">刪除圖片</button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>懸停圖片</label>
                    <div class="image-upload">
                      <img v-if="config.routeLinks.hover" :src="getImageUrl(config.routeLinks.hover)" alt="Hover" class="preview-img small" />
                      <div v-else class="placeholder small">無圖片</div>
                      <input 
                        type="file" 
                        @change="(e) => handleRouteLinksImageUpload(e, 'hover')"
                        accept="image/*"
                        class="file-input"
                      />
                      <button @click="removeRouteLinksImage('hover')" class="btn btn-danger btn-sm">刪除圖片</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carousel 配置 -->
          <div v-if="activeTab === 'carousel'" class="config-panel">
            <div class="panel-header">
              <h3>輪播圖設置</h3>
              <div class="button-actions">
                <button @click="addCarouselSlide" class="btn btn-primary">新增輪播圖</button>
              </div>
            </div>
            
            <!-- 如果沒有輪播圖，顯示提示 -->
            <div v-if="config.carouselSlides.length === 0" class="empty-state">
              <p>目前沒有輪播圖配置</p>
              <button @click="addCarouselSlide" class="btn btn-primary btn-lg">新增第一張輪播圖</button>
            </div>
            
            <div v-for="(slide, index) in config.carouselSlides" :key="index" class="carousel-item">
              <div class="item-header">
                <h4>輪播圖 {{ index + 1 }}</h4>
                <button @click="removeCarouselSlide(index)" class="btn btn-danger btn-sm">刪除</button>
              </div>
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
                    v-model="slide.description" 
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
            <div class="panel-header">
              <h3>精選短視頻設置</h3>
              <button @click="addVideo" class="btn btn-primary">新增視頻</button>
            </div>
            
            <!-- 如果沒有視頻，顯示提示和新增按鈕 -->
            <div v-if="config.videoThumbnails.length === 0" class="empty-state">
              <p>目前沒有視頻項目</p>
              <button @click="addVideo" class="btn btn-primary btn-lg">新增第一個視頻</button>
            </div>
            
            <div v-for="(video, index) in config.videoThumbnails" :key="index" class="thumbnail-item">
              <div class="item-header">
                <h4>視頻 {{ index + 1 }}</h4>
                <button @click="removeVideo(index)" class="btn btn-danger btn-sm">刪除項目</button>
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
                    <button @click="removeVideoImage(index)" class="btn btn-danger btn-sm">刪除圖片</button>
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
            <div class="panel-header">
              <h3>火熱節目設置</h3>
              <button @click="addProgram" class="btn btn-primary">新增節目</button>
            </div>
            
            <!-- 如果沒有節目，顯示提示和新增按鈕 -->
            <div v-if="config.programThumbnails.length === 0" class="empty-state">
              <p>目前沒有節目項目</p>
              <button @click="addProgram" class="btn btn-primary btn-lg">新增第一個節目</button>
            </div>
            
            <div v-for="(program, index) in config.programThumbnails" :key="index" class="thumbnail-item">
              <div class="item-header">
                <h4>節目 {{ index + 1 }}</h4>
                <button @click="removeProgram(index)" class="btn btn-danger btn-sm">刪除項目</button>
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
                    <button @click="removeProgramImage(index)" class="btn btn-danger btn-sm">刪除圖片</button>
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

          <!-- Float Ad Buttons 配置 -->
          <div v-if="activeTab === 'floatads'" class="config-panel">
            <div class="panel-header">
              <h3>浮動廣告設置</h3>
              <div class="button-actions">
                <button @click="resetFloatAdButtons" class="btn btn-secondary">重置為預設</button>
                <button @click="addFloatAdButton" class="btn btn-primary">新增廣告</button>
              </div>
            </div>

            <div class="button-links-info">
              <p class="info-text">
                <strong>說明：</strong>這裡配置的浮動廣告按鈕會顯示在頁面右下角。
                可以上傳自定義的圖標（默認圖和懸停圖），並設置點擊連結。
                所有按鈕都會在新視窗中打開。
              </p>
            </div>
            
            <!-- 如果沒有浮動廣告，顯示提示 -->
            <div v-if="config.floatAdButtons.length === 0" class="empty-state">
              <p>目前沒有浮動廣告配置，將使用預設配置</p>
              <button @click="addFloatAdButton" class="btn btn-primary btn-lg">新增第一個浮動廣告</button>
            </div>
            
            <div v-for="(button, index) in config.floatAdButtons" :key="index" class="button-link-item">
              <div class="item-header">
                <h4>浮動廣告 {{ index + 1 }}</h4>
                <button @click="removeFloatAdButton(index)" class="btn btn-danger btn-sm">刪除</button>
              </div>
              <div class="button-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>連結網址</label>
                    <input 
                      v-model="button.href" 
                      type="url" 
                      class="form-control"
                      placeholder="https://example.com"
                      @input="hasChanges = true"
                    />
                  </div>
                </div>
                <div class="image-row">
                  <div class="form-group">
                    <label>默認圖標</label>
                    <div class="image-upload">
                      <img v-if="button.default" :src="getImageUrl(button.default)" alt="Default" class="preview-img small" />
                      <div v-else class="placeholder small">無圖片</div>
                      <input 
                        type="file" 
                        @change="(e) => handleFloatAdImageUpload(e, index, 'default')"
                        accept="image/*"
                        class="file-input"
                      />
                      <button @click="removeFloatAdImage(index, 'default')" class="btn btn-danger btn-sm">刪除圖片</button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>懸停圖標</label>
                    <div class="image-upload">
                      <img v-if="button.hover" :src="getImageUrl(button.hover)" alt="Hover" class="preview-img small" />
                      <div v-else class="placeholder small">無圖片</div>
                      <input 
                        type="file" 
                        @change="(e) => handleFloatAdImageUpload(e, index, 'hover')"
                        accept="image/*"
                        class="file-input"
                      />
                      <button @click="removeFloatAdImage(index, 'hover')" class="btn btn-danger btn-sm">刪除圖片</button>
                    </div>
                  </div>
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
      config.buttonLinks = config.buttonLinks.map((button, index) => ({
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
      config.toolIcons = config.toolIcons.map((tool, index) => ({
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
      config.floatAdButtons = config.floatAdButtons.map((button, index) => ({
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

// 新增輪播圖
const addCarouselSlide = () => {
  config.carouselSlides.push({
    image: '',
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

/* Button Links 特定樣式 */
.button-actions {
  display: flex;
  gap: 1rem;
}

.button-links-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 4px;
}

.info-text {
  margin: 0;
  color: #1565c0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.button-link-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
}

.route-links-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
}

.button-link-item h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.button-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
}

.image-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .form-row,
  .image-row {
    grid-template-columns: 1fr;
  }
  
  .button-actions {
    flex-direction: column;
  }
}
</style>