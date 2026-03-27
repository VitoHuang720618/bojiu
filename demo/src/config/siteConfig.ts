import { reactive } from 'vue'
import type { SiteConfig } from '../types'
import { assetManifest as originalAssetManifest } from './assetManifest'

// Get base URL from environment or use relative path for container deployment
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return import.meta.env.VITE_BASE_URL || ''
}

// Site configuration (Migrated from Manager)
export const siteConfig = reactive<SiteConfig>({
  title: '博九娱乐网',
  description: 'B9 Entertainment Website',
  baseUrl: getBaseUrl(),
  useApi: true, // Default to true, but assets below are used when API fails or is disabled
  floatAdButtons: [],

  navigation: [
    {
      "id": "btn-0",
      "label": "寰宇瀏覽器",
      "href": "https://www.ub66.com/",
      "isExternal": true,
      "default": "/defaults/button-0-defaultImage.png",
      "hover": "/defaults/button-0-hoverImage.png"
    },
    {
      "id": "btn-1",
      "label": "APP",
      "href": "https://haa68686.com:9900/web/simple.php#/aioDownload",
      "isExternal": true,
      "default": "/defaults/button-1-defaultImage.png",
      "hover": "/defaults/button-1-hoverImage.png"
    },
    {
      "id": "btn-2",
      "label": "FUN乐园",
      "href": "https://fun99666.com/",
      "isExternal": true,
      "default": "/defaults/button-2-defaultImage.png",
      "hover": "/defaults/button-2-hoverImage.png"
    },
    {
      "id": "btn-3",
      "label": "合作夥伴",
      "href": "https://haa68686.com:9900/web/#/article/at3",
      "isExternal": true,
      "default": "/defaults/button-3-defaultImage.png",
      "hover": "/defaults/button-3-hoverImage.png"
    }
  ],

  footer: {
    links: [],
    socialMedia: [],
    copyright: 'Copyright © 博九娱乐网 Reserved'
  },

  theme: {
    colors: {
      primary: '#ba081f',
      secondary: '#8b0012',
      background: '#16181b',
      text: '#ffd08c',
      accent: '#dfb082'
    },
    fonts: {
      heading: 'Arial, Microsoft Yahei, PingFangSC, sans-serif',
      body: 'Arial, Microsoft Yahei, PingFangSC, sans-serif'
    },
    breakpoints: {
      mobile: 480,
      tablet: 768,
      desktop: 1024
    }
  }
})

// Function to update local assets for non-API mode
export const updateLocalAssets = (config: any) => {
  if (config.logo !== undefined) Object.assign(assetsState, { logo: config.logo })
  if (config.banner) Object.assign(banner, config.banner)
  if (config.backgroundImage !== undefined) Object.assign(assetsState, { backgroundImage: config.backgroundImage })
  if (config.headerBackgroundRgba !== undefined) Object.assign(assetsState, { headerBackgroundRgba: config.headerBackgroundRgba })
  if (config.headerCss !== undefined) Object.assign(assetsState, { headerCss: config.headerCss })
  if (config.recommendContentBackground !== undefined) Object.assign(assetsState, { recommendContentBackground: config.recommendContentBackground })
  if (config.recommendContentCss !== undefined) Object.assign(assetsState, { recommendContentCss: config.recommendContentCss })
  if (config.titles) Object.assign(titles, config.titles)
  if (config.buttonLinks) {
    siteConfig.navigation.splice(0, siteConfig.navigation.length, ...config.buttonLinks)
  }
  if (config.routeLinksImages) routeLinksImages.splice(0, routeLinksImages.length, ...config.routeLinksImages)
  if (config.recommendedRoutes) recommendedRoutes.splice(0, recommendedRoutes.length, ...config.recommendedRoutes)
  if (config.recommendedTools) recommendedTools.splice(0, recommendedTools.length, ...config.recommendedTools)
  if (config.videoThumbnails) videoThumbnails.splice(0, videoThumbnails.length, ...config.videoThumbnails)
  if (config.programThumbnails) programThumbnails.splice(0, programThumbnails.length, ...config.programThumbnails)
  if (config.carouselSlides) carouselSlides.splice(0, carouselSlides.length, ...config.carouselSlides)
  if (config.floatAdButtons) floatAdButtons.splice(0, floatAdButtons.length, ...config.floatAdButtons)
  if (config.pageLayout) {
    pageLayout.splice(0, pageLayout.length, ...config.pageLayout)
  }
  if (config.programmeLayout) {
    programmeLayout.splice(0, programmeLayout.length, ...config.programmeLayout)
  }
}

