import type { BannerConfig } from '../types'

class CarouselService {
  async getConfig(): Promise<any> {
    const {
      assetsState,
      carouselSlides,
      banner,
      videoThumbnails,
      programThumbnails,
      buttonLinks,
      recommendedTools,
      floatAdButtons,
      routeLinksImages
    } = await import('../config/siteConfig')

    // Always return static data from config
    return {
      logo: assetsState.logo,
      carouselSlides,
      banner,
      backgroundImage: assetsState.backgroundImage,
      videoThumbnails,
      programThumbnails,
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
      routeLinks: routeLinksImages as any
    }
  }

  async getCarouselSlides(): Promise<string[]> {
    const config = await this.getConfig()
    return config.carouselSlides.map((slide: any) => slide.image)
  }

  async getBanner(): Promise<string | BannerConfig> {
    const config = await this.getConfig()
    return config.banner
  }
}

export const carouselService = new CarouselService()