// Asset manifest documenting all downloaded images and their usage
const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export const assetManifest = {
  // Logo
  logo: `${base}/assets/images/logo.png`,

  // Banner
  banner: `${base}/assets/images/banner.png`,
  backgroundImage: `${base}/assets/images/backgroundImage.png`,

  // Top button links (4 items)
  buttonLinks: [
    {
      id: 'universal-browser',
      default: `${base}/assets/images/button-0-defaultImage.png`,
      hover: `${base}/assets/images/button-0-hoverImage.png`,
      alt: '寰宇瀏覽器'
    },
    {
      id: 'app',
      default: `${base}/assets/images/button-1-defaultImage.png`,
      hover: `${base}/assets/images/button-1-hoverImage.png`,
      alt: 'APP'
    },
    {
      id: 'fun-park',
      default: `${base}/assets/images/button-2-defaultImage.png`,
      hover: `${base}/assets/images/button-2-hoverImage.png`,
      alt: 'FUN乐园'
    },
    {
      id: 'partners',
      default: `${base}/assets/images/button-3-defaultImage.png`,
      hover: `${base}/assets/images/button-3-hoverImage.png`,
      alt: '合作夥伴'
    }
  ],

  // Carousel slides
  carouselSlides: [
    `${base}/assets/images/carousel-0.png`,
    `${base}/assets/images/carousel-1.png`,
    `${base}/assets/images/carousel-2.png`,
    `${base}/assets/images/carousel-3.png`,
    `${base}/assets/images/carousel-4.png`
  ],

  // Section titles
  titles: {
    recommendedRoutes: `${base}/assets/images/crown-icon-new.png`,
    recommendedBrowsers: `${base}/assets/images/tools-title.webp`,
    selectedVideos: `${base}/assets/images/live-title-new.png`,
    hotPrograms: `${base}/assets/images/sport-title-new.png`
  },

  // Route links (6 items)
  routeLinks: [
    { default: `${base}/assets/images/Lineweb-btn-1.webp`, hover: `${base}/assets/images/Lineweb-btn-1-hover.webp` },
    { default: `${base}/assets/images/Lineweb-btn-2.webp`, hover: `${base}/assets/images/Lineweb-btn-2-hover.webp` },
    { default: `${base}/assets/images/Lineweb-btn-3.webp`, hover: `${base}/assets/images/Lineweb-btn-3-hover.webp` },
    { default: `${base}/assets/images/Lineweb-btn-4.webp`, hover: `${base}/assets/images/Lineweb-btn-4-hover.webp` },
    { default: `${base}/assets/images/Lineweb-btn-5.webp`, hover: `${base}/assets/images/Lineweb-btn-5-hover.webp` },
    { default: `${base}/assets/images/Lineweb-btn-6.webp`, hover: `${base}/assets/images/Lineweb-btn-6-hover.webp` }
  ],

  // Browser/Tool icons (6 items)
  toolIcons: [
    {
      id: 'xiaohongshu',
      default: `${base}/assets/images/tool-0-default.png`,
      hover: `${base}/assets/images/tool-0-hover.png`,
      alt: '小紅書'
    },
    {
      id: 'douyin',
      default: `${base}/assets/images/tool-1-default.png`,
      hover: `${base}/assets/images/tool-1-hover.png`,
      alt: '抖音'
    },
    {
      id: 'baidu',
      default: `${base}/assets/images/tool-2-default.png`,
      hover: `${base}/assets/images/tool-2-hover.png`,
      alt: '百度'
    },
    {
      id: 'youku',
      default: `${base}/assets/images/tool-3-default.png`,
      hover: `${base}/assets/images/tool-3-hover.png`,
      alt: 'YOUKU'
    },
    {
      id: 'iqiyi',
      default: `${base}/assets/images/tool-4-default.png`,
      hover: `${base}/assets/images/tool-4-hover.png`,
      alt: 'iQIYI'
    },
    {
      id: 'x',
      default: `${base}/assets/images/tool-5-default.png`,
      hover: `${base}/assets/images/tool-5-hover.png`,
      alt: 'X'
    }
  ],

  // Video thumbnails (6 items)
  videoThumbnails: [
    `${base}/assets/images/video-0.png`,
    `${base}/assets/images/video-1.png`,
    `${base}/assets/images/video-2.png`,
    `${base}/assets/images/video-3.png`,
    `${base}/assets/images/video-4.png`,
    `${base}/assets/images/video-5.png`
  ],

  // Program thumbnails (6 items)
  programThumbnails: [
    `${base}/assets/images/program-0.png`,
    `${base}/assets/images/program-1.png`,
    `${base}/assets/images/program-2.png`,
    `${base}/assets/images/program-3.png`,
    `${base}/assets/images/program-4.png`,
    `${base}/assets/images/program-5.png`
  ],

  // Float ad buttons (3 items)
  floatAdButtons: [
    {
      id: 'customer-service',
      default: `${base}/assets/images/float-0-default.png`,
      hover: `${base}/assets/images/float-0-hover.png`,
      tablet: '',
      mobile: '',
      alt: '在线客服'
    },
    {
      id: 'girl-douyin',
      default: `${base}/assets/images/float-1-default.png`,
      hover: `${base}/assets/images/float-1-hover.png`,
      tablet: '',
      mobile: '',
      alt: '女孩抖音'
    },
    {
      id: 'sports-douyin',
      default: `${base}/assets/images/float-2-default.png`,
      hover: `${base}/assets/images/float-2-hover.png`,
      tablet: '',
      mobile: '',
      alt: '体育抖音'
    }
  ]
}