// Re-export assetManifest for use in other modules
export const assetManifest = originalAssetManifest
export const loadRuntimeConfig = async () => {
  try {
    const response = await fetch('/site-settings.json')
    if (response.ok) {
      const runtimeConfig = await response.json()

      // Update core site config
      if (runtimeConfig.siteConfig) {
        Object.assign(siteConfig, runtimeConfig.siteConfig)
      }

      // Update local assets if they exist in runtime config
      updateLocalAssets(runtimeConfig)

      console.log('✅ Runtime configuration loaded')
      return true
    }
  } catch (error) {
    // Silent fail - use built-in defaults
    console.log('ℹ️ Using built-in configuration')
  }
  return false
}

// --- Migrated Assets & Content ---

export const pageLayout = reactive<string[]>(['banner', 'buttonLinks', 'recommend', 'programme', 'floatAd'])
export const programmeLayout = reactive<string[]>(['selectedVideos', 'hotPrograms'])

export const banner = reactive({
  "pc": "/defaults/banner-pc.png",
  "tablet": "/defaults/banner-tablet.png",
  "mobile": ""
})

export const assetsState = reactive({
  logo: "/assets/images/logo.png",
  backgroundImage: "/defaults/backgroundImage.png",
  headerBackgroundRgba: "linear-gradient(0deg, #3041b9 0%, #081fb3 100%)",
  headerCss: "",
  recommendContentBackground: "rgba(20, 10, 104, 1.0)",
  recommendContentCss: ""
})

export const titles = reactive({
  recommendedRoutes: "",
  recommendedBrowsers: "",
  selectedVideos: "",
  hotPrograms: ""
})

export const routeLinksImages = reactive([
  {
    "default": "/assets/images/Lineweb-btn-1.webp",
    "hover": "/assets/images/Lineweb-btn-1-hover.webp",
    "href": "http://www.yahoo.com.tw"
  },
  {
    "default": "/assets/images/Lineweb-btn-2.webp",
    "hover": "/assets/images/Lineweb-btn-2-hover.webp",
    "href": ""
  },
  {
    "default": "/assets/images/Lineweb-btn-3.webp",
    "hover": "/assets/images/Lineweb-btn-3-hover.webp",
    "href": ""
  },
  {
    "default": "/assets/images/Lineweb-btn-4.webp",
    "hover": "/assets/images/Lineweb-btn-4-hover.webp",
    "href": ""
  },
  {
    "default": "/assets/images/Lineweb-btn-5.webp",
    "hover": "/assets/images/Lineweb-btn-5-hover.webp",
    "href": ""
  },
  {
    "default": "/assets/images/Lineweb-btn-6.webp",
    "hover": "/assets/images/Lineweb-btn-6-hover.webp",
    "href": ""
  }
])

export const recommendedRoutes = reactive([
  {
    "id": "route-1",
    "index": 1,
    "title": "线路 1",
    "href": "http://www.yahoo.com.tw"
  },
  {
    "id": "route-2",
    "index": 2,
    "title": "线路 2",
    "href": ""
  },
  {
    "id": "route-3",
    "index": 3,
    "title": "线路 3",
    "href": ""
  },
  {
    "id": "route-4",
    "index": 4,
    "title": "线路 4",
    "href": ""
  },
  {
    "id": "route-5",
    "index": 5,
    "title": "线路 5",
    "href": ""
  },
  {
    "id": "route-6",
    "index": 6,
    "title": "线路 6",
    "href": ""
  }
])

