<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ImageComponent from './ImageComponent.vue'
import ImageButton from './ImageButton.vue'
import { assetManifest } from '../config/assetManifest'
import {
  recommendedRoutes,
  recommendedTools,
  carouselSlides
} from '../config/siteConfig'
import { carouselService } from '../services/carouselService'
import type { ButtonLinkConfig } from '../types'

const currentSlide = ref(0)
let carouselInterval: number | null = null

// 从API获取的轮播图数据
const apiCarouselSlides = ref<{ image: string, href: string, alt: string }[]>([])
const apiBanner = ref<string>('')
const apiBackgroundImage = ref<string>('')
const apiVideoThumbnails = ref<({ image: string, href: string, alt: string, title: string } | null)[]>([])
const apiProgramThumbnails = ref<({ image: string, href: string, alt: string, title: string } | null)[]>([])
const apiButtonLinks = ref<(ButtonLinkConfig | null)[]>([])
const apiToolIcons = ref<({ id: string, default: string, hover: string, alt: string, href: string } | null)[]>([])
const apiFloatAdButtons = ref<({ href: string, default: string, hover: string } | null)[]>([])
const apiRouteLinks = ref<{ default: string, hover: string } | null>(null)

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
    alt: tool?.alt || '',
    href: tool?.href || ''
  }))
  console.log('effectiveToolIcons 結果:', result)
  return result
})

const effectiveFloatAdButtons = computed(() => {
  // 只使用API數據，和背景圖設置一樣
  const floatAdButtonsData = apiFloatAdButtons.value
  console.log('計算浮動廣告按鈕:', floatAdButtonsData)
  return floatAdButtonsData.map((button, index) => ({
    id: `api-floatad-${index}`,
    href: button?.href || '#',
    default: button?.default || '',
    hover: button?.hover || ''
  }))
})

