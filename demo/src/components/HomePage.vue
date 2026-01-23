<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ImageComponent from './ImageComponent.vue'
import ImageButton from './ImageButton.vue'
import { assetManifest } from '../config/assetManifest'
import {
  recommendedRoutes,
  siteConfig,
  titles
} from '../config/siteConfig'
import { useSiteData } from '../composables/useSiteData'

// State for Carousel
const currentSlide = ref(0)
let carouselInterval: number | null = null

// State for Float Ad
const isFloatAdCollapsed = ref(false)

// Use Composable
const {
  effectiveCarouselSlides,
  effectiveBanner,
  effectiveBackgroundImage,
  effectiveVideoThumbnails,
  effectiveProgramThumbnails,
  effectiveButtonLinks,
  effectiveToolIcons,
  effectiveFloatAdButtons,
  effectiveRouteLinks,
  loadConfig
} = useSiteData()

// Carousel Logic
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

// Lifecycle Hooks
onMounted(async () => {
  await loadConfig()
  startCarousel()
})

onUnmounted(() => {
  stopCarousel()
})

// UI Interaction
const toggleFloatAd = (event?: Event) => {
  // 防止事件冒泡
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  isFloatAdCollapsed.value = !isFloatAdCollapsed.value
}
</script>

<template>
  <div class="main-inner">
    <!-- Banner -->
    <div id="banner" :class="{ 'banner-empty': !effectiveBanner }">
      <ImageComponent v-if="effectiveBanner" :src="effectiveBanner" alt="Banner" :lazy="false" />
      <div v-else class="banner-placeholder-visual">
        <span class="placeholder-text">Banner Area</span>
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
            <template v-if="effectiveButtonLinks[index]?.defaultImage">
              <ImageButton :default-src="effectiveButtonLinks[index]?.defaultImage || item.default"
                :hover-src="effectiveButtonLinks[index]?.hoverImage || item.hover" :alt="item.alt"
                :href="effectiveButtonLinks[index]?.href" :target="effectiveButtonLinks[index]?.target" :lazy="false" />
            </template>
            <div v-else class="button-link-placeholder">
              <span>連結 {{ index + 1 }}</span>
            </div>
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
                <ImageComponent
                  :src="(siteConfig.useApi && titles.recommendedRoutes) ? titles.recommendedRoutes : assetManifest.titles.recommendedRoutes"
                  alt="皇冠圖標" class="crown-icon" />
                <span class="title-text">推荐优质线路</span>
              </div>
              <div class="links">
                <div v-for="(item, index) in effectiveRouteLinks" :key="index" class="item">
                  <ImageButton :default-src="item.default" :hover-src="item.hover"
                    :alt="recommendedRoutes[index]?.title" :href="item.href" :lazy="false" />
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Tools (Browsers) -->
          <div class="recommend-footer">
            <div class="block-title">
              <ImageComponent
                :src="(siteConfig.useApi && titles.recommendedBrowsers) ? titles.recommendedBrowsers : assetManifest.titles.recommendedBrowsers"
                alt="推荐浏览器标题" :lazy="false" />
            </div>
            <div class="tools">
              <div v-for="tool in effectiveToolIcons" :key="tool.id" class="item">
                <ImageButton :default-src="tool.default" :hover-src="tool.hover" :alt="tool.alt" :href="tool.href" />
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
                :src="(siteConfig.useApi && titles.selectedVideos) ? titles.selectedVideos : assetManifest.titles.selectedVideos"
                alt="精选短视频標題圖" :lazy="false" />
            </div>
            <div class="list">
              <div v-for="(video, index) in effectiveVideoThumbnails" :key="`video-${index}`" class="item">
                <template v-if="video && video.image">
                  <a :href="video.href" target="_blank" rel="noopener noreferrer">
                    <div class="img">
                      <ImageComponent :src="video.image" :alt="video.alt" />
                    </div>
                    <span>{{ video.title }}</span>
                  </a>
                </template>
                <!-- 保持 Grid 佔位，顯示骨架框 -->
                <div v-else class="empty-placeholder-box"></div>
              </div>
            </div>
          </div>

          <!-- Hot Programs -->
          <div class="programme-block sport-block">
            <div class="block-title">
              <ImageComponent
                :src="(siteConfig.useApi && titles.hotPrograms) ? titles.hotPrograms : assetManifest.titles.hotPrograms"
                alt="火熱節目標題圖" :lazy="false" />
            </div>
            <div class="list">
              <div v-for="(program, index) in effectiveProgramThumbnails" :key="`program-${index}`" class="item">
                <template v-if="program && program.image">
                  <a :href="program.href" target="_blank" rel="noopener noreferrer">
                    <div class="img">
                      <ImageComponent :src="program.image" :alt="program.alt" />
                    </div>
                    <span>{{ program.title }}</span>
                  </a>
                </template>
                <!-- 保持 Grid 佔位，顯示骨架框 -->
                <div v-else class="empty-placeholder-box"></div>
              </div>
            </div>
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
        <div v-for="(button, index) in effectiveFloatAdButtons" :key="button.id" class="item" :class="{
          'rwd-first-button': index === 0,
          'rwd-second-button': index === 1,
          'rwd-third-button': index === 2
        }">
          <!-- 桌面版圖片 -->
          <ImageButton class="desktop-image" :default-src="button.default" :hover-src="button.hover"
            :alt="`浮動廣告 ${index + 1}`" :href="button.href" />
          <!-- 平板版圖片 -->
          <ImageButton v-if="index === 0" class="tablet-image" default-src="/images/rwd/gm.webp"
            hover-src="/images/rwd/gm.webp" alt="浮動廣告 1" :href="button.href" />
          <ImageButton v-if="index === 1" class="tablet-image" default-src="/images/rwd/diuying.webp"
            hover-src="/images/rwd/diuying.webp" alt="浮動廣告 2" :href="button.href" />
          <ImageButton v-if="index === 2" class="tablet-image" default-src="/images/rwd/fun.webp"
            hover-src="/images/rwd/fun.webp" alt="浮動廣告 3" :href="button.href" />
          <!-- 手機版圖片 -->
          <ImageButton v-if="index === 0" class="mobile-image" default-src="/images/rwd/mobile-gm.webp"
            hover-src="/images/rwd/mobile-gm.webp" alt="浮動廣告 1" :href="button.href" />
          <ImageButton v-if="index === 1" class="mobile-image" default-src="/images/rwd/mobile-diuying.webp"
            hover-src="/images/rwd/mobile-diuying.webp" alt="浮動廣告 2" :href="button.href" />
          <ImageButton v-if="index === 2" class="mobile-image" default-src="/images/rwd/mobile-fun.webp"
            hover-src="/images/rwd/mobile-fun.webp" alt="浮動廣告 3" :href="button.href" />
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
  object-fit: cover;
}

