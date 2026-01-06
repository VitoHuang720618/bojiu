<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ImageComponent from './ImageComponent.vue'
import ImageButton from './ImageButton.vue'
import { assetManifest } from '../config/assetManifest'
import {
  siteConfig,
  recommendedRoutes,
  recommendedTools,
  carouselSlides,
  floatAdButtons
} from '../config/siteConfig'
import { carouselService } from '../services/carouselService'
import type { ButtonLinkConfig } from '../types'

const currentSlide = ref(0)
let carouselInterval: number | null = null

// 从API获取的轮播图数据
const apiCarouselSlides = ref<{image: string, href: string, alt: string}[]>([])
const apiBanner = ref<string>('')
const apiBackgroundImage = ref<string>('')
const apiVideoThumbnails = ref<({image: string, href: string, alt: string, title: string} | null)[]>([])
const apiProgramThumbnails = ref<({image: string, href: string, alt: string, title: string} | null)[]>([])
const apiButtonLinks = ref<(ButtonLinkConfig | null)[]>([])
const apiToolIcons = ref<({id: string, default: string, hover: string, alt: string} | null)[]>([])

// 浮動按鈕收合狀態
const isFloatAdCollapsed = ref(false)

// 计算属性：优先使用API数据，否则使用默认数据
const effectiveCarouselSlides = computed(() => {
  return apiCarouselSlides.value.length > 0 ? 
    apiCarouselSlides.value.map((slide, index) => ({
      id: `api-slide-${index}`,
      alt: slide.alt,
      href: slide.href,
      image: slide.image
    })) : 
    carouselSlides.map((slide, index) => ({
      id: slide.id,
      alt: slide.alt,
      href: slide.href || '#',
      image: assetManifest.carouselSlides[index] || '' // 使用 assetManifest 中的圖片
    }))
})

const effectiveBanner = computed(() => {
  const bannerImage = apiBanner.value
  console.log('計算 Banner:', bannerImage)
  return bannerImage
})

const effectiveBackgroundImage = computed(() => {
  const bgImage = apiBackgroundImage.value
  console.log('計算背景圖:', bgImage)
  return bgImage
})

const effectiveVideoThumbnails = computed(() => {
  // 只使用API數據，不使用預設資料
  return apiVideoThumbnails.value
})

const effectiveProgramThumbnails = computed(() => {
  // 只使用API數據，不使用預設資料
  return apiProgramThumbnails.value
})

const effectiveButtonLinks = computed(() => {
  // 只使用API數據，和背景圖設置一樣
  const buttonLinksData = apiButtonLinks.value
  console.log('計算按鈕鏈接:', buttonLinksData)
  return buttonLinksData.map((button, index) => ({
    id: `api-button-${index}`,
    text: button?.text || '',
    href: button?.href || '#',
    target: button?.target || '_blank',
    defaultImage: button?.defaultImage || '',
    hoverImage: button?.hoverImage || ''
  }))
})

const effectiveToolIcons = computed(() => {
  // 只使用API數據，和背景圖設置一樣
  const toolIconsData = apiToolIcons.value
  console.log('計算工具圖標:', toolIconsData)
  console.log('toolIconsData 長度:', toolIconsData.length)
  const result = toolIconsData.map((tool, index) => ({
    id: tool?.id || `api-tool-${index}`,
    default: tool?.default || '',
    hover: tool?.hover || '',
    alt: tool?.alt || ''
  }))
  console.log('effectiveToolIcons 結果:', result)
  return result
})

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % effectiveCarouselSlides.value.length
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

