import { reactive } from 'vue'
import type { SiteConfig } from '../types'

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
  useApi: false, // STATIC MODE (Updated: 2026-03-16)
  floatAdButtons: [],
  navigation: [
        {
            "id": "btn-0",
            "label": "寰宇瀏覽器",
            "href": "https://www.ub66.com/",
            "isExternal": true,
            "default": "/uploads/buttonLinks-0-defaultImage-1773309986146.png",
            "hover": "/uploads/buttonLinks-0-hoverImage-1773309993604.png"
        },
        {
            "id": "btn-1",
            "label": "APP",
            "href": "https://haa68686.com:9900/web/simple.php#/aioDownload",
            "isExternal": true,
            "default": "/uploads/buttonLinks-1-defaultImage-1773310005255.png",
            "hover": "/uploads/buttonLinks-1-hoverImage-1773310009085.png"
        },
        {
            "id": "btn-2",
            "label": "FUN乐园",
            "href": "https://fun99666.com/",
            "isExternal": true,
            "default": "/uploads/buttonLinks-2-defaultImage-1773310014870.png",
            "hover": "/uploads/buttonLinks-2-hoverImage-1773310018425.png"
        },
        {
            "id": "btn-3",
            "label": "合作夥伴",
            "href": "https://haa68686.com:9900/web/#/article/at3",
            "isExternal": true,
            "default": "/uploads/buttonLinks-3-defaultImage-1773310024371.png",
            "hover": "/uploads/buttonLinks-3-hoverImage-1773310036669.png"
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

// Function to update local assets for non-API mode (No-op in static mode)
export const updateLocalAssets = (_config: any) => {}

// Function to load runtime config (No-op in static mode)
export const loadRuntimeConfig = async () => { return false }

// --- Migrated Assets & Content ---

export const banner = reactive({
  "pc": "/uploads/banner-pc-1773309499593.png",
  "tablet": "/uploads/banner-tablet-1773309504363.png",
  "mobile": "/uploads/banner-mobile-1773309507684.png"
})

export const assetsState = reactive({
  "logo": "/uploads/logo-1770120060613.png",
  "backgroundImage": "/uploads/backgroundImage-1773309723476.png"
})

export const titles = reactive({
  "recommendedRoutes": "",
  "recommendedBrowsers": "",
  "selectedVideos": "",
  "hotPrograms": ""
})

export const routeLinksImages = reactive([
  {
    "default": "/uploads/routeLinks-0-default-1773309791508.png",
    "hover": "/uploads/routeLinks-0-hover-1773309795178.png",
    "href": "https://www7107281414182.b02999.com:7730"
  },
  {
    "default": "/uploads/routeLinks-1-default-1773309814362.png",
    "hover": "/uploads/routeLinks-1-hover-1773309818013.png",
    "href": "https://www7107281414182.b02999.net:6899"
  },
  {
    "default": "/uploads/routeLinks-2-default-1773309826453.png",
    "hover": "/uploads/routeLinks-2-hover-1773309829890.png",
    "href": "https://www7107281414182.b90112.com:5569"
  },
  {
    "default": "/uploads/routeLinks-3-default-1773309835420.png",
    "hover": "/uploads/routeLinks-3-hover-1773309838508.png",
    "href": "https://www7107281414182.b92268.com:5569"
  },
  {
    "default": "/uploads/routeLinks-4-default-1773309844979.png",
    "hover": "/uploads/routeLinks-4-hover-1773309847655.png",
    "href": "https://www7107281414182.b9468.net:6899"
  },
  {
    "default": "/uploads/routeLinks-5-default-1773309852011.png",
    "hover": "/uploads/routeLinks-5-hover-1773309854825.png",
    "href": "https://www7107281414182.b95066.com:9900"
  }
])

export const recommendedRoutes = reactive([
  {
    "id": "route-1",
    "index": 1,
    "title": "线路 1",
    "href": "https://www7107281414182.b02999.com:7730"
  },
  {
    "id": "route-2",
    "index": 2,
    "title": "线路 2",
    "href": "https://www7107281414182.b02999.net:6899"
  },
  {
    "id": "route-3",
    "index": 3,
    "title": "线路 3",
    "href": "https://www7107281414182.b90112.com:5569"
  },
  {
    "id": "route-4",
    "index": 4,
    "title": "线路 4",
    "href": "https://www7107281414182.b92268.com:5569"
  },
  {
    "id": "route-5",
    "index": 5,
    "title": "线路 5",
    "href": "https://www7107281414182.b9468.net:6899"
  },
  {
    "id": "route-6",
    "index": 6,
    "title": "线路 6",
    "href": "https://www7107281414182.b95066.com:9900"
  }
])

export const recommendedTools = reactive([
  {
    "id": "tool-0",
    "name": "Tool 0",
    "href": "https://live.titan007.com/oldIndexall.aspx",
    "default": "/uploads/toolIcons-0-default-1770120394256.png",
    "hover": "/uploads/toolIcons-0-hover-1770120397439.png"
  },
  {
    "id": "tool-1",
    "name": "Tool 1",
    "href": "https://live.leisu.com/",
    "default": "/uploads/toolIcons-1-default-1770120409929.png",
    "hover": "/uploads/toolIcons-1-hover-1770120413079.png"
  },
  {
    "id": "tool-2",
    "name": "Tool 2",
    "href": "https://live.nowscore.com/2in1.aspx",
    "default": "/uploads/toolIcons-2-default-1770120425444.png",
    "hover": "/uploads/toolIcons-2-hover-1770120429261.png"
  },
  {
    "id": "tool-3",
    "name": "Tool 3",
    "href": "https://v.douyin.com/KZUpEUBUIlI/",
    "default": "/uploads/toolIcons-3-default-1770688024681.png",
    "hover": "/uploads/toolIcons-3-hover-1770688029743.png"
  },
  {
    "id": "tool-4",
    "name": "Tool 4",
    "href": "https://www.baidu.com/",
    "default": "/uploads/toolIcons-4-default-1770120452531.png",
    "hover": "/uploads/toolIcons-4-hover-1770120456331.png"
  },
  {
    "id": "tool-5",
    "name": "Tool 5",
    "href": "https://x.com/ezfun9527",
    "default": "/uploads/toolIcons-5-default-1770120479215.png",
    "hover": "/uploads/toolIcons-5-hover-1770120483256.png"
  }
])

export const videoThumbnails = reactive([
  {
    "id": "video-0",
    "title": "甜美Aura",
    "href": "https://www.fun99666.com/index.php/funfans/",
    "image": "/uploads/videoThumbnails-0-image-1770169531142.png",
    "alt": "甜美Aura"
  },
  {
    "id": "video-1",
    "title": "变态马洛",
    "href": "https://www.fun99666.com/index.php/funfans/",
    "image": "/uploads/videoThumbnails-1-image-1770169537816.png",
    "alt": "变态马洛"
  },
  {
    "id": "video-2",
    "title": "阳光Hank",
    "href": "https://www.fun99666.com/index.php/funfans/",
    "image": "/uploads/videoThumbnails-2-image-1770169641967.png",
    "alt": "阳光Hank"
  },
  {
    "id": "video-3",
    "title": "蹦蹦冲啊",
    "href": "https://www.fun99666.com/index.php/funfans/",
    "image": "/uploads/videoThumbnails-3-image-1770169649119.png",
    "alt": "蹦蹦冲啊"
  },
  {
    "id": "video-4",
    "title": "专属福利",
    "href": "https://www.fun99666.com/index.php/funfans/",
    "image": "/uploads/videoThumbnails-4-image-1770169664625.png",
    "alt": "专属福利"
  },
  {
    "id": "video-5",
    "title": "撩人双飞闺蜜秀",
    "href": "https://www.fun99666.com/index.php/funfans/",
    "image": "/uploads/videoThumbnails-5-image-1770169672390.png",
    "alt": "撩人双飞闺蜜秀"
  }
])

export const programThumbnails = reactive([
  {
    "id": "program-0",
    "title": "NBA賽事",
    "href": "https://www.fun99666.com/index.php/sport-information/",
    "image": "/uploads/programThumbnails-0-image-1770167952115.png",
    "alt": "NBA賽事"
  },
  {
    "id": "program-1",
    "title": "NBA賽事",
    "href": "https://www.fun99666.com/index.php/sport-information/",
    "image": "/uploads/programThumbnails-1-image-1770688353122.png",
    "alt": "NBA賽事"
  },
  {
    "id": "program-2",
    "title": "NBA賽事",
    "href": "https://www.fun99666.com/index.php/sport-information/",
    "image": "/uploads/programThumbnails-2-image-1770167960576.png",
    "alt": "NBA賽事"
  },
  {
    "id": "program-3",
    "title": "英超賽事",
    "href": "https://www.fun99666.com/index.php/sport-information/",
    "image": "/uploads/programThumbnails-3-image-1770167964919.png",
    "alt": "英超賽事"
  },
  {
    "id": "program-4",
    "title": "英超賽事",
    "href": "https://www.fun99666.com/index.php/sport-information/",
    "image": "/uploads/programThumbnails-4-image-1770688366989.png",
    "alt": "英超賽事"
  },
  {
    "id": "program-5",
    "title": "英超賽事",
    "href": "https://www.fun99666.com/index.php/sport-information/",
    "image": "/uploads/programThumbnails-5-image-1770167974687.png",
    "alt": "英超賽事"
  }
])

export const carouselSlides = reactive([
  {
    "id": "slide-0",
    "image": "/uploads/carouselSlides-0-image-1773309630053.png",
    "href": "https://bet9.net:9900/web/#/",
    "alt": "Carousel 0"
  },
  {
    "id": "slide-1",
    "image": "/uploads/carouselSlides-1-image-1773309634321.png",
    "href": "https://bet9.net:9900/web/#/",
    "alt": "Carousel 1"
  }
])

export const floatAdButtons = reactive([
  {
    "id": "float-0",
    "name": "Float 0",
    "href": "https://3pisx.60bfjtkb.com/5d54e83dd5f4de784021jkfle-kelid25743e4810614cc6843da934461925da950daa8a0a72e5a809b5d75b381e777",
    "default": "/uploads/floatAdButtons-0-default-1773310240663.png",
    "hover": "/uploads/floatAdButtons-0-hover-1773310249736.png",
    "tablet": "/uploads/floatAdButtons-0-tablet-1773310260797.png",
    "mobile": "/uploads/floatAdButtons-0-mobile-1770123997223.png"
  },
  {
    "id": "float-1",
    "name": "Float 1",
    "href": "https://www.douyin.com/user/MS4wLjABAAAAYBFyAHu_0cdTXYYCxW1TGRSPsU5Ku2wRkWBXBK7mXe0",
    "default": "/uploads/floatAdButtons-1-default-1773310270351.png",
    "hover": "/uploads/floatAdButtons-1-hover-1773310275436.png",
    "tablet": "/uploads/floatAdButtons-1-tablet-1773310280723.png",
    "mobile": "/uploads/floatAdButtons-1-mobile-1770124004284.png"
  },
  {
    "id": "float-2",
    "name": "Float 2",
    "href": "https://www.fun99666.com/",
    "default": "/uploads/floatAdButtons-2-default-1773310288795.png",
    "hover": "/uploads/floatAdButtons-2-hover-1773310292210.png",
    "tablet": "/uploads/floatAdButtons-2-tablet-1773310301499.png",
    "mobile": "/uploads/floatAdButtons-2-mobile-1770124009097.png"
  }
])

export const videoContent = videoThumbnails
export const programContent = programThumbnails
export const buttonLinks = siteConfig.navigation
