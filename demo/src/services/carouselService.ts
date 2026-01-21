import type { BannerConfig } from '../types'

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
    banner: string | BannerConfig,
    backgroundImage: string,
    videoThumbnails: ({ image: string, href: string, alt: string, title: string } | null)[],
    programThumbnails: ({ image: string, href: string, alt: string, title: string } | null)[],
    buttonLinks: ({ text: string, href: string, target: string, defaultImage?: string, hoverImage?: string } | null)[],
    toolIcons: ({ id: string, default: string, hover: string, alt: string, href: string } | null)[],
    floatAdButtons?: ({ default: string, hover: string, href: string, alt: string } | null)[],
    routeLinks?: Array<{ default: string, hover: string, href: string }> | null
  }> {
    try {
      // 檢查是否啟用了 API
      const {
        siteConfig,
        carouselSlides,
        banner,
        backgroundImage,
        videoThumbnails,
        programThumbnails,
        buttonLinks,
        recommendedTools,
        floatAdButtons,
        routeLinksImages
      } = await import('../config/siteConfig')

      if (siteConfig.useApi === false) {
        // Return static data from config
        return {
          carouselSlides,
          banner,
          backgroundImage,
          videoThumbnails,
          programThumbnails,
          // Map structure for compatibility
          buttonLinks: buttonLinks.map((b: any) => ({
            text: b.label,
            href: b.href,
            target: b.isExternal ? '_blank' : '_self',
            defaultImage: b.default,
            hoverImage: b.hover
          })),
          toolIcons: recommendedTools.map((t: any) => ({
            id: t.id,
            default: t.default,
            hover: t.hover,
            alt: t.name,
            href: t.href
          })),
          floatAdButtons: floatAdButtons.map((f: any) => ({
            default: f.default,
            hover: f.hover,
            href: f.href,
            alt: f.name
          })),
          routeLinks: routeLinksImages as any
        }
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
        banner: typeof config.banner === 'object' ? {
          pc: processImageUrl(config.banner.pc || ''),
          tablet: processImageUrl(config.banner.tablet || ''),
          mobile: processImageUrl(config.banner.mobile || '')
        } : processImageUrl(config.banner || ''),
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
        routeLinks: Array.isArray(config.routeLinks) ? config.routeLinks.map((route: any) => ({
          default: processImageUrl(route.default),
          hover: processImageUrl(route.hover),
          href: route.href || ''
        })) : null
      }
    } catch (error: any) {
      // 這裡不再打印 Error，保持主控台乾淨
      if (error?.message !== 'API is disabled via config') {
        console.error('Failed to fetch config from API:', error)
      }

      // 返回默认数据作为后备
      return {
        carouselSlides: [
          {
            image: '/assets/images/39c91b7a-9464-4acc-85a5-8ac436268dd2.png',
            href: '#',
            alt: '輪播圖 1'
          },
          ...Array(4).fill(null).map((_, i) => ({ image: `/assets/images/carousel-${i + 1}.png`, href: '#', alt: `輪播圖 ${i + 2}` }))
        ],
        banner: '',
        backgroundImage: '',
        videoThumbnails: [],
        programThumbnails: [],
        buttonLinks: [],
        toolIcons: [],
        routeLinks: []
      }
    }
  }

  // 保持向后兼容的方法
  async getCarouselSlides(): Promise<string[]> {
    const config = await this.getConfig()
    return config.carouselSlides.map(slide => slide.image)
  }

  async getBanner(): Promise<string | BannerConfig> {
    const config = await this.getConfig()
    return config.banner
  }
}

export const carouselService = new CarouselService()