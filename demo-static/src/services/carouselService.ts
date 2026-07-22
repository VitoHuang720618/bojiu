import type { BannerConfig } from '../types'

type HeaderStylesConfig = {
  height?: number
  backgroundMode: 'solid' | 'gradient'
  solidColor: string
  opacity: number
  gradient: { color1: string, color2: string, angle: number }
  boxShadow: { enabled: boolean, x: number, y: number, blur: number, spread: number, color: string, opacity: number }
}

const defaultHeaderStyles: HeaderStylesConfig = {
  height: 75,
  backgroundMode: 'gradient',
  solidColor: '#3041b9',
  opacity: 1,
  gradient: { color1: '#3041b9', color2: '#081fb3', angle: 0 },
  boxShadow: { enabled: true, x: 0, y: 0, blur: 20, spread: 0, color: '#000000', opacity: 0.3 }
}

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
    logo: string,
    carouselSlides: { image: string, href: string, alt: string }[],
    banner: string | BannerConfig,
    backgroundImage: string,
    backgroundSettings: {
      displayMode: 'repeat' | 'contain' | 'fit-width',
      topBorderEnabled: boolean,
      topBorderColor: string,
      topBorderWidth: number
    },
    headerStyles: HeaderStylesConfig,
    headerBackgroundRgba: string,
    headerCss: string,
    recommendContentBackground: string,
    recommendContentCss: string,
    sectionColors: {
      recommendFooterTitleBackground: string,
      recommendFooterItemBackground: string,
      recommendFooterItemHoverBackground: string,
      recommendFooterTopBorderColor: string,
      thumbnailTitleBackground: string,
      thumbnailBorderColor: string,
      thumbnailTextColor: string,
      footerBackground: string
    },
    titles: {
        recommendedRoutes: string
        recommendedBrowsers: string
        selectedVideos: string
        hotPrograms: string
    },
    videoThumbnails: ({ image: string, href: string, alt: string, title: string } | null)[],
    programThumbnails: ({ image: string, href: string, alt: string, title: string } | null)[],
    buttonLinks: ({ text: string, href: string, target: string, defaultImage?: string, hoverImage?: string } | null)[],
    toolIcons: ({ id: string, default: string, hover: string, alt: string, href: string } | null)[],
    floatAdButtons?: ({ default: string, hover: string, href: string, alt: string, tablet?: string, mobile?: string } | null)[],
    routeLinks?: Array<{ default: string, hover: string, href: string }> | null,
    pageLayout?: string[],
    programmeLayout?: string[]
  }> {
    try {
      // 检查是否启用了 API
      const {
        siteConfig,
        assetsState, // Import assetsState
        carouselSlides,
        banner,
        videoThumbnails,
        programThumbnails,
        buttonLinks,
        recommendedTools,
        floatAdButtons,
        routeLinksImages,
        titles,
        assetManifest,
        sectionColors,
        pageLayout,
        programmeLayout
      } = await import('../config/siteConfig')

      if (siteConfig.useApi === false) {
        // Return static data from config
        return {
          logo: assetsState.logo,
          carouselSlides,
          banner,
          backgroundImage: assetsState.backgroundImage,
          headerStyles: assetsState.headerStyles,
          headerBackgroundRgba: assetsState.headerBackgroundRgba,
          headerCss: assetsState.headerCss,
          recommendContentBackground: assetsState.recommendContentBackground,
          recommendContentCss: assetsState.recommendContentCss,
          sectionColors,
          titles: {
            recommendedRoutes: titles.recommendedRoutes || assetManifest.titles.recommendedRoutes,
            recommendedBrowsers: titles.recommendedBrowsers || assetManifest.titles.recommendedBrowsers,
            selectedVideos: titles.selectedVideos || assetManifest.titles.selectedVideos,
            hotPrograms: titles.hotPrograms || assetManifest.titles.hotPrograms
          },
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
            alt: f.name,
            tablet: f.tablet,
            mobile: f.mobile
          })),
          routeLinks: routeLinksImages as any,
          pageLayout: pageLayout,
          programmeLayout: programmeLayout
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

      // The manager stores the recommendation block background as a structured
      // `recommendStyles` value. Published static settings already contain the
      // pre-rendered CSS string, so support both representations.
      const getRecommendContentBackground = () => {
        if (config.recommendContentBackground) return config.recommendContentBackground

        const styles = config.recommendStyles
        if (styles?.backgroundMode === 'solid' && styles.solidColor) {
          const hex = styles.solidColor.replace('#', '')
          if (/^[0-9a-fA-F]{6}$/.test(hex)) {
            const red = parseInt(hex.slice(0, 2), 16)
            const green = parseInt(hex.slice(2, 4), 16)
            const blue = parseInt(hex.slice(4, 6), 16)
            return `rgba(${red}, ${green}, ${blue}, ${styles.opacity ?? 1})`
          }
        }

        if (styles?.backgroundMode === 'gradient' && styles.gradient) {
          const { angle, color1, color2 } = styles.gradient
          if (color1 && color2) {
            return `linear-gradient(${angle ?? 0}deg, ${color1} 0%, ${color2} 100%)`
          }
        }

        return 'rgba(20, 10, 104, 1.0)'
      }

      return {
        logo: processImageUrl(config.logo || ''),
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
        backgroundSettings: {
          displayMode: config.backgroundSettings?.displayMode || 'repeat',
          topBorderEnabled: config.backgroundSettings?.topBorderEnabled ?? true,
          topBorderColor: config.backgroundSettings?.topBorderColor || '#dfb082',
          topBorderWidth: config.backgroundSettings?.topBorderWidth ?? 4
        },
        headerStyles: config.headerStyles || defaultHeaderStyles,
        headerBackgroundRgba: config.headerBackgroundRgba || 'linear-gradient(0deg, #3041b9 0%, #081fb3 100%)',
        headerCss: config.headerCss || '',
        recommendContentBackground: getRecommendContentBackground(),
        recommendContentCss: config.recommendContentCss || '',
        sectionColors: config.sectionColors || {
          recommendFooterTitleBackground: '#200cc5',
          recommendFooterItemBackground: '#221e1e',
          recommendFooterItemHoverBackground: '#3625c3',
          recommendFooterTopBorderColor: '#dfb082',
          thumbnailTitleBackground: '#3b27de',
          thumbnailBorderColor: '#f8eec9',
          thumbnailTextColor: '#ffffff',
          footerBackground: '#060417'
        },
        titles: {
          recommendedRoutes: processImageUrl(config.titles?.recommendedRoutes || ''),
          recommendedBrowsers: processImageUrl(config.titles?.recommendedBrowsers || ''),
          selectedVideos: processImageUrl(config.titles?.selectedVideos || ''),
          hotPrograms: processImageUrl(config.titles?.hotPrograms || '')
        },
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
            hover: processImageUrl(button.hover),
            tablet: processImageUrl(button.tablet),
            mobile: processImageUrl(button.mobile)
          } : null
        ),
        routeLinks: Array.isArray(config.routeLinks) ? config.routeLinks.map((route: any) => ({
          default: processImageUrl(route.default),
          hover: processImageUrl(route.hover),
          href: route.href || ''
        })) : null,
        pageLayout: config.pageLayout,
        programmeLayout: config.programmeLayout
      }
    } catch (error: any) {
      // 这里不再打印 Error，保持主控台干净
      if (error?.message !== 'API is disabled via config') {
        console.error('Failed to fetch config from API:', error)
      }

      // 返回默认数据作为后备
      return {
        logo: '',
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
        backgroundSettings: {
          displayMode: 'repeat',
          topBorderEnabled: true,
          topBorderColor: '#dfb082',
          topBorderWidth: 4
        },
        headerStyles: defaultHeaderStyles,
        headerBackgroundRgba: 'linear-gradient(0deg, #3041b9 0%, #081fb3 100%)',
        headerCss: '',
        recommendContentBackground: 'rgba(20, 10, 104, 1.0)',
        recommendContentCss: '',
        sectionColors: {
          recommendFooterTitleBackground: '#200cc5',
          recommendFooterItemBackground: '#221e1e',
          recommendFooterItemHoverBackground: '#3625c3',
          recommendFooterTopBorderColor: '#dfb082',
          thumbnailTitleBackground: '#3b27de',
          thumbnailBorderColor: '#f8eec9',
          thumbnailTextColor: '#ffffff',
          footerBackground: '#060417'
        },
        titles: {
          recommendedRoutes: '',
          recommendedBrowsers: '',
          selectedVideos: '',
          hotPrograms: ''
        },
        videoThumbnails: [],
        programThumbnails: [],
        buttonLinks: [],
        toolIcons: [],
        floatAdButtons: [],
        routeLinks: [],
        pageLayout: [],
        programmeLayout: []
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