const effectiveRouteLinks = computed(() => {
  // 只使用API數據，和背景圖設置一樣
  const routeLinksData = apiRouteLinks.value
  console.log('計算推薦路線按鈕:', routeLinksData)

  if (Array.isArray(routeLinksData)) {
    return routeLinksData
  }

  // 確保 assetManifest.routeLinks 是數組
  return Array.isArray(assetManifest.routeLinks) ? assetManifest.routeLinks : []
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
    apiFloatAdButtons.value = config.floatAdButtons || []
    apiRouteLinks.value = config.routeLinks || null
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
      <ImageComponent v-if="effectiveBanner" :src="effectiveBanner" alt="Banner" :lazy="false" />
      <div v-else class="banner-placeholder">
        <!-- 隱藏的原圖用來獲取尺寸 -->
        <img :src="assetManifest.banner" alt="Banner placeholder" class="banner-size-reference"
          @load="onBannerSizeLoaded" />
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
          <div v-for="(item, index) in assetManifest.buttonLinks" :key="item.id" class="item">
            <ImageButton :default-src="effectiveButtonLinks[index]?.defaultImage || item.default"
              :hover-src="effectiveButtonLinks[index]?.hoverImage || item.hover" :alt="item.alt"
              :href="effectiveButtonLinks[index]?.href" :target="effectiveButtonLinks[index]?.target" />
          </div>
        </div>

        <!-- Recommend Section Container -->
        <div class="recommend-section">
          <!-- Top Content (Slider + Routes) -->
          <div class="recommend-content">
            <!-- Carousel Slider -->
            <div class="recommend-slider" @mouseenter="stopCarousel" @mouseleave="startCarousel">
              <div v-for="(slide, index) in effectiveCarouselSlides" :key="slide.id" class="carousel-slide"
                :class="{ active: currentSlide === index }">
                <a :href="slide.href" target="_blank" rel="noopener noreferrer">
                  <ImageComponent :src="slide.image || assetManifest.carouselSlides[index]" :alt="slide.alt" />
                </a>
              </div>
            </div>

            <!-- Recommended Routes -->
            <div class="recommend-links">
              <div class="block-title recommend-routes-title">
                <img :src="assetManifest.titles.recommendedRoutes" alt="皇冠圖標" class="crown-icon" />
                <span class="title-text">推荐优质线路</span>
              </div>
              <div class="links">
                <div v-for="(route, index) in recommendedRoutes" :key="route.id" class="item">
                  <ImageButton v-if="effectiveRouteLinks[index]" :default-src="effectiveRouteLinks[index].default"
                    :hover-src="effectiveRouteLinks[index].hover" :alt="route.title" :href="route.href" />
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Tools (Browsers) -->
          <div class="recommend-footer">
            <div class="block-title">
              <ImageComponent :src="assetManifest.titles.recommendedBrowsers" alt="推荐浏览器标题" :lazy="false" />
            </div>
            <div class="tools">
              <div v-for="(tool, index) in recommendedTools" :key="tool.id" class="item">
                <ImageButton v-if="effectiveToolIcons[index] && effectiveToolIcons[index].default"
                  :default-src="effectiveToolIcons[index].default" :hover-src="effectiveToolIcons[index].hover"
                  :alt="effectiveToolIcons[index].alt || tool.name" :href="effectiveToolIcons[index].href || tool.href" />
                <ImageButton v-else :default-src="assetManifest.toolIcons[index]?.default"
                  :hover-src="assetManifest.toolIcons[index]?.hover" :alt="tool.name" :href="tool.href" />
              </div>
            </div>
          </div>
        </div>

        <!-- Programme Sections -->
        <div class="programme-wrap">
          <!-- Selected Videos -->
          <div class="programme-block">
            <div class="block-title">
              <ImageComponent :src="assetManifest.titles.selectedVideos" alt="精选短视频標題圖" :lazy="false" />
            </div>
            <div class="list" v-if="effectiveVideoThumbnails.length > 0">
              <div v-for="(video, index) in effectiveVideoThumbnails" :key="video ? `video-${index}` : `empty-${index}`"
                class="item" :class="{ 'empty-item': !video }">
                <template v-if="video">
                  <a :href="video.href" target="_blank" rel="noopener noreferrer">
                    <div class="img">
                      <ImageComponent :src="video.image" :alt="video.alt" />
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
          <div class="programme-block sport-block">
            <div class="block-title">
              <ImageComponent :src="assetManifest.titles.hotPrograms" alt="火熱節目標題圖" :lazy="false" />
            </div>
            <div class="list" v-if="effectiveProgramThumbnails.length > 0">
              <div v-for="(program, index) in effectiveProgramThumbnails"
                :key="program ? `program-${index}` : `empty-program-${index}`" class="item"
                :class="{ 'empty-item': !program }">
                <template v-if="program">
                  <a :href="program.href" target="_blank" rel="noopener noreferrer">
                    <div class="img">
                      <ImageComponent :src="program.image" :alt="program.alt" />
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
      <button class="float-ad-toggle" @click.stop="toggleFloatAd($event)" @touchend.stop="toggleFloatAd($event)"
        type="button">
        <span class="toggle-icon">{{ isFloatAdCollapsed ? '▲' : '▼' }}</span>
      </button>

      <div class="links" v-show="!isFloatAdCollapsed">
        <div v-for="(button, index) in effectiveFloatAdButtons" :key="button.id" class="item">
          <ImageButton :default-src="button.default" :hover-src="button.hover" :alt="`浮動廣告 ${index + 1}`"
            :href="button.href" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#banner {
  width: 100%;
}

#banner {
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: #000;
}

#banner :deep(img) {
  display: block;
  width: 100%;
  max-width: 1920px;
  height: auto;
  aspect-ratio: 1920 / 500;
  object-fit: cover;
}

@media (max-width: 820px) {
  #banner {
    height: 340px;
    overflow: hidden;
  }
  #banner :deep(img) {
    height: 340px;
    width: auto;
    max-width: none;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }
}

.banner-placeholder {
  width: 100%;
  position: relative;
}

.banner-size-reference {
  width: 100%;
  opacity: 0;
  /* 完全透明，但保持尺寸 */
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
    padding-bottom: 5rem;
    /* 為收合按鈕留出空間 */
  }
}

.home-main__inner {
  margin: 0 auto;
  max-width: 1520px;
  width: 100%;
}

/* Button Links */
/* Button Links */
.button-links {
  display: grid;
  justify-content: space-between;
  grid-template-columns: repeat(4, 352px);
  width: 100%;
  max-width: 1501px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 3rem;
}