@media (max-width: 1279px) {
  #banner {
    width: 100%;
    /* RWD: Allow height to adapt to image */
    height: auto;
    min-height: 100px;
    /* Prevent collapse if image missing */
    background: #8b0012;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #banner :deep(img),
  #banner :deep(picture) {
    width: 100% !important;
    height: auto !important;
    object-fit: contain !important;
    /* contain or cover? If height is auto, cover and contain are similar but cover is safer for width fill */
    display: block !important;
    max-height: 600px;
    /* Optional cap */
  }
}

@media (max-width: 430px) {
  #banner {
    width: 100%;
    max-width: 430px;
    height: auto !important;
  }

  #banner :deep(img),
  #banner :deep(picture) {
    object-fit: contain !important;
    height: auto !important;
    width: 100% !important;
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

.main-inner {
  width: 100%;
  overflow-x: hidden;
  position: relative;
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
    border-bottom: none !important;
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

@media (max-width: 430px) {
  #home-main {
    border-top: 2px solid #dfb082;
    border-bottom: none !important;
    padding: 1.5rem 0.625rem;
    padding-bottom: 3rem;
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

@media (max-width: 1279px) {
  .button-links {
    width: 100% !important;
    max-width: 1200px !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 10px !important;
    padding: 0 !important;
    margin: 0 auto 3rem auto !important;
    justify-content: center !important;
  }

  /* 過渡期處理：調降斷點，確保平板 (如 820px) 維持橫排，直到 640px 以下才切換為 2x2 */
  @media (max-width: 640px) {
    .button-links {
      grid-template-columns: repeat(2, 1fr) !important;
      max-width: 430px !important;
    }
  }

  .button-links .item {
    width: 100% !important;
    max-width: none;
    /* 移除平板下的最大寬度限制，讓按鈕跟隨 Grid 縮放 */
    height: auto !important;
    aspect-ratio: 187 / 54;
  }
}

@media (max-width: 430px) {
  .button-links {
    grid-template-columns: repeat(2, 185px) !important;
    gap: 15px 10px !important;
    padding: 0 10px !important;
    max-width: 100% !important;
    margin-bottom: 1.5rem !important;
    justify-content: center !important;
  }

  .button-links .item {
    width: 185px !important;
    height: 50px !important;
    max-width: none !important;
    aspect-ratio: auto !important;
  }

  .button-links .item :deep(img) {
    width: 185px !important;
    height: 50px !important;
    object-fit: fill !important;
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
  gap: 15px;
  /* 增加間距以匹配更大圖標 */
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

@media (max-width: 430px) {
  .block-title {
    height: 28px;
    margin-bottom: 1rem;
  }

  .recommend-routes-title {
    height: 30px;
    margin-bottom: 0.75rem !important;
  }

  .recommend-routes-title .crown-icon {
    width: 28px !important;
    height: 28px !important;
  }

  .recommend-routes-title .title-text {
    font-size: 1.1rem !important;
    letter-spacing: 1px !important;
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

@media (max-width: 1279px) {
  .programme-block .block-title {
    width: 270px !important;
    height: 45px !important;
    margin-bottom: 1rem !important;
  }

  .programme-block .block-title img {
    width: 100% !important;
    height: 100% !important;
    object-fit: fill !important;
  }
}

/* Recommend Section Container */
.recommend-section {
  width: 100%;
  max-width: 1525px;
  /* 修正：925(圖) + 546(路) + 54(邊白) = 1525px */
  margin: 0 auto 3rem auto;
}

/* Top Content Area */
.recommend-content {
  width: 100%;
  /* height: 410px; Removed fixed height for tighter fit */
  height: auto;
  background: rgba(41, 13, 16, 0.40);
  /* 經用戶調整：顏色調淡 (0.8 -> 0.4) */
  border-radius: 20px 20px 0px 0px;
  box-sizing: border-box;
  padding: 25px 27px;
  /* 經用戶調整：縮減上下間距 */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  /* 智慧推開，兩端貼齊 padding */
}

@media (max-width: 1550px) {
  .recommend-content {
    height: auto;
    min-height: 232px;
  }
}

@media (min-width: 740px) and (max-width: 1279px) {
  #home-main {
    padding: 3rem 1rem !important;
    /* 減少左右 padding，確保 785px 內容可以容納 */
  }

  .home-main__inner {
    max-width: 100% !important;
    /* 移除寬度限制，讓內部元素可以自由設定寬度 */
  }

  .recommend-content {
    width: 100% !important;
    max-width: 1200px !important;
    height: auto !important;
    padding: 15px 15px !important;
    margin: 0 auto !important;
    border-radius: 12px 12px 0 0 !important;
  }
}

@media (max-width: 739px) {
  .recommend-content {
    flex-direction: column;
    padding: 15px 15px !important;
  }
}

.recommend-slider {
  width: 100%;
  max-width: 925px;
  height: auto;
  aspect-ratio: 925 / 320;
  flex: 0 1 925px;
  /* 優先佔據 925px，僅在寬度不足時收縮 */
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

@media (max-width: 1279px) {
  .recommend-slider {
    width: 55% !important;
    max-width: none !important;
    height: auto !important;
    aspect-ratio: 432 / 183 !important;
    margin-right: 20px !important;
    margin-bottom: 0 !important;
    flex: 0 0 55% !important;
  }
}

@media (max-width: 739px) {
  .recommend-slider {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    aspect-ratio: 432 / 183 !important;
    margin-right: 0 !important;
    margin-bottom: 20px !important;
  }
}

@media (max-width: 430px) {
  .recommend-content {
    flex-direction: column !important;
    padding: 10px !important;
    gap: 15px !important;
  }

  .recommend-slider {
    width: 100% !important;
    max-width: 376px !important;
    height: auto !important;
    aspect-ratio: 376 / 153 !important;
    margin: 0 auto 20px auto !important;
  }

  .carousel-slide img {
    object-fit: fill !important;
    height: 100% !important;
  }

  .recommend-links {
    width: 100% !important;
    max-width: none !important;
    margin-left: 0 !important;
    /* 已在 768px 處理 flex: none */
  }

  .recommend-links .links {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
    width: 100% !important;
  }

  .recommend-links .links .item {
    width: 166px !important;
    height: 43px !important;
    max-width: none !important;
    aspect-ratio: auto !important;
  }

  .recommend-links .links .item :deep(img) {
    width: 166px !important;
    height: 43px !important;
    object-fit: fill !important;
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
  flex: 0 1 546px;
  /* 恢復：優先佔據 546px */
  max-width: 546px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 20px;
  /* 依照標註圖給予足夠間隙 */
}

@media (max-width: 739px) {
  .recommend-links {
    width: 100% !important;
    margin-left: 0 !important;
    flex: none !important;
    /* 在 iPad Mini 等垂直狀態下解鎖高度 */
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

@media (max-width: 1279px) {
  .recommend-links {
    max-width: none !important;
    /* 解鎖容器寬度 */
    flex: 1 !important;
    min-width: 0 !important;
    /* 關鍵：允許 flex item 壓縮，防止撐開 */
  }

  .recommend-links .links {
    gap: 13px 7px !important;
  }

  .recommend-links .links .item {
    width: 100% !important;
    /* 改為流體寬度 */
    max-width: none !important;
    /* 移除最大寬度限制 */
    height: auto !important;
    aspect-ratio: 143 / 37 !important;
  }

  .recommend-links .links .item img {
    width: 100% !important;
    height: auto !important;
    object-fit: contain !important;
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

@media (max-width: 739px) {
  .recommend-links .links {
    grid-template-columns: repeat(2, 1fr);
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
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px 8px !important;
    justify-content: center !important;
    width: 100% !important;
  }

  .recommend-routes-title {
    margin-bottom: 0.75rem !important;
    justify-content: flex-start !important;
    /* 改為左靠 */
    width: 100% !important;
    gap: 10px !important;
  }

  .recommend-routes-title .crown-icon {
    width: 24px !important;
    height: 24px !important;
  }

  .recommend-routes-title .title-text {
    /* 移除固定寬高與實心背景，避免產生色塊與裁切 */
    width: auto !important;
    height: auto !important;
    background: transparent !important;

    /* 使用您提供的顏色進行文字渲染 */
    font-size: 21px !important;
    font-family: "Microsoft YaHei UI", "Microsoft YaHei UI-Bold", sans-serif !important;
    font-weight: 700 !important;
    text-align: left !important;

    /* 將背景色與文字色結合成漸層文字，這通常是設計稿的本意 */
    background: linear-gradient(180deg, #fffdda 0%, #ffd08c 100%) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;

    letter-spacing: 4.17px !important;
    display: flex !important;
    align-items: center !important;
    white-space: nowrap !important;
  }
}





/* Bottom Tools Area (Recommend Footer) */
.recommend-footer {
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  /* 關鍵：確保所有子元件齊高 */
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



@media (max-width: 1279px) {
  .recommend-footer {
    width: 100% !important;
    max-width: 1200px !important;
    height: auto !important;
    margin: 0 auto 2rem auto !important;
    border-radius: 0 0 20px 20px !important;
    /* 修正：回歸與 PC 一致的大圓角 */
    flex-direction: column !important;
    background: #0d0d0d !important;
    /* 修正：回歸與 PC 一致的深黑色 */
    overflow: hidden !important;
  }

  .recommend-footer .block-title {
    width: 100% !important;
    height: 48px !important;
    flex: 0 0 48px !important;
    justify-content: flex-start !important;
    padding: 0 15px !important;
    background: #550000 !important;
    /* 平板下標題欄維持深紅 */
    border-radius: 0 !important;
  }

  .recommend-footer .block-title img {
    width: auto !important;
    height: 26px !important;
  }

  .recommend-footer .tools {
    width: 100% !important;
    height: auto !important;
    display: grid !important;
    grid-template-columns: repeat(6, 1fr) !important;
    padding: 0 !important;
    background-color: transparent !important;
  }

  .recommend-footer .tools .item {
    height: 65px !important;
    min-height: 0 !important;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .recommend-footer .tools .item:nth-child(6n) {
    border-right: none !important;
  }

  /* 手機版：改為 3 欄 (iPad Mini 744px 應為平板 6 欄) */
  @media (max-width: 739px) {
    .recommend-footer .tools {
      grid-template-columns: repeat(3, 1fr) !important;
    }

    .recommend-footer .tools .item:nth-child(3n) {
      border-right: none !important;
    }
  }

  @media (max-width: 480px) {
    .recommend-footer .tools {
      grid-template-columns: repeat(3, 1fr) !important;
      padding: 0 !important;
    }
  }

  .recommend-footer .tools .item :deep(.img-button) {
    width: 100% !important;
    max-width: 90px !important;
    height: 50px !important;
  }
}

@media (max-width: 480px) {
  .recommend-footer .block-title {
    height: 48px !important;
    flex: 0 0 48px !important;
  }

  .recommend-footer .tools .item {
    height: 65px !important;
    min-height: 65px !important;
  }

  .recommend-footer .tools .item :deep(.img-button) {
    width: 90px !important;
    height: 55px !important;
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
  align-self: stretch;
  /* 確保背景填滿高度 */
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

@media (max-width: 1279px) {
  .programme-wrap {
    width: 100%;
    padding: 0 15px;
    /* 統一手機與平板內距 */
    box-sizing: border-box;
  }
}

/* --- 清理重複開發區塊 --- */

/* Programme Block Title Styles */
.programme-block .block-title {
  height: 70px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
}

@media (max-width: 1500px) and (min-width: 1280px) {
  .programme-wrap {
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 3rem 2rem !important;
  }

  .programme-block {
    flex: 1 1 420px !important;
    max-width: 100% !important;
  }
}

@media (max-width: 1279px) {
  .programme-wrap {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 20px !important;
    padding: 0 !important;
    justify-content: center !important;
    width: 100% !important;
    max-width: 1200px !important;
    margin: 0 auto !important;
  }

  .programme-block .block-title {
    width: 270px !important;
    height: 45px !important;
    margin-bottom: 1.5rem !important;
  }

  .programme-block .block-title :deep(img) {
    width: 100% !important;
    height: 100% !important;
  }
}

.programme-block .block-title :deep(img) {
  width: 427px !important;
  height: 70px !important;
  object-fit: contain;
}

@media (max-width: 739px) {
  .programme-wrap {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    /* Ensure centered content */
    gap: 30px !important;
    padding: 0 15px !important;
    width: 100% !important;
  }

  .programme-block {
    max-width: 100% !important;
    width: 100% !important;
  }
}

.programme-wrap .list {
  display: grid;
  gap: 20px 15px;
}

@media (min-width: 1501px) {
  .programme-wrap .list {
    grid-template-columns: repeat(3, 1fr) !important;
    /* PC 版鎖定 3 欄 */
  }
}

@media (max-width: 1500px) and (min-width: 1280px) {
  .programme-wrap .list {
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)) !important;
    gap: 15px 10px;
  }
}

@media (max-width: 739px) {
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

@media (max-width: 739px) {
  .programme-wrap .list .item {
    width: 100% !important;
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
  border-radius: 8px 8px 0 0;
  background-color: #1a1a1a;
  border: 1px solid rgba(223, 176, 130, 0.2);
  border-bottom: none;
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
  /* PC 版置中 */
  width: 100%;
  height: 43px;
  background: linear-gradient(to right, #4d176f, #671dbb);
  border-radius: 0 0 8px 8px;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  margin: 0 !important;
  padding: 0;
  box-sizing: border-box;
  border: 1px solid rgba(223, 176, 130, 0.2);
  border-top: none;
}

@media (max-width: 1279px) {
  .programme-wrap .list {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 14px 14px !important;
    width: 100% !important;
    max-width: none !important;
    /* 解鎖列表寬度 */
    margin: 0 auto;
  }

  .programme-wrap .list .item {
    width: 100% !important;
    max-width: none !important;
    /* 解鎖項目寬度 */
    margin: 0 auto;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    border-radius: 10px !important;
  }

  .programme-wrap .list .item .img {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 173 / 94 !important;
    border-radius: 10px 10px 0 0 !important;
  }

  .programme-wrap .list .item span {
    width: 100% !important;
    height: 34px !important;
    font-size: 0.85rem !important;
    border-radius: 0 0 10px 10px !important;
    margin: 0 !important;
  }
}

@media (max-width: 480px) {
  .programme-wrap .list {
    max-width: 100% !important;
    gap: 10px 8px !important;
  }

  .programme-wrap .list .item {
    max-width: none !important;
  }
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

@media (max-width: 1280px) {
  .programme-wrap .list .item span {
    font-size: 1em;
  }
}



/* Empty State Placeholders */
.banner-empty {
  width: 100%;
  height: 400px;
  /* Default PC height */
  background-color: #1a1a1a;
  border-bottom: 4px solid #dfb082;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1279px) {
  .banner-empty {
    height: 300px;
  }
}

@media (max-width: 430px) {
  .banner-empty {
    height: 180px;
  }
}

.banner-placeholder-visual {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image:
    linear-gradient(45deg, #222 25%, transparent 25%),
    linear-gradient(-45deg, #222 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #222 75%),
    linear-gradient(-45deg, transparent 75%, #222 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  opacity: 0.3;
}

.placeholder-text {
  color: #dfb082;
  font-size: 1.5rem;
  font-weight: bold;
  opacity: 0.5;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px dashed #dfb082;
}

.button-link-placeholder {
  width: 352px;
  height: 102px;
  border: 2px dashed rgba(223, 176, 130, 0.3);
  border-radius: 50px;
  /* Match button curvature */
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(223, 176, 130, 0.4);
  font-size: 1.2rem;
  background: rgba(0, 0, 0, 0.2);
}

@media (max-width: 1600px) {
  .button-link-placeholder {
    width: 100%;
    aspect-ratio: 352/102;
    height: auto;
  }
}

@media (max-width: 430px) {
  .button-link-placeholder {
    width: 185px;
    height: 50px;
    font-size: 0.9rem;
  }
}

.empty-placeholder-box {
  width: 100%;
  aspect-ratio: 236 / 133;
  border: 2px dashed rgba(223, 176, 130, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  overflow: hidden;
}

/* Skeleton Shine Effect */
.empty-placeholder-box::after,
.button-link-placeholder::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0) 100%);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

/* Float Ad */
#float-ad {
  bottom: 1rem;
  max-width: 120px;
  /* 依照要求調整為 120px */
  min-width: 75px;
  position: fixed;
  right: 2.5rem;
  width: auto;
  /* 從百分比改為 auto 以便受 max-width 控制 */
  z-index: 99;
  transition: all 0.3s ease;
}

@media (max-width: 1440px) and (min-width: 1280px) {
  #float-ad {
    max-width: 75px;
    right: 1rem;
  }
}

@media (max-width: 1279px) {
  #float-ad {
    position: relative !important;
    bottom: 0 !important;
    right: auto !important;
    left: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 10px 0 !important;
    background: #3e080f !important;
  }
}

@media (min-width: 740px) and (max-width: 1279px) {
  #float-ad {
    width: 100% !important;
    max-width: 100% !important;
    height: 95px !important;
    margin: 0 auto !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
  }
}


@media (max-width: 1279px) {
  .float-ad-toggle {
    display: none !important;
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

/* 桌面版：顯示桌面圖片，隱藏所有 RWD 圖片 */
#float-ad .links .item.rwd-first-button .desktop-image,
#float-ad .links .item.rwd-second-button .desktop-image,
#float-ad .links .item.rwd-third-button .desktop-image {
  display: block;
}

#float-ad .links .item.rwd-first-button .tablet-image,
#float-ad .links .item.rwd-second-button .tablet-image,
#float-ad .links .item.rwd-third-button .tablet-image,
#float-ad .links .item.rwd-first-button .mobile-image,
#float-ad .links .item.rwd-second-button .mobile-image,
#float-ad .links .item.rwd-third-button .mobile-image {
  display: none;
}

@media (max-width: 1440px) and (min-width: 1280px) {
  #float-ad .links {
    gap: 0.875rem;
  }
}

@media (max-width: 1279px) {
  #float-ad .links {
    display: flex !important;
    /* 強制在 1279px 以下顯示，無視 Vue 的 v-show */
    flex-direction: row !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 80px !important;
    /* 增加間距讓按鈕更分散 */
    width: 100% !important;
    padding: 0 10px !important;
    box-sizing: border-box !important;
  }

  #float-ad .links .item {
    width: 151px !important;
    height: 58px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex: none !important;
    /* 改為 flex: none，確保固定寬度 */
  }

  #float-ad .links .item :deep(img) {
    width: 151px !important;
    height: 58px !important;
    max-width: 151px !important;
    object-fit: fill !important;
    /* 使用 fill 確保圖片完全填滿容器 */
  }

  /* 平板版：隱藏桌面和手機圖片，顯示平板圖片 */
  #float-ad .links .item.rwd-first-button .desktop-image,
  #float-ad .links .item.rwd-second-button .desktop-image,
  #float-ad .links .item.rwd-third-button .desktop-image,
  #float-ad .links .item.rwd-first-button .mobile-image,
  #float-ad .links .item.rwd-second-button .mobile-image,
  #float-ad .links .item.rwd-third-button .mobile-image {
    display: none !important;
  }

  #float-ad .links .item.rwd-first-button .tablet-image,
  #float-ad .links .item.rwd-second-button .tablet-image,
  #float-ad .links .item.rwd-third-button .tablet-image {
    display: block !important;
  }
}

@media (max-width: 739px) {

  /* 手機版：隱藏桌面和平板圖片，顯示手機圖片 */
  #float-ad .links .item.rwd-first-button .desktop-image,
  #float-ad .links .item.rwd-second-button .desktop-image,
  #float-ad .links .item.rwd-third-button .desktop-image,
  #float-ad .links .item.rwd-first-button .tablet-image,
  #float-ad .links .item.rwd-second-button .tablet-image,
  #float-ad .links .item.rwd-third-button .tablet-image {
    display: none !important;
  }

  #float-ad .links .item.rwd-first-button .mobile-image,
  #float-ad .links .item.rwd-second-button .mobile-image,
  #float-ad .links .item.rwd-third-button .mobile-image {
    display: block !important;
  }
}

@media (max-width: 480px) {
  #float-ad {
    position: relative !important;
    margin: 0 !important;
    /* 與平板一致 */
    /* 繼承平板背景，不需特別屬性覆蓋則背景會維持 */
  }

  #float-ad .links {
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    gap: 12px !important;
    /* 縮減間距更細緻 */
    padding: 0 5px !important;
  }

  #float-ad .links .item {
    width: 31% !important;
    height: 48px !important;
    /* 鎖死高度與圖片一致 */
    aspect-ratio: auto !important;
    /* 移除強制比例，讓高度驅動 */
    flex: none !important;
  }

  #float-ad .links .item :deep(img) {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }
}
</style>
