import type { SiteConfig } from '../types'

// Get base URL from environment or use relative path for container deployment
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return import.meta.env.VITE_BASE_URL || ''
}

// Site configuration based on original B9 website
export const siteConfig: SiteConfig = {
  title: '博九娱乐网',
  description: 'B9 Entertainment Website',
  baseUrl: getBaseUrl(),
  
  navigation: [
    // Top navigation buttons
    {
      id: 'universal-browser',
      label: '寰宇瀏覽器',
      href: 'https://www.ub66.com/',
      isExternal: true
    },
    {
      id: 'app',
      label: 'APP',
      href: 'https://haa68686.com:9900/web/simple.php#/aioDownload',
      isExternal: true
    },
    {
      id: 'fun-park',
      label: 'FUN乐园',
      href: 'https://fun99666.com/',
      isExternal: true
    },
    {
      id: 'partners',
      label: '合作夥伴',
      href: 'https://haa68686.com:9900/web/#/article/at3',
      isExternal: true
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

// Recommended routes data
export const recommendedRoutes = [
  {
    id: 'route-1',
    index: 1,
    title: '线路 1',
    href: 'https://www7106010814424300.asands099.com:7730/'
  },
  {
    id: 'route-2',
    index: 2,
    title: '线路 2',
    href: 'https://www7106010814424300.b02999.com:7730/'
  },
  {
    id: 'route-3',
    index: 3,
    title: '线路 3',
    href: 'https://www7106010814424300.b02999.net:8866/'
  },
  {
    id: 'route-4',
    index: 4,
    title: '线路 4',
    href: 'https://www7106010814424300.b6668.com:7730/'
  },
  {
    id: 'route-5',
    index: 5,
    title: '线路 5',
    href: 'https://www7106010814424300.b8855b.com:9900/'
  },
  {
    id: 'route-6',
    index: 6,
    title: '线路 6',
    href: 'https://www7106010814424300.b8899b.com:8866/'
  }
]

// Recommended tools/browsers data
export const recommendedTools = [
  {
    id: 'xiaohongshu',
    name: '小紅書',
    href: 'https://www.xiaohongshu.com/explore'
  },
  {
    id: 'douyin',
    name: '抖音',
    href: 'https://www.douyin.com/'
  },
  {
    id: 'baidu',
    name: '百度',
    href: 'https://www.baidu.com/'
  },
  {
    id: 'youku',
    name: 'YOUKU',
    href: 'https://youku.com/'
  },
  {
    id: 'iqiyi',
    name: 'iQIYI',
    href: 'https://www.iq.com/'
  },
  {
    id: 'x',
    name: 'X',
    href: 'https://x.com/ezfun9527'
  }
]

// Video content data
export const videoContent = [
  { id: 'video-1', title: '甜美Aura' },
  { id: 'video-2', title: '变态马洛' },
  { id: 'video-3', title: '蹦蹦冲啊' },
  { id: 'video-4', title: '阳光Hank' },
  { id: 'video-5', title: '专属福利' },
  { id: 'video-6', title: '撩人双飞闺蜜秀' }
]

// Program content data
export const programContent = [
  { id: 'program-1', title: '十二月粉丝见面会' },
  { id: 'program-2', title: '十一月粉丝见面会' },
  { id: 'program-3', title: '特别节目' },
  { id: 'program-4', title: '特别节目' },
  { id: 'program-5', title: 'NBA赛事' },
  { id: 'program-6', title: '英超赛事' }
]

// Carousel slides data
export const carouselSlides = [
  {
    id: 'slide-1',
    alt: '登入享签到金',
    href: 'https://be9522.com:9900/web/#/promotion/home?focusTab=copy&statusTab=all&tagTab=1'
  },
  {
    id: 'slide-2',
    alt: '日日存·日日抽·最高1888！',
    href: 'https://be9522.com:9900/web/#/promotion/home?focusTab=copy&statusTab=all&tagTab=1'
  },
  {
    id: 'slide-3',
    alt: '日享存款回馈',
    href: 'https://be9522.com:9900/web/#/promotion/home?focusTab=copy&statusTab=all&tagTab=1'
  },
  {
    id: 'slide-4',
    alt: 'VIP特权盛典',
    href: 'https://be9522.com:9900/web/#/promotion/home?focusTab=copy&statusTab=all&tagTab=1'
  },
  {
    id: 'slide-5',
    alt: '诚邀加盟',
    href: 'https://be9522.com:9900/web/#/promotion/home?focusTab=copy&statusTab=all&tagTab=1'
  }
]

// Float ad buttons data
export const floatAdButtons = [
  {
    id: 'customer-service',
    name: '在线客服',
    href: 'https://3pisx.60bfjtkb.com/5d54e83dd5f4de784021jkfle-kelid25743e4810614cc6843da934461925da950daa8a0a72e5a809b5d75b381e777'
  },
  {
    id: 'girl-douyin',
    name: '女孩抖音',
    href: 'https://v.douyin.com/i5spY9ux/'
  },
  {
    id: 'sports-douyin',
    name: '体育抖音',
    href: 'https://www.fun99666.com/'
  }
]