@media (max-width: 1600px) {
  .button-links {
    width: 100%;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    padding: 0 27px;
    box-sizing: border-box;
  }

  .button-links .item {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 352/102;
  }
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

@media (max-width: 820px) {
  .button-links {
    width: 789px !important;
    grid-template-columns: repeat(4, 187px) !important;
    gap: 13px !important;
    padding: 0 !important;
    margin: 0 auto 3rem auto !important;
  }

  .button-links .item {
    width: 187px !important;
    height: 54px !important;
    aspect-ratio: auto !important;
  }
}

.button-links .item {
  width: 352px;
  height: 102px;
}


/* Block Title */
.block-title {
  height: 36px;
  margin-bottom: 1.25rem;
}

/* 推薦線路標題特殊樣式 */
.recommend-routes-title {
  display: flex;
  align-items: center;
  gap: 15px; /* 增加間距以匹配更大圖標 */
  height: auto;
  margin-bottom: 20px;
}

.recommend-routes-title .crown-icon {
  width: 42px;
  height: 39px;
  object-fit: contain;
  flex-shrink: 0;
}

.recommend-routes-title .title-text {
  display: inline-flex;
  align-items: center;
  width: 203px;
  height: 32px;
  /* background: #fffdda;  暫時註釋，因為文字背景通常指的是 background-clip 或者只是單純色塊，如果 user 是要色塊則開啟 */
  font-size: 32px;
  font-family: "Microsoft YaHei UI", "Microsoft YaHei UI-Bold", sans-serif;
  font-weight: 700;
  text-align: left;
  color: #ffd08c;
  letter-spacing: 6.39px;
  white-space: nowrap;
}

/* 如果 user 真的要背後有個淡黃色塊，可以取消註釋下面這行 */
/* .recommend-routes-title .title-text { background: #fffdda; } */

@media (max-width: 1280px) {
  .block-title {
    height: 30px;
  }

  .recommend-routes-title {
    height: 35px;
  }

  .recommend-routes-title .crown-icon {
    width: 35px;
    height: 35px;
  }

  .recommend-routes-title .title-text {
    font-size: 1.3rem;
  }

  .programme-block .block-title {
    height: 35px;
  }

  .programme-block .block-title img {
    /* 讓它在小一點的螢幕上稍微自適應，或者如果空間足夠就保持 */
    max-width: 100%;
    object-fit: contain;
  }
}

@media (max-width: 480px) {
  .block-title {
    height: 28px;
    margin-bottom: 1rem;
  }

  .recommend-routes-title {
    height: 30px;
  }

  .recommend-routes-title .crown-icon {
    width: 30px;
    height: 30px;
  }

  .recommend-routes-title .title-text {
    font-size: 1.1rem;
  }

  .programme-block .block-title {
    height: 30px;
  }

  .programme-block .block-title img {
    width: 220px !important;
    height: 25px !important;
    object-fit: fill;
  }
}

.block-title img {
  max-height: 100%;
  width: auto;
}

/* 精選短視頻標題特定樣式 */
.programme-block .block-title {
  height: 40px;
  display: flex;
  align-items: center;
}

.programme-block .block-title img {
  width: 330px !important;
  height: 35px !important;
  object-fit: fill;
}

/* Recommend Section Container */
.recommend-section {
  width: 100%;
  max-width: 1525px; /* 修正：925(圖) + 546(路) + 54(邊白) = 1525px */
  margin: 0 auto 3rem auto;
}

/* Top Content Area */
.recommend-content {
  width: 100%;
  height: 410px;
  background: rgba(41, 13, 16, 0.80);
  border-radius: 20px 20px 0px 0px;
  box-sizing: border-box;
  padding: 45px 27px 44px 27px; /* 標註圖鎖定：上45, 下44, 左27 */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between; /* 智慧推開，兩端貼齊 padding */
}

@media (max-width: 1550px) {
  .recommend-content {
    height: auto;
    min-height: 232px;
  }
}

@media (max-width: 820px) {
  .recommend-content {
    max-width: 789px !important;
    padding: 24px 20px !important;
    margin: 0 auto !important;
    border-radius: 12px 12px 0 0 !important;
    height: auto !important;
  }
}

@media (max-width: 768px) {
  .recommend-content {
    flex-direction: column;
    padding: 1.5rem 1rem !important;
  }
}

.recommend-slider {
  width: 100%;
  max-width: 925px;
  height: auto;
  aspect-ratio: 925 / 320;
  flex: 0 1 925px; /* 優先佔據 925px，僅在寬度不足時收縮 */
  min-width: 0;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 3px solid #f8eec9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

@media (max-width: 1024px) {
  .recommend-slider {
    margin-right: 0.9375rem;
    border-radius: 10px;
    border: 2px solid #f8eec9;
  }
}

@media (max-width: 820px) {
  .recommend-slider {
    width: 450px !important;
    height: 183px !important;
    margin-right: 24px !important;
  }
}

@media (max-width: 768px) {
  .recommend-slider {
    margin-bottom: 1.25rem;
    margin-right: 0;
    width: 100%;
    height: auto !important;
    aspect-ratio: 960 / 321;
    border-radius: 8px;
    border: 2px solid #f8eec9;
  }
}

@media (max-width: 430px) {
  .recommend-slider {
    margin-bottom: 1rem;
    aspect-ratio: 450 / 183;
  }
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
  object-fit: cover;
  border-radius: 9px;
}

.recommend-links {
  flex: 0 1 546px; /* 恢復：優先佔據 546px */
  max-width: 546px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 20px; /* 依照標註圖給予足夠間隙 */
}

@media (max-width: 768px) {
  .recommend-links {
    width: 100%;
  }
}

.recommend-links .links {
  display: grid;
  gap: 17px 7px;
  grid-template-columns: repeat(2, 1fr);
}

.recommend-links .links .item {
  width: 100%;
  max-width: 250px;
  height: auto;
  aspect-ratio: 250 / 65;
}

@media (max-width: 820px) {
  .recommend-links .links {
    gap: 13px 7px !important;
  }

  .recommend-links .links .item {
    width: 143px !important;
    height: 37px !important;
  }

  .recommend-routes-title {
    margin-bottom: 12px !important;
    height: auto !important;
    gap: 8px !important;
  }

  .recommend-routes-title .crown-icon {
    width: 30px !important;
    height: 28px !important;
  }

  .recommend-routes-title .title-text {
    width: auto !important;
    height: auto !important;
    font-size: 1.25rem !important;
    letter-spacing: 2px !important;
  }
}

@media (max-width: 768px) {
  .recommend-links .links {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .recommend-links .links .item {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 143 / 37;
  }
}

@media (max-width: 430px) {
  .recommend-links .links {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.625rem;
  }

  .recommend-routes-title {
    margin-bottom: 0.75rem !important;
  }
}





/* Bottom Tools Area (Recommend Footer) */
.recommend-footer {
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch; /* 關鍵：確保所有子元件齊高 */
  height: auto;
  background-color: #0d0d0d;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
}

.recommend-footer .block-title {
  margin-right: 0;
  margin-bottom: 0;
  background-color: #550000;
  padding: 0;
  border-radius: 0 0 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
  flex: 0 0 17.3%;
  min-width: 150px;
}

.recommend-footer .block-title img {
  width: 100%;
  max-width: 180px;
  height: auto;
  max-height: 45px;
  object-fit: contain;
  display: block;
}

.recommend-footer .tools {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 0;
  background-color: transparent;
}

@media (max-width: 1280px) {
  .recommend-footer {
    flex-direction: column;
    height: auto;
    border-radius: 0 0 12px 12px;
  }

  .recommend-footer .block-title {
    flex: 0 0 40px;
    width: 100%;
    min-width: 100%;
    height: 40px;
    border-radius: 0;
    justify-content: flex-start;
    padding: 0;
    background: linear-gradient(90deg, #8b0012 0%, #ba081f 100%);
  }

  .recommend-footer .block-title img {
    width: auto;
    height: 20px;
    max-width: none;
  }

  .recommend-footer .tools {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    height: auto !important;
  }
}

@media (max-width: 1024px) {
  .recommend-footer .tools {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 820px) {
  .recommend-footer {
    width: 100% !important;
    max-width: 789px !important;
    height: auto !important;
    margin: 0 auto !important;
    border-radius: 0 0 12px 12px !important;
  }

  .recommend-footer .tools {
    width: 100% !important;
    height: auto !important;
    grid-template-columns: repeat(3, 1fr) !important;
    padding: 8px 0 !important;
    grid-auto-rows: min-content !important;
  }

  .recommend-footer .tools .item {
    height: auto !important;
    min-height: 60px !important;
    flex: none !important;
  }

  .recommend-footer .tools .item :deep(.img-button) {
    width: 90px !important;
    height: 78px !important;
  }
}

@media (max-width: 430px) {
  .recommend-footer .block-title {
    height: 34px !important;
    flex: 0 0 34px !important;
  }

  .recommend-footer .tools {
    grid-template-columns: repeat(2, 1fr) !important;
    padding: 5px 0 !important;
  }

  .recommend-footer .tools .item {
    min-height: 54px !important;
  }

  .recommend-footer .tools .item :deep(.img-button) {
    width: 80px !important;
    height: 70px !important;
  }
}

.recommend-footer .tools .item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  cursor: pointer;
  transition: background-color 0.3s ease;
  align-self: stretch; /* 確保背景填滿高度 */
}

.recommend-footer .tools .item:hover {
  background-color: #a81c1c;
}

.recommend-footer .tools .item :deep(.img-button) {
  width: 120px !important;
  height: 105px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: none !important;
}

.recommend-footer .tools .item :deep(.img-button):hover {
  filter: none !important;
}

.recommend-footer .tools .item :deep(.img-button img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  display: block !important;
  transition: none !important;
  margin: 0 auto !important;
}

/* 確保最後一個圓角正確 */
.recommend-footer .tools .item:last-child {
  border-radius: 0 0 20px 0;
}



/* Programme Section */
.programme-wrap {
  width: 100%;
  max-width: 1501px;
  margin: 0 auto;
  display: flex;
  gap: 30px;
}

.programme-block {
  flex: 1;
  min-width: 0;
}

@media (max-width: 1280px) {
  .programme-wrap {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .programme-wrap {
    flex-direction: column;
    gap: 2rem;
  }
}

@media (max-width: 1600px) {
  .programme-wrap {
    width: 100%;
    padding: 0 27px;
    box-sizing: border-box;
  }
}

/* Programme Block Title Styles */
.programme-block .block-title {
  height: 70px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
}

.programme-block .block-title :deep(img) {
  width: 427px !important;
  height: 70px !important;
  object-fit: contain;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 20px 15px;
}

@media (max-width: 1501px) {
  .programme-wrap .list {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px 10px;
  }
}

@media (max-width: 430px) {
  .programme-wrap .list {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px 10px;
  }
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
    grid-template-columns: repeat(2, 1fr);
    /* 極窄螢幕強制 2 欄 */
  }
}

.programme-wrap .list .item {
  width: 220px;
  margin: 0 auto;
  cursor: pointer;
  box-sizing: border-box;
}

.programme-wrap .list .item a {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-decoration: none;
  box-sizing: border-box;
}

.programme-wrap .list .item .img {
  width: 100%;
  aspect-ratio: 236 / 133;
  overflow: hidden;
  border-radius: 8px;
  background-color: #1a1a1a;
  border: 1px solid rgba(223, 176, 130, 0.2);
}

.programme-wrap .list .item .img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.programme-wrap .list .item span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 43px;
  background: linear-gradient(to right, #4d176f, #671dbb);
  border-radius: 0 0 10px 10px;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  margin: 0 !important;
  padding: 0;
  box-sizing: border-box;
}

/* Sport Block Specific Styles (Green) */
.programme-wrap .programme-block.sport-block .list .item span {
  background: linear-gradient(to right, #114b1f, #2c8a3c);
}



.programme-wrap .list .item .img img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  /* 強制填滿，可能變形 */
  transition: transform 0.3s ease;
}

.programme-wrap .list .item:hover .img img {
  transform: scale(1.1);
}

/* 空資料的處理 */
.programme-wrap .list .item.empty-item {
  opacity: 0.3;
  /* 半透明顯示空位置 */
}

.programme-wrap .list .item .empty-placeholder {
  width: 100%;
  max-width: 187px;
  aspect-ratio: 187 / 105;
  border: 3px dashed rgba(248, 238, 201, 0.6);
  border-radius: 10px;
  margin-bottom: 0.5rem;
  background-color: transparent;
}

/* 整個區塊為空時的佔位區域 */
.empty-section-placeholder {
  width: 100%;
  max-width: 612px;
  aspect-ratio: 612 / 353;
  border: 3px dashed rgba(248, 238, 201, 0.6);
  border-radius: 10px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(248, 238, 201, 0.6);
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



/* Float Ad */
#float-ad {
  bottom: 1rem;
  max-width: 120px; /* 依照要求調整為 120px */
  min-width: 75px;
  position: fixed;
  right: 2.5rem;
  width: auto; /* 從百分比改為 auto 以便受 max-width 控制 */
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
    z-index: 1001;
    /* 提高 z-index 確保可點擊 */
    border: none;
    width: 100%;
    outline: none;
    -webkit-tap-highlight-color: transparent;
    /* 移除 iOS 點擊高亮 */
    touch-action: manipulation;
    /* 優化觸控體驗 */
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
    user-select: none;
    /* 防止文字選取 */
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

#float-ad .links .item {
  width: 100%;
  max-width: 120px;
  height: auto;
  aspect-ratio: 120 / 105;
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
