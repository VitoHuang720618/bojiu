export interface BannerConfig {
  pc: string
  tablet: string
  mobile: string
}

export interface ConfigData {
  logo: string
  banner: string | BannerConfig
  backgroundImage: string
  buttonLinks: Array<{
    text: string
    href: string
    target: string
    image?: string
    defaultImage?: string
    hoverImage?: string
  }>
  carouselSlides: Array<{
    image: string
    title: string
    description: string
    href: string
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
    href: string
    default: string
    hover: string
  }>
  videoThumbnails: Array<{
    image: string
    href: string
    title: string
    alt: string
  }>
  programThumbnails: Array<{
    image: string
    href: string
    title: string
    alt: string
  }>
  floatAdButtons: Array<{
    href: string
    default: string
    hover: string
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
  private baseUrl: string

  constructor() {
    // Use environment variable or default to relative path for container deployment
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    // Remove trailing slash if present
    this.baseUrl = this.baseUrl.replace(/\/$/, '')
  }

  // Helper method to get auth headers
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token')
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  // 獲取配置
  async getConfig(): Promise<ConfigData> {
    const response = await fetch(`${this.baseUrl}/config`, {
      headers: this.getAuthHeaders()
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`)
    }
    return response.json()
  }

  // 更新配置
  async updateConfig(config: ConfigData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/config`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config)
    })

    if (!response.ok) {
      throw new Error(`Failed to update config: ${response.statusText}`)
    }
  }

  // Helper method to get auth headers for FormData
  private getAuthHeadersForFormData(): HeadersInit {
    const token = localStorage.getItem('auth_token')
    const headers: HeadersInit = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  // 上傳圖片
  async uploadImage(file: File, assetPath?: string, assetType?: string, position?: number): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    if (assetPath) formData.append('assetPath', assetPath)
    if (assetType) formData.append('assetType', assetType)
    if (position !== undefined) formData.append('position', position.toString())

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: this.getAuthHeadersForFormData(),
      body: formData
    })

    return response.json()
  }

  // 更新特定資產路徑
  async updateAssetPath(path: string, value: any): Promise<void> {
    const response = await fetch(`${this.baseUrl}/asset/${path}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ value })
    })

    if (!response.ok) {
      throw new Error(`Failed to update asset: ${response.statusText}`)
    }
  }
}

export const configService = new ConfigService()