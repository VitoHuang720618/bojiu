<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import ImageComponent from './ImageComponent.vue'
import ImageButton from './ImageButton.vue'
import { assetManifest } from '../config/assetManifest'
import {
  recommendedRoutes
} from '../config/siteConfig'
import { useSiteData } from '../composables/useSiteData'

// State for Carousel
const currentSlide = ref(0)
let carouselInterval: number | null = null



// Use Composable
const {
  effectiveCarouselSlides,
  effectiveBanner,
  effectiveBackgroundImage,
  effectiveRecommendContentBackground,
  effectiveRecommendContentCss,
  effectiveTitles,
  effectiveVideoThumbnails,
  effectiveProgramThumbnails,
  effectiveButtonLinks,
  effectiveToolIcons,
  effectiveFloatAdButtons,
  effectiveRouteLinks,
  effectivePageLayout,
  effectiveProgrammeLayout,
  loadConfig
} = useSiteData()

// Carousel Logic
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % effectiveCarouselSlides.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + effectiveCarouselSlides.value.length) % effectiveCarouselSlides.value.length
}

// Touch Handling
const touchStartX = ref(0)
const touchEndX = ref(0)

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].screenX
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  if (touchEndX.value < touchStartX.value - 50) {
    nextSlide() // Swipe Left -> Next
  }
  if (touchEndX.value > touchStartX.value + 50) {
    prevSlide() // Swipe Right -> Prev
  }
}

const startCarousel = () => {
  // Clear any existing interval first to prevent duplicates
  stopCarousel()
  carouselInterval = window.setInterval(nextSlide, 3000)
}

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

// Handle dynamic CSS injection for recommend section
const dynamicStyleTag = ref<HTMLStyleElement | null>(null)

const updateRecommendDynamicStyle = (css: string) => {
  if (!css) {
    if (dynamicStyleTag.value) {
      dynamicStyleTag.value.innerHTML = ''
    }
    return
  }

  if (!dynamicStyleTag.value) {
    dynamicStyleTag.value = document.createElement('style')
    dynamicStyleTag.value.setAttribute('data-dynamic-recommend', '')
    document.head.appendChild(dynamicStyleTag.value)
  }
  dynamicStyleTag.value.innerHTML = css
}

// Lifecycle Hooks
onMounted(async () => {
  await loadConfig()
  startCarousel()
  if (effectiveRecommendContentCss.value) {
    updateRecommendDynamicStyle(effectiveRecommendContentCss.value)
  }
})

watch(() => effectiveRecommendContentCss.value, (newCss) => {
  updateRecommendDynamicStyle(newCss || '')
})

onUnmounted(() => {
  stopCarousel()
  if (dynamicStyleTag.value) {
    document.head.removeChild(dynamicStyleTag.value)
    dynamicStyleTag.value = null
  }
})

