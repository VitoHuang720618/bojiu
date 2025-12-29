<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
import { carouselService } from '../services/carouselService'

const currentSlide = ref(0)
let carouselInterval: number | null = null

// 从API获取的轮播图数据
const apiCarouselSlides = ref<{image: string, href: string, alt: string}[]>([])
const apiBanner = ref<string>('')
const apiVideoThumbnails = ref<({image: string, href: string, alt: string, title: string} | null)[]>([])
const apiProgramThumbnails = ref<({image: string, href: string, alt: string, title: string} | null)[]>([])

// 计算属性：优先使用API数据，否则使用默认数据
const effectiveCarouselSlides = computed(() => {
  return apiCarouselSlides.value.length > 0 ? 
    apiCarouselSlides.value.map((slide, index) => ({
      id: `api-slide-${index}`,
      alt: slide.alt,
      href: slide.href,
      image: slide.image
    })) : 
    carouselSlides
})

const effectiveBanner = computed(() => {
  return apiBanner.value
})

const effectiveVideoThumbnails = computed(() => {
  return apiVideoThumbnails.value.length > 0 ? 
    apiVideoThumbnails.value : 
    videoContent.map((video, index) => ({
      image: assetManifest.videoThumbnails[index],
      href: '#',
      alt: video.title,
      title: video.title
    }))
})

const effectiveProgramThumbnails = computed(() => {
  return apiProgramThumbnails.value.length > 0 ? 
    apiProgramThumbnails.value : 
    programContent.map((program, index) => ({
      image: assetManifest.programThumbnails[index],
      href: '#',
      alt: program.title,
      title: program.title
    }))
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
    const config = await carouselService.getConfig()
    apiCarouselSlides.value = config.carouselSlides
    apiBanner.value = config.banner
    apiVideoThumbnails.value = config.videoThumbnails
    apiProgramThumbnails.value = config.programThumbnails
    console.log('Loaded config from API:', config)
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
    <div id="home-main">
      <div class="home-main__inner">
        <!-- Top Button Links -->
        <div class="button-links">
          <div
            v-for="(item, index) in assetManifest.buttonLinks"
            :key="item.id"
            class="item"
          >
            <ImageButton
              :default-src="item.default"
              :hover-src="item.hover"
              :alt="item.alt"
              :href="siteConfig.navigation[index]?.href"
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
                  :default-src="assetManifest.toolIcons[index].default"
                  :hover-src="assetManifest.toolIcons[index].hover"
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
            <div class="list">
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
            <div class="list">
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
          </div>
        </div>
      </div>
    </div>

    <!-- Float Ad Buttons -->
    <div id="float-ad">
      <div class="links">
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
  background-color: #0a0a0a;
  background-image: 
    radial-gradient(circle, rgba(80, 80, 80, 0.4) 1.5px, transparent 1.5px),
    radial-gradient(circle, rgba(60, 60, 60, 0.3) 1px, transparent 1px),
    linear-gradient(180deg, rgba(223, 176, 130, 0.25) 0%, transparent 60px),
    linear-gradient(0deg, rgba(223, 176, 130, 0.25) 0%, transparent 60px);
  background-size: 16px 16px, 32px 32px, 100% 60px, 100% 60px;
  background-position: 0 0, 8px 8px, top, bottom;
  background-repeat: repeat, repeat, repeat-x, repeat-x;
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
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1024px) {
  .programme-wrap .list {
    gap: 0.875rem;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .programme-wrap .list {
    gap: 1rem;
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .programme-wrap .list {
    gap: 0.625rem;
    grid-template-columns: repeat(2, 1fr);
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
  width: 187px;  /* 固定寬度 */
  height: 105px; /* 固定高度 */
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
  width: 187px;
  height: 105px;
  border: 2px dashed #b3905b;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  background-color: transparent;
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
}

@media (max-width: 1440px) {
  #float-ad {
    max-width: 75px;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  #float-ad {
    background-color: rgba(0, 0, 0, 0.8);
    bottom: 0;
    left: 0;
    max-width: none;
    min-width: 100%;
    padding: 1.25rem 2rem;
    right: 0;
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
    gap: 2rem;
  }
}
</style>
