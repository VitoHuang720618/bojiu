// 配置管理服務
export interface ConfigData {
  logo: string
  banner: string
  backgroundImage: string
  buttonLinks: Array<{
    id: string
    default: string
    hover: string
    alt: string
  }>
  carouselSlides: Array<{
    image: string
    href: string
    alt: string
  }>
  titles: {
    recommendedRoutes: string
    recommendedBrowsers: string
    selectedVideos: string
    hotPrograms: string
  }
  routeLinks: {
    default: string
    hover: string
  }
  toolIcons: Array<{
    id: string
    default: string
    hover: string
    alt: string
  }>
  videoThumbnails: Array<{
    image: string
    href: string
    alt: string
    title: string
  }>
  programThumbnails: Array<{
    image: string
    href: string
    alt: string
    title: string
  }>
  floatAdButtons: Array<{
    id: string
    default: string
    hover: string
    alt: string
  }>
}

export interface UploadResponse {
  success: boolean
  data?: {
    filename: string
    path: string
    size: number
    mimetype: string
  }
  error?: string
}

class ConfigService {
  private baseUrl = 'http://localhost:3005'

  // 獲取配置
  async getConfig(): Promise<ConfigData> {
    const response = await fetch(`${this.baseUrl}/api/config`)
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`)
    }
    return response.json()
  }

  // 更新配置
  async updateConfig(config: ConfigData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update config: ${response.statusText}`)
    }
  }

  // 上傳圖片
  async uploadImage(file: File, assetPath?: string, assetType?: string, position?: number): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (assetPath) formData.append('assetPath', assetPath)
    if (assetType) formData.append('assetType', assetType)
    if (position !== undefined) formData.append('position', position.toString())

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData
    })

    return response.json()
  }

  // 更新特定資產路徑
  async updateAssetPath(path: string, value: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/asset/${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value })
    })

    if (!response.ok) {
      throw new Error(`Failed to update asset: ${response.statusText}`)
    }
  }
}

export const configService = new ConfigService()