// 加载轮播图和banner数据
const loadConfig = async () => {
  try {
    console.log('開始加載配置...')
    const config = await carouselService.getConfig()
    console.log('從 API 加載的配置:', config)
    apiCarouselSlides.value = config.carouselSlides
    apiBanner.value = config.banner
    apiBackgroundImage.value = config.backgroundImage
    apiVideoThumbnails.value = config.videoThumbnails
    apiProgramThumbnails.value = config.programThumbnails
    apiButtonLinks.value = config.buttonLinks
    apiToolIcons.value = config.toolIcons
    console.log('背景圖設置為:', config.backgroundImage)
    console.log('effectiveBackgroundImage:', effectiveBackgroundImage.value)
    console.log('buttonLinks 設置為:', config.buttonLinks)
    console.log('toolIcons 設置為:', config.toolIcons)
    console.log('effectiveToolIcons:', effectiveToolIcons.value)
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

onMounted(async () => {
  await loadConfig()
  startCarousel()
})

const onBannerSizeLoaded = () => {
  // 當原圖載入完成後，佔位區域會自動獲得相同尺寸
}

// 切換浮動按鈕收合狀態
const toggleFloatAd = (event?: Event) => {
  console.log('toggleFloatAd clicked, current state:', isFloatAdCollapsed.value)
  console.log('Event:', event)
  console.log('Event target:', event?.target)
  
  // 防止事件冒泡
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  isFloatAdCollapsed.value = !isFloatAdCollapsed.value
  console.log('new state:', isFloatAdCollapsed.value)
}

onUnmounted(() => {
  stopCarousel()
})
</script>

<template>
  <div class="main-inner">
    <!-- Banner -->
    <div id="banner">
      <ImageComponent
        v-if="effectiveBanner"
        :src="effectiveBanner"
        alt="Banner"
        :lazy="false"
      />
      <div v-else class="banner-placeholder">
        <!-- 隱藏的原圖用來獲取尺寸 -->
        <img 
          :src="assetManifest.banner" 
          alt="Banner placeholder" 
          class="banner-size-reference"
          @load="onBannerSizeLoaded"
        />
      </div>
    </div>

    <!-- Main Content -->
    <div id="home-main" :style="{ 
      backgroundImage: effectiveBackgroundImage ? `url('${effectiveBackgroundImage}')` : 
        'radial-gradient(circle, rgba(80, 80, 80, 0.4) 1.5px, transparent 1.5px), radial-gradient(circle, rgba(60, 60, 60, 0.3) 1px, transparent 1px), linear-gradient(180deg, rgba(223, 176, 130, 0.25) 0%, transparent 60px), linear-gradient(0deg, rgba(223, 176, 130, 0.25) 0%, transparent 60px)',
      backgroundColor: effectiveBackgroundImage ? 'transparent' : '#0a0a0a',
      backgroundSize: effectiveBackgroundImage ? 'cover' : '16px 16px, 32px 32px, 100% 60px, 100% 60px',
      backgroundPosition: effectiveBackgroundImage ? 'center' : '0 0, 8px 8px, top, bottom',
      backgroundRepeat: effectiveBackgroundImage ? 'no-repeat' : 'repeat, repeat, repeat-x, repeat-x'
    }">
      <div class="home-main__inner">
        <!-- Top Button Links -->
        <div class="button-links">
          <div
            v-for="(item, index) in assetManifest.buttonLinks"
            :key="item.id"
            class="item"
          >
            <ImageButton
              :default-src="effectiveButtonLinks[index]?.defaultImage || item.default"
              :hover-src="effectiveButtonLinks[index]?.hoverImage || item.hover"
              :alt="item.alt"
              :href="effectiveButtonLinks[index]?.href"
              :target="effectiveButtonLinks[index]?.target"
            />
          </div>
        </div>

        <!-- Recommend Section -->
        <div class="recommend">
          <!-- Carousel and Routes -->
          <div class="recommend-slider-links">
            <!-- Carousel Slider -->
            <div 
              class="recommend-slider"
              @mouseenter="stopCarousel"
              @mouseleave="startCarousel"
            >
              <div class="carousel-container">
                <!-- 隱藏的參考圖片，用來設定容器尺寸 -->
                <img 
                  src="/assets/images/fdf67cd6-2e20-4f52-9368-8460b71f641c.jpg" 
                  class="carousel-size-reference"
                  alt="Size reference"
                />
                <div
                  v-for="(slide, index) in effectiveCarouselSlides"
                  :key="slide.id"
                  class="carousel-slide"
                  :class="{ active: currentSlide === index }"
                >
                  <a :href="slide.href" target="_blank" rel="noopener noreferrer">
                    <ImageComponent
                      :src="slide.image || assetManifest.carouselSlides[index]"
                      :alt="slide.alt"
                    />
                  </a>
                </div>
              </div>
            </div>

            <!-- Recommended Routes -->
            <div class="recommend-links">
              <div class="block-title">
                <ImageComponent
                  :src="assetManifest.titles.recommendedRoutes"
                  alt="推荐线路标题"
                  :lazy="false"
                />
              </div>
              <div class="links">
                <div
                  v-for="route in recommendedRoutes"
                  :key="route.id"
                  class="item"
                >
                  <ImageButton
                    :default-src="assetManifest.routeLinks.default"
                    :hover-src="assetManifest.routeLinks.hover"
                    :alt="route.title"
                    :href="route.href"
                    :data-index="route.index"
                    :data-title="route.title"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Recommended Tools -->
          <div class="recommend-tools">
            <div class="block-title">
              <ImageComponent
                :src="assetManifest.titles.recommendedBrowsers"
                alt="推荐浏览器标题"
                :lazy="false"
              />
            </div>
            <div class="tools">
              <div
                v-for="(tool, index) in recommendedTools"
                :key="tool.id"
                class="item"
              >
                <ImageButton
                  v-if="effectiveToolIcons[index] && effectiveToolIcons[index].default"
                  :default-src="effectiveToolIcons[index].default"
                  :hover-src="effectiveToolIcons[index].hover"
                  :alt="effectiveToolIcons[index].alt || tool.name"
                  :href="tool.href"
                />
                <ImageButton
                  v-else
                  :default-src="assetManifest.toolIcons[index]?.default"
                  :hover-src="assetManifest.toolIcons[index]?.hover"
                  :alt="tool.name"
                  :href="tool.href"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Programme Sections -->
        <div class="programme-wrap">
          <!-- Selected Videos -->
          <div class="programme-block">
            <div class="block-title">
              <ImageComponent
                :src="assetManifest.titles.selectedVideos"
                alt="精选短视频標題圖"
                :lazy="false"
              />
            </div>
            <div class="list" v-if="effectiveVideoThumbnails.length > 0">
              <div
                v-for="(video, index) in effectiveVideoThumbnails"
                :key="video ? `video-${index}` : `empty-${index}`"
                class="item"
                :class="{ 'empty-item': !video }"
              >
                <template v-if="video">
                  <a :href="video.href" target="_blank" rel="noopener noreferrer">
                    <div class="img">
                      <ImageComponent
                        :src="video.image"
                        :alt="video.alt"
                      />
                    </div>
                    <span>{{ video.title }}</span>
                  </a>
                </template>
                <div v-else class="empty-placeholder"></div>
              </div>
            </div>
            <div v-else class="empty-section-placeholder"></div>
          </div>

          <!-- Hot Programs -->
          <div class="programme-block">
            <div class="block-title">
              <ImageComponent
                :src="assetManifest.titles.hotPrograms"
                alt="火熱節目標題圖"
                :lazy="false"
              />
            </div>
            <div class="list" v-if="effectiveProgramThumbnails.length > 0">
              <div
                v-for="(program, index) in effectiveProgramThumbnails"
                :key="program ? `program-${index}` : `empty-program-${index}`"
                class="item"
                :class="{ 'empty-item': !program }"
              >
                <template v-if="program">
                  <a :href="program.href" target="_blank" rel="noopener noreferrer">
                    <div class="img">
                      <ImageComponent
                        :src="program.image"
                        :alt="program.alt"
                      />
                    </div>
                    <span>{{ program.title }}</span>
                  </a>
                </template>
                <div v-else class="empty-placeholder"></div>
              </div>
            </div>
            <div v-else class="empty-section-placeholder"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Float Ad Buttons -->
    <div id="float-ad" :class="{ collapsed: isFloatAdCollapsed }">
      <!-- 收合/展開按鈕 -->
      <button 
        class="float-ad-toggle" 
        @click.stop="toggleFloatAd($event)"
        @touchend.stop="toggleFloatAd($event)"
        type="button"
      >
        <span class="toggle-icon">{{ isFloatAdCollapsed ? '▲' : '▼' }}</span>
      </button>
      
      <div class="links" v-show="!isFloatAdCollapsed">
        <div
          v-for="(button, index) in floatAdButtons"
          :key="button.id"
          class="item"
        >
          <ImageButton
            :default-src="assetManifest.floatAdButtons[index].default"
            :hover-src="assetManifest.floatAdButtons[index].hover"
            :alt="button.name"
            :href="button.href"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#banner {
  width: 100%;
}

