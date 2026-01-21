import type { SiteConfig } from '../types'

// Get base URL from environment or use relative path for container deployment
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return import.meta.env.VITE_BASE_URL || ''
}

// Site configuration (Migrated from Manager)
export const siteConfig: SiteConfig = {
  title: '博九娱乐网',
  description: 'B9 Entertainment Website',
  baseUrl: getBaseUrl(),
  useApi: true,

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
}

// --- Migrated Assets & Content ---

export const banner = {
  "pc": "/defaults/banner-pc.png",
  "tablet": "/defaults/banner-tablet.png",
  "mobile": ""
}

export const backgroundImage = "/defaults/backgroundImage.png"

export const routeLinksImages = Array(6).fill(null).map((_, i) => ({
  default: `/assets/images/Lineweb-btn-${i + 1}.webp`,
  hover: `/assets/images/Lineweb-btn-${i + 1}-hover.webp`,
  href: ''
}))

export const recommendedRoutes = [
  {
    "id": "route-1",
    "index": 1,
    "title": "线路 1",
    "href": "https://www7106010814424300.asands099.com:7730/"
  },
  {
    "id": "route-2",
    "index": 2,
    "title": "线路 2",
    "href": "https://www7106010814424300.b02999.com:7730/"
  },
  {
    "id": "route-3",
    "index": 3,
    "title": "线路 3",
    "href": "https://www7106010814424300.b02999.net:8866/"
  },
  {
    "id": "route-4",
    "index": 4,
    "title": "线路 4",
    "href": "https://www7106010814424300.b6668.com:7730/"
  },
  {
    "id": "route-5",
    "index": 5,
    "title": "线路 5",
    "href": "https://www7106010814424300.b8855b.com:9900/"
  },
  {
    "id": "route-6",
    "index": 6,
    "title": "线路 6",
    "href": "https://www7106010814424300.b8899b.com:8866/"
  }
]

export const recommendedTools = [
  {
    "id": "xiaohongshu",
    "name": "小紅書",
    "href": "https://live.titan007.com/oldIndexall.aspx",
    "default": "/defaults/tool-0-default.png",
    "hover": "/defaults/tool-0-hover.png"
  },
  {
    "id": "douyin",
    "name": "抖音",
    "href": "https://live.leisu.com/",
    "default": "/defaults/tool-1-default.png",
    "hover": "/defaults/tool-1-hover.png"
  },
  {
    "id": "baidu",
    "name": "百度",
    "href": "https://live.nowscore.com/2in1.aspx",
    "default": "/defaults/tool-2-default.png",
    "hover": "/defaults/tool-2-hover.png"
  },
  {
    "id": "youku",
    "name": "YOUKU",
    "href": "https://v.douyin.com/KZUpEUBUIlI/",
    "default": "/defaults/tool-3-default.png",
    "hover": "/defaults/tool-3-hover.png"
  },
  {
    "id": "iqiyi",
    "name": "iQIYI",
    "href": "https://www.baidu.com/",
    "default": "/defaults/tool-4-default.png",
    "hover": "/defaults/tool-4-hover.png"
  },
  {
    "id": "x",
    "name": "X",
    "href": "https://x.com/ezfun9527",
    "default": "/defaults/tool-5-default.png",
    "hover": "/defaults/tool-5-hover.png"
  }
]

export const videoThumbnails = [
  {
    "id": "video-0",
    "title": "甜美Aura",
    "href": "https://fun99888.com/index.php/sport-information/",
    "image": "/defaults/videoThumbnails-0-image.png",
    "alt": ""
  },
  {
    "id": "video-1",
    "title": "变态马洛",
    "href": "https://fun99888.com/index.php/sport-information/",
    "image": "/defaults/videoThumbnails-1-image.png",
    "alt": ""
  },
  {
    "id": "video-2",
    "title": "蹦蹦冲啊",
    "href": "https://fun99888.com/index.php/sport-information/",
    "image": "/assets/images/c370f50d-c248-4167-927f-c9af0bae3351.png",
    "alt": ""
  },
  {
    "id": "video-3",
    "title": "阳光Hank",
    "href": "https://fun99888.com/index.php/sport-information/",
    "image": "/assets/images/612623c8-aa39-44be-8eec-6d57d645bcfb.png",
    "alt": ""
  },
  {
    "id": "video-4",
    "title": "专属福利",
    "href": "https://example.com/video5",
    "image": "/assets/images/4e67c664-2a43-4ac2-9e09-dff556a007ce.png",
    "alt": ""
  },
  {
    "id": "video-5",
    "title": "撩人双飞闺蜜秀",
    "href": "https://fun99888.com/index.php/sport-information/",
    "image": "/assets/images/af698bb9-9183-4714-b568-fa7ef0721cfc.png",
    "alt": ""
  }
]

export const programThumbnails = [
  {
    "id": "program-0",
    "title": "Fun乐园圣典直播",
    "href": "https://www.fun99666.com/index.php/funfans/",
    "image": "/defaults/programThumbnails-0-image.png",
    "alt": ""
  },
  {
    "id": "program-1",
    "title": "熱門節目 2",
    "href": "https://example.com/program2",
    "image": "/assets/images/c67bb6cc-e00c-4811-a62a-38604bda41f7.png",
    "alt": "火熱節目 2"
  },
  {
    "id": "program-2",
    "title": "熱門節目 3",
    "href": "https://example.com/program3",
    "image": "/assets/images/391bcfda-fff2-4a55-b3d2-444884ddf87f.png",
    "alt": "火熱節目 3"
  },
  {
    "id": "program-3",
    "title": "熱門節目 4",
    "href": "https://example.com/program4",
    "image": "/assets/images/a1d2e390-0a0f-4dde-8d9b-6de5bb9f4de0.jpg",
    "alt": "火熱節目 4"
  },
  {
    "id": "program-4",
    "title": "熱門節目 5",
    "href": "https://example.com/program5",
    "image": "/assets/images/626e1c19-bf48-40ed-9a2f-8e2a8e4dce13.png",
    "alt": "火熱節目 5"
  },
  {
    "id": "program-5",
    "title": "熱門節目 6",
    "href": "https://example.com/program6",
    "image": "/assets/images/95e0ab84-342d-4bf0-8cbc-3b6e107308f3.jpg",
    "alt": "火熱節目 6"
  }
]

export const carouselSlides = [
  {
    "id": "slide-0",
    "image": "/defaults/carousel-0.png",
    "href": "",
    "alt": "輪播圖 1"
  }
]

export const floatAdButtons = [
  {
    "id": "customer-service",
    "name": "在线客服",
    "href": "https://3pisx.60bfjtkb.com/5d54e83dd5f4de784021jkfle-kelid25743e4810614cc6843da934461925da950daa8a0a72e5a809b5d75b381e777",
    "default": "/defaults/float-0-default.png",
    "hover": "/defaults/float-0-hover.png"
  },
  {
    "id": "girl-douyin",
    "name": "女孩抖音",
    "href": "https://v.douyin.com/KZUpEUBUIlI/",
    "default": "/defaults/float-1-default.png",
    "hover": "/defaults/float-1-hover.png"
  },
  {
    "id": "sports-douyin",
    "name": "体育抖音",
    "href": "https://www.fun99666.com/",
    "default": "/defaults/float-2-default.png",
    "hover": "/defaults/float-2-hover.png"
  }
]

export const videoContent = videoThumbnails
export const programContent = programThumbnails
export const buttonLinks = siteConfig.navigation
