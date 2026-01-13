// 简单的轮播图和banner API服务
class CarouselService {
  private baseUrl: string

  constructor() {
    // In development with proxy, use relative path
    // In production container, use environment variable or default
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3002/api' : '/api')
    // Remove trailing slash if present
    this.baseUrl = this.baseUrl.replace(/\/$/, '')
  }

  async getConfig(): Promise<{
    carouselSlides: { image: string, href: string, alt: string }[],
    banner: string,
    backgroundImage: string,
    videoThumbnails: ({ image: string, href: string, alt: string, title: string } | null)[],
    programThumbnails: ({ image: string, href: string, alt: string, title: string } | null)[],
    buttonLinks: ({ text: string, href: string, target: string, defaultImage?: string, hoverImage?: string } | null)[],
    toolIcons: ({ id: string, default: string, hover: string, alt: string, href: string } | null)[],
    floatAdButtons?: ({ default: string, hover: string, href: string, alt: string } | null)[],
    routeLinks?: { default: string, hover: string } | null
  }> {
    try {
      // 檢查是否啟用了 API
      const { siteConfig } = await import('../config/siteConfig')
      if (siteConfig.useApi === false) {
        throw new Error('API is disabled via config')
      }

      const response = await fetch(`${this.baseUrl}/public/config`)

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`)
      }

      const config = await response.json()

      // Process image URLs to ensure they work in container environment
      const processImageUrl = (url: string) => {
        if (!url) return ''
        if (url.startsWith('http')) return url
        if (url.startsWith('/uploads/')) return url
        if (url.startsWith('/assets/')) return url
        return url
      }

      return {
        carouselSlides: (config.carouselSlides || []).map((slide: any) => ({
          ...slide,
          image: processImageUrl(slide.image)
        })),
        banner: processImageUrl(config.banner || ''),
        backgroundImage: processImageUrl(config.backgroundImage || ''),
        videoThumbnails: (config.videoThumbnails || []).map((video: any) =>
          video ? { ...video, image: processImageUrl(video.image) } : null
        ),
        programThumbnails: (config.programThumbnails || []).map((program: any) =>
          program ? { ...program, image: processImageUrl(program.image) } : null
        ),
        buttonLinks: (config.buttonLinks || []).map((button: any) =>
          button ? { ...button } : null
        ),
        toolIcons: (config.toolIcons || []).map((tool: any) =>
          tool ? {
            ...tool,
            default: processImageUrl(tool.default),
            hover: processImageUrl(tool.hover)
          } : null
        ),
        floatAdButtons: (config.floatAdButtons || []).map((button: any) =>
          button ? {
            ...button,
            default: processImageUrl(button.default),
            hover: processImageUrl(button.hover)
          } : null
        ),
        routeLinks: config.routeLinks ? {
          default: processImageUrl(config.routeLinks.default),
          hover: processImageUrl(config.routeLinks.hover)
        } : null
      }
    } catch (error) {
      console.error('Failed to fetch config from API:', error)

      // 返回默认数据作为后备
      return {
        carouselSlides: [
          {
            image: '/assets/images/39c91b7a-9464-4acc-85a5-8ac436268dd2.png',
            href: '#',
            alt: '輪播圖 1'
          },
          {
            image: '/assets/images/tools-title.webp',
            href: '#',
            alt: '輪播圖 2'
          },
          {
            image: '/assets/images/43d1eb1c-91ed-4e12-903e-197a2042d7cf.png',
            href: '#',
            alt: '輪播圖 3'
          },
          {
            image: '/assets/images/480863fc-6a80-4015-9ad1-9fb4e13aeb93.png',
            href: '#',
            alt: '輪播圖 4'
          },
          {
            image: '/assets/images/4d106ec5-aa73-4fd5-915e-7e1c6311afa5.png',
            href: '#',
            alt: '輪播圖 5'
          }
        ],
        banner: '',
        backgroundImage: '',
        videoThumbnails: [],
        programThumbnails: [],
        buttonLinks: [],
        toolIcons: []
      }
    }
  }

  // 保持向后兼容的方法
  async getCarouselSlides(): Promise<string[]> {
    const config = await this.getConfig()
    return config.carouselSlides.map(slide => slide.image)
  }

  async getBanner(): Promise<string> {
    const config = await this.getConfig()
    return config.banner
  }
}

export const carouselService = new CarouselService()