#banner img {
  display: block;
  width: 100%;
}

.banner-placeholder {
  width: 100%;
  position: relative;
}

.banner-size-reference {
  width: 100%;
  opacity: 0; /* 完全透明，但保持尺寸 */
  display: block;
}

#home-main {
  border-color: #dfb082;
  border-style: solid;
  border-width: 4px 0;
  box-sizing: border-box;
  padding: 3rem 4.6875rem;
}

@media (max-width: 1280px) {
  #home-main {
    padding: 3rem 2.5rem;
  }
}

@media (max-width: 1024px) {
  #home-main {
    padding: 2.5rem;
  }
}

@media (max-width: 768px) {
  #home-main {
    padding: 2.5rem 1.25rem;
  }
}

@media (max-width: 480px) {
  #home-main {
    border-width: 2px 0;
    padding: 1.5625rem 0.9375rem;
    padding-bottom: 5rem; /* 為收合按鈕留出空間 */
  }
}

.home-main__inner {
  margin: 0 auto;
  max-width: 1280px;
  width: 100%;
}

/* Button Links */
.button-links {
  display: grid;
  gap: 3rem;
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 3rem;
}

@media (max-width: 1024px) {
  .button-links {
    gap: 1.25rem;
    margin-bottom: 2.5rem;
  }
}

