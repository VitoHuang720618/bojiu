import { apiService } from './api'

export interface BannerConfig {
  pc: string
  tablet: string
  mobile: string
}

// 視覺樣式配置介面
export interface VisualStylesConfig {
  height?: number
  backgroundMode: 'solid' | 'gradient'
  solidColor: string
  opacity: number
  gradient: {
    color1: string
    color2: string
    angle: number
  }
  boxShadow: {
    enabled: boolean
    x: number
    y: number
    blur: number
    spread: number
    color: string
    opacity: number
  }
}

export interface SectionColorsConfig {
  recommendFooterTitleBackground: string
  recommendFooterItemBackground: string
  recommendFooterItemHoverBackground: string
  thumbnailTitleBackground: string
  thumbnailBorderColor: string
  thumbnailTextColor: string
  footerBackground: string
}

export interface ConfigData {
  logo: string
  banner: string | BannerConfig
  backgroundImage: string
  headerStyles: VisualStylesConfig
  recommendStyles: VisualStylesConfig
  sectionColors: SectionColorsConfig
  headerCss: string
  recommendContentCss: string
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
  routeLinks: Array<{
    default: string
    hover: string
    href: string
  }>
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
    tablet: string
    mobile: string
  }>
  pageLayout?: string[]
  programmeLayout?: string[]
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
  // 獲取配置
  async getConfig(): Promise<ConfigData> {
    return apiService.request<ConfigData>('/config')
  }

  // 更新配置
  async updateConfig(config: ConfigData): Promise<void> {
    await apiService.request('/config', {
      method: 'POST',
      body: JSON.stringify(config)
    })
  }

  // 上傳圖片
  async uploadImage(file: File, assetPath?: string, assetType?: string, position?: number): Promise<UploadResponse> {
    const formData = new FormData()
    
    // IMPORTANT: Fields must be appended BEFORE the file for multer to see them in req.body during filename generation
    if (assetPath) formData.append('assetPath', assetPath)
    if (assetType) formData.append('assetType', assetType)
    if (position !== undefined) formData.append('position', position.toString())
    
    // The file should be the last field
    formData.append('file', file)

    // 使用 apiService.request 但要注意 Content-Type
    // 當 body 是 FormData 時，fetch 會自動設定 Content-Type 為 multipart/form-data 並加上 boundary
    // 所以我們必須明確移除 header 中的 Content-Type，避免 apiService 預設的 application/json 覆蓋它
    return apiService.request<UploadResponse>('/upload', {
      method: 'POST',
      body: formData
    })
  }

  // 更新特定資產路徑
  async updateAssetPath(path: string, value: any): Promise<void> {
    await apiService.request(`/asset/${path}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    })
  }

  // 發布配置為靜態預設值
  async publishConfig(): Promise<void> {
    await apiService.request('/publish', {
      method: 'POST'
    })
  }
}

export const configService = new ConfigService()
