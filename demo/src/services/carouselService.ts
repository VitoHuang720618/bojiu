// 简单的轮播图和banner API服务
class CarouselService {
  private baseUrl = 'http://localhost:3005'

  async getConfig(): Promise<{
    carouselSlides: {image: string, href: string, alt: string}[], 
    banner: string,
    backgroundImage: string,
    videoThumbnails: ({image: string, href: string, alt: string, title: string} | null)[],
    programThumbnails: ({image: string, href: string, alt: string, title: string} | null)[]
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/config`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`)
      }

      const config = await response.json()
      return {
        carouselSlides: config.carouselSlides || [],
        banner: config.banner || '',
        backgroundImage: config.backgroundImage || '',
        videoThumbnails: config.videoThumbnails || [],
        programThumbnails: config.programThumbnails || []
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
            image: '/assets/images/3f553531-765d-40fb-80ac-78f33c9897cd.png',
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
        programThumbnails: []
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