@media (max-width: 768px) {
  .button-links {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .button-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5625rem;
  }
}

/* Block Title */
.block-title {
  height: 36px;
  margin-bottom: 1.25rem;
}

@media (max-width: 1280px) {
  .block-title {
    height: 30px;
  }
}

@media (max-width: 480px) {
  .block-title {
    height: 28px;
    margin-bottom: 1rem;
  }
}

.block-title img {
  max-height: 100%;
  width: auto;
}

/* Recommend Section */
.recommend {
  background-color: rgba(0, 0, 0, 0.8);
  border: 2px solid #dfb082;
  border-radius: 2px;
  box-sizing: border-box;
  margin-bottom: 3rem;
}

@media (max-width: 1024px) {
  .recommend {
    margin-bottom: 2.5rem;
  }
}

@media (max-width: 480px) {
  .recommend {
    margin-bottom: 2rem;
  }
}

.recommend-slider-links {
  box-sizing: border-box;
  padding: 1.5625rem 2.125rem;
  display: flex;
  flex-direction: row;
  align-items: center;
}

@media (max-width: 1024px) {
  .recommend-slider-links {
    padding: 1.5625rem 1.25rem;
  }
}

@media (max-width: 768px) {
  .recommend-slider-links {
    flex-direction: column;
    padding: 1.75rem;
  }
}

@media (max-width: 480px) {
  .recommend-slider-links {
    padding: 1.25rem 0.875rem;
  }
}

.recommend-slider {
  margin-right: 2.25rem;
  width: 50.4%;
  flex-shrink: 0;
}

@media (max-width: 1024px) {
  .recommend-slider {
    margin-right: 0.9375rem;
  }
}

@media (max-width: 768px) {
  .recommend-slider {
    margin-bottom: 1.25rem;
    margin-right: 0;
    width: 100%;
  }
}

.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel-slide img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover; /* 保持比例，裁切多餘部分 */
}

.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel-size-reference {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0; /* 完全透明，但佔據空間 */
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.carousel-slide.active {
  display: block;
  opacity: 1;
}

.carousel-slide a {
  display: block;
  width: 100%;
  height: 100%;
}

.carousel-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill; /* 強制填滿容器，可能會變形 */
}

.recommend-links {
  flex: 1;
}

@media (max-width: 768px) {
  .recommend-links {
    width: 100%;
  }
}

.recommend-links .links {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 1024px) {
  .recommend-links .links {
    gap: 0.875rem;
  }
}

@media (max-width: 768px) {
  .recommend-links .links {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.625rem;
  }
}

@media (max-width: 480px) {
  .recommend-links .links {
    grid-template-columns: repeat(2, 1fr);
  }
}

.recommend-links .links .item :deep(.img-button)::after,
.recommend-links .links .item :deep(.img-button)::before {
  display: block;
  position: absolute;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  z-index: 2;
}

.recommend-links .links .item :deep(.img-button)::before {
  color: #880214;
  content: attr(data-index);
  font-size: 2.5em;
  font-weight: 700;
  left: 11.9%;
}

@media (max-width: 1280px) {
  .recommend-links .links .item :deep(.img-button)::before {
    font-size: 2.1875em;
  }
}

@media (max-width: 768px) {
  .recommend-links .links .item :deep(.img-button)::before {
    font-size: 2em;
  }
}

.recommend-links .links .item :deep(.img-button)::after {
  color: #dfb082;
  content: attr(data-title);
  font-size: 1.5em;
  left: 60%;
  white-space: nowrap;
}

@media (max-width: 1280px) {
  .recommend-links .links .item :deep(.img-button)::after {
    font-size: 1.375em;
  }
}

@media (max-width: 768px) {
  .recommend-links .links .item :deep(.img-button)::after {
    font-size: 1.25em;
  }
}

/* Recommend Tools */
.recommend-tools {
  border-top: 2px solid #dfb082;
  box-sizing: border-box;
  padding: 1rem 2.125rem;
  display: flex;
  flex-direction: row;
  align-items: center;
}