export const recommendedTools = reactive([
  {
    "id": "tool-0",
    "name": "Tool 0",
    "href": "https://www.xiaohongshu.com",
    "default": "",
    "hover": ""
  },
  {
    "id": "tool-1",
    "name": "Tool 1",
    "href": "https://www.douyin.com",
    "default": "",
    "hover": ""
  },
  {
    "id": "tool-2",
    "name": "Tool 2",
    "href": "https://www.baidu.com",
    "default": "",
    "hover": ""
  }
])

export const videoThumbnails = reactive([
  {
    "id": "video-0",
    "title": "Video 0",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "video-1",
    "title": "Video 1",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "video-2",
    "title": "Video 2",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "video-3",
    "title": "Video 3",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "video-4",
    "title": "Video 4",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "video-5",
    "title": "Video 5",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "video-6",
    "title": "Video 6",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "video-7",
    "title": "Video 7",
    "href": "#",
    "image": "",
    "alt": ""
  }
])

export const programThumbnails = reactive([
  {
    "id": "program-0",
    "title": "Program 0",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-1",
    "title": "Program 1",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-2",
    "title": "Program 2",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-3",
    "title": "Program 3",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-4",
    "title": "Program 4",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-5",
    "title": "Program 5",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-6",
    "title": "Program 6",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-7",
    "title": "Program 7",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-8",
    "title": "Program 8",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-9",
    "title": "Program 9",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-10",
    "title": "Program 10",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-11",
    "title": "Program 11",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-12",
    "title": "Program 12",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-13",
    "title": "Program 13",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-14",
    "title": "Program 14",
    "href": "#",
    "image": "",
    "alt": ""
  },
  {
    "id": "program-15",
    "title": "Program 15",
    "href": "#",
    "image": "",
    "alt": ""
  }
])

export const carouselSlides = reactive([
  {
    "id": "slide-0",
    "image": "/defaults/carousel-0.png",
    "href": "",
    "alt": "Carousel 0"
  },
  {
    "id": "slide-1",
    "image": "/defaults/carousel-1.png",
    "href": "",
    "alt": "Carousel 1"
  }
])

export const floatAdButtons = reactive([
    {
      "id": "float-0",
      "name": "Float 0",
      "href": "https://example.com/customer-service",
      "default": "/defaults/floatAdButtons-0-default-1774324606498.png",
      "hover": "/defaults/floatAdButtons-0-hover-1774324612151.png",
      "tablet": "/defaults/floatAdButtons-0-tablet-1774324650635.png",
      "mobile": "/defaults/floatAdButtons-0-mobile-1774325524932.png"
    },
    {
      "id": "float-1",
      "name": "Float 1",
      "href": "https://example.com/girl-douyin",
      "default": "/defaults/floatAdButtons-1-default-1774324621557.png",
      "hover": "/defaults/floatAdButtons-1-hover-1774324624507.png",
      "tablet": "/defaults/floatAdButtons-1-tablet-1774324655594.png",
      "mobile": "/defaults/floatAdButtons-1-mobile-1774325528535.png"
    },
    {
      "id": "float-2",
      "name": "Float 2",
      "href": "https://example.com/sports-douyin",
      "default": "/defaults/floatAdButtons-2-default-1774324633499.png",
      "hover": "/defaults/floatAdButtons-2-hover-1774324638235.png",
      "tablet": "/defaults/floatAdButtons-2-tablet-1774324659376.png",
      "mobile": "/defaults/floatAdButtons-2-mobile-1774325532199.png"
    }
])

export const videoContent = videoThumbnails
export const programContent = programThumbnails
export const buttonLinks = siteConfig.navigation