// UI Interaction
// Scroll to Top Logic
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
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
      backgroundSize: effectiveBackgroundImage ? 'auto' : '16px 16px, 32px 32px, 100% 60px, 100% 60px',
      backgroundPosition: effectiveBackgroundImage ? 'top left' : '0 0, 8px 8px, top, bottom',
      backgroundRepeat: effectiveBackgroundImage ? 'repeat' : 'repeat, repeat, repeat-x, repeat-x'
    }">
      <div class="home-main__inner">
        <!-- Top Button Links -->
        <div class="button-links">
          <div v-for="(item, index) in assetManifest.buttonLinks" :key="item.id" class="item">
            <template v-if="effectiveButtonLinks[index]?.defaultImage !== undefined">
              <ImageButton :default-src="effectiveButtonLinks[index]?.defaultImage || ''"
                :hover-src="effectiveButtonLinks[index]?.hoverImage || ''" :alt="item.alt"
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
          <div class="recommend-content" :style="{ background: effectiveRecommendContentBackground }">
            <!-- Carousel Slider -->
            <div class="recommend-slider" @mouseenter="stopCarousel" @mouseleave="startCarousel"
              @touchstart="handleTouchStart" @touchend="handleTouchEnd">
              <div v-for="(slide, index) in effectiveCarouselSlides" :key="slide.id" class="carousel-slide"
                :class="{ active: currentSlide === index }">
                <a :href="slide.href" target="_blank" rel="noopener noreferrer">
                  <ImageComponent :src="slide.image" :alt="slide.alt" />
                </a>
              </div>

              <!-- Navigation Buttons -->
              <button class="nav-btn prev" @click.stop="prevSlide" aria-label="Previous Slide">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </button>
              <button class="nav-btn next" @click.stop="nextSlide" aria-label="Next Slide">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="white" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <!-- Recommended Routes -->
            <div class="recommend-links">
              <div class="block-title recommend-routes-title">
                <ImageComponent
                  :src="effectiveTitles.recommendedRoutes"
                  alt="皇冠圖標" class="crown-icon" />
                <span class="title-text">推荐优质线路</span>
              </div>
              <div class="links">
                <div v-for="(item, index) in effectiveRouteLinks" :key="index" class="item">
                  <ImageButton :default-src="item.default" :hover-src="item.hover"
                    :alt="recommendedRoutes[index]?.title" :href="item.href" :lazy="false" target="_blank" />
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Tools (Browsers) -->
          <div class="recommend-footer">
            <div class="block-title">
              <ImageComponent
                :src="effectiveTitles.recommendedBrowsers"
                alt="推荐浏览器标题" :lazy="false" />
            </div>
            <div class="tools">
              <div v-for="tool in effectiveToolIcons" :key="tool.id" class="item">
                <ImageButton :default-src="tool.default" :hover-src="tool.hover" :alt="tool.alt" :href="tool.href"
                  target="_blank" />
              </div>
            </div>
          </div>
        </div>

        <!-- Programme Sections -->
        <div class="programme-wrap">
          <template v-for="blockId in effectiveProgrammeLayout" :key="blockId">
            <!-- Selected Videos (娛樂直播/精選短視頻) -->
            <div v-if="blockId === 'selectedVideos'" class="programme-block">
              <div class="block-title">
                <ImageComponent :src="effectiveTitles.selectedVideos" alt="精选短视频標題圖" :lazy="false" />
              </div>
              <div class="list">
                <div v-for="(video, index) in effectiveVideoThumbnails" :key="`video-${index}`" class="item">
                  <a :href="video?.href || '#'" target="_blank" rel="noopener noreferrer">
                    <div class="img">
                      <ImageComponent :src="video?.image || ''" :alt="video?.alt || ''" />
                    </div>
                    <span>{{ video?.title || '&nbsp;' }}</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Hot Programs (賽事精選/火熱預告) -->
            <div v-else-if="blockId === 'hotPrograms'" class="programme-block sport-block">
              <div class="block-title">
                <ImageComponent :src="effectiveTitles.hotPrograms" alt="火熱節目標題圖" :lazy="false" />
              </div>
              <div class="list">
                <div v-for="(program, index) in effectiveProgramThumbnails" :key="`program-${index}`" class="item">
                  <a :href="program?.href || '#'" target="_blank" rel="noopener noreferrer">
                    <div class="img">
                      <ImageComponent :src="program?.image || ''" :alt="program?.alt || ''" />
                    </div>
                    <span>{{ program?.title || '&nbsp;' }}</span>
                  </a>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Float Ad Buttons -->
    <div id="float-ad">
      <!-- 收合/展開按鈕 -->


      <div class="links">
        <div v-for="(button, index) in effectiveFloatAdButtons" :key="button.id" class="item" :class="{
          'rwd-first-button': index === 0,
          'rwd-second-button': index === 1,
          'rwd-third-button': index === 2
        }">
          <!-- 桌面版圖片 -->
          <ImageButton class="desktop-image" :default-src="button.default" :hover-src="button.hover"
            :alt="`浮動廣告 ${index + 1}`" :href="button.href" target="_blank" />
          <!-- 平板版圖片 -->
          <ImageButton class="tablet-image" :default-src="button.tablet || button.default"
            :hover-src="button.tablet || button.default" :alt="`浮動廣告 ${index + 1}`" :href="button.href"
            target="_blank" />
          <!-- 手機版圖片 -->
          <ImageButton class="mobile-image" :default-src="button.mobile || button.default"
            :hover-src="button.mobile || button.default" :alt="`浮動廣告 ${index + 1}`" :href="button.href"
            target="_blank" />
        </div>
      </div>
    </div>

    <!-- Scroll To Top Button -->
    <button class="scroll-to-top" @click="scrollToTop" aria-label="Scroll to top">
      <div class="arrow-up"></div>
    </button>
  </div>
</template>

<style scoped>
@import "/src/assets/styles/components/HomePage.css";
</style>