@media (max-width: 1024px) {
  .recommend-tools {
    padding: 1rem 1.25rem;
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .recommend-tools {
    padding: 1.75rem;
  }
}

@media (max-width: 480px) {
  .recommend-tools {
    padding: 1.25rem 0.875rem;
  }
}

.recommend-tools .block-title {
  margin-right: 1.5rem;
  margin-bottom: 0;
}

@media (max-width: 1024px) {
  .recommend-tools .block-title {
    margin-bottom: 0.5rem;
    margin-right: 0;
  }
}

.recommend-tools .tools {
  display: grid;
  gap: 0.0625rem;
  grid-template-columns: repeat(6, 1fr);
  flex: 1;
}

@media (max-width: 1024px) {
  .recommend-tools .tools {
    gap: 1rem;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .recommend-tools .tools {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .recommend-tools .tools {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem 1rem;
  }
}

.recommend-tools .tools .item {
  position: relative;
}

.recommend-tools .tools .item::after {
  background-color: #ffc990;
  content: '';
  display: block;
  height: 60px;
  position: absolute;
  right: -1.5px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
}

@media (max-width: 1024px) {
  .recommend-tools .tools .item::after {
    height: 42px;
    right: -6.5px;
  }
}

@media (max-width: 768px) {
  .recommend-tools .tools .item::after {
    height: 32px;
    right: -8.5px;
  }
}

@media (max-width: 480px) {
  .recommend-tools .tools .item::after {
    height: 40px;
  }
  
  .recommend-tools .tools .item:nth-child(3n+3)::after {
    display: none;
  }
}

.recommend-tools .tools .item:last-child::after {
  display: none;
}

/* Programme Sections */
.programme-wrap {
  display: grid;
  gap: 3.5rem;
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 1024px) {
  .programme-wrap {
    gap: 2.25rem;
  }
}

@media (max-width: 768px) {
  .programme-wrap {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

@media (max-width: 480px) {
  .programme-wrap {
    gap: 2rem;
  }
}

.programme-wrap .list {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* 自適應網格 */
}

@media (max-width: 1024px) {
  .programme-wrap .list {
    gap: 0.875rem;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}

@media (max-width: 768px) {
  .programme-wrap .list {
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}

@media (max-width: 480px) {
  .programme-wrap .list {
    gap: 0.625rem;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}

@media (max-width: 360px) {
  .programme-wrap .list {
    grid-template-columns: repeat(2, 1fr); /* 極窄螢幕強制 2 欄 */
  }
}

.programme-wrap .list .item {
  cursor: pointer;
}

.programme-wrap .list .item .img {
  border: 2px solid #b3905b;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  overflow: hidden;
  position: relative;
  width: 100%;  /* 改為彈性寬度 */
  max-width: 187px; /* 最大寬度限制 */
  aspect-ratio: 187 / 105; /* 保持寬高比 */
}

.programme-wrap .list .item .img::before {
  background-color: hsla(0, 0%, 100%, 0.5);
  content: '';
  display: block;
  height: 100%;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  transition: all 0.1s ease-in-out;
  width: 100%;
}

.programme-wrap .list .item .img img {
  width: 100%;
  height: 100%;
  object-fit: fill; /* 強制填滿，可能變形 */
}

/* 空資料的處理 */
.programme-wrap .list .item.empty-item {
  opacity: 0.3; /* 半透明顯示空位置 */
}

.programme-wrap .list .item .empty-placeholder {
  width: 100%;
  max-width: 187px;
  aspect-ratio: 187 / 105;
  border: 2px dashed #b3905b;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  background-color: transparent;
}

/* 整個區塊為空時的佔位區域 */
.empty-section-placeholder {
  width: 100%;
  max-width: 612px;
  aspect-ratio: 612 / 353;
  border: 2px dashed #b3905b;
  border-radius: 10px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b3905b;
  font-size: 16px;
  opacity: 0.5;
}

.empty-section-placeholder::after {
  content: "暫無內容";
}

.programme-wrap .list .item span {
  color: #ffd08c;
  font-size: 1.25em;
  letter-spacing: 2px;
  line-height: 1.25;
  margin-left: 0.5rem;
}

@media (max-width: 1280px) {
  .programme-wrap .list .item span {
    font-size: 1em;
  }
}

.programme-wrap .list .item:hover .img::before {
  opacity: 1;
}

/* Float Ad */
#float-ad {
  bottom: 1rem;
  max-width: 110px;
  min-width: 75px;
  position: fixed;
  right: 2.5rem;
  width: 5.7%;
  z-index: 99;
  transition: all 0.3s ease;
}

@media (max-width: 1440px) {
  #float-ad {
    max-width: 75px;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  #float-ad {
    background-color: rgba(0, 0, 0, 0.9);
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    max-width: none;
    min-width: auto;
    padding: 0;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    z-index: 999;
    position: fixed;
  }
  
  #float-ad.collapsed {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

/* 收合/展開按鈕 */
.float-ad-toggle {
  display: none;
}

@media (max-width: 480px) {
  .float-ad-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
    cursor: pointer;
    background-color: rgba(223, 176, 130, 0.2);
    border-radius: 12px 12px 0 0;
    transition: all 0.2s;
    position: relative;
    z-index: 1001; /* 提高 z-index 確保可點擊 */
    border: none;
    width: 100%;
    outline: none;
    -webkit-tap-highlight-color: transparent; /* 移除 iOS 點擊高亮 */
    touch-action: manipulation; /* 優化觸控體驗 */
  }
  
  .float-ad-toggle:hover {
    background-color: rgba(223, 176, 130, 0.3);
  }
  
  .float-ad-toggle:active {
    background-color: rgba(223, 176, 130, 0.4);
    transform: scale(0.98);
  }
  
  .toggle-icon {
    color: #dfb082;
    font-size: 1.2rem;
    font-weight: bold;
    pointer-events: none;
    user-select: none; /* 防止文字選取 */
  }
  
  #float-ad.collapsed .float-ad-toggle {
    border-radius: 12px;
  }
}

#float-ad .links {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (max-width: 1440px) {
  #float-ad .links {
    gap: 0.875rem;
  }
}

@media (max-width: 480px) {
  #float-ad .links {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem;
    animation: slideDown 0.3s ease;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
