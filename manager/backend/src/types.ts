// 共享型別定義，與前端保持一致
export interface AssetManifest {
  logo: string
  banner: {
    pc: string
    tablet: string
    mobile: string
  }
  backgroundImage?: string
  headerStyles: VisualStylesConfig
  recommendStyles: VisualStylesConfig
  headerCss?: string
  recommendContentCss?: string
  buttonLinks: ButtonLinkConfig[]
  carouselSlides: CarouselSlide[]
  titles: TitleImages
  routeLinks: RouteLinkItem[]
  toolIcons: ToolIcon[]
  videoThumbnails: VideoThumbnail[]
  programThumbnails: ProgramThumbnail[]
  floatAdButtons: FloatAdButton[]
  pageLayout?: string[]
  programmeLayout?: string[]
}

export interface ButtonLinkConfig {
  text: string
  href: string
  target: string
  defaultImage?: string
  hoverImage?: string
}

export interface CarouselSlide {
  image: string
  title?: string
  description?: string
  href: string
  alt?: string
}

export interface VideoThumbnail {
  image: string
  href: string
  title: string
  alt: string
}

export interface ProgramThumbnail {
  image: string
  href: string
  title: string
  alt: string
}

export interface ButtonLink {
  id: string
  default: string
  hover: string
  alt: string
}

export interface TitleImages {
  recommendedRoutes: string
  recommendedBrowsers: string
  selectedVideos: string
  hotPrograms: string
}

export interface RouteLinkItem {
  default: string
  hover: string
  href?: string
}

// Deprecated: old interface
export interface RouteLinks {
  default: string
  hover: string
}

export interface ToolIcon {
  href: string
  default: string
  hover: string
}

export interface FloatAdButton {
  href: string
  default: string
  hover: string
  tablet?: string
  mobile?: string
}

// API 請求/回應型別
export interface ImageUploadRequest {
  file: Express.Multer.File
  assetPath: string
  assetType: 'single' | 'button' | 'carousel' | 'array'
  position?: number
}

export interface ImageUploadResponse {
  success: boolean
  data?: {
    filename: string
    path: string
    size: number
    mimetype: string
  }
  error?: string
}

// WebSocket 事件型別
export interface ConfigUpdateEvent {
  type: 'asset_update'
  timestamp: number
  changes: {
    path: string
    oldValue: any
    newValue: any
  }[]
  manifest: AssetManifest
}

// 錯誤型別
export enum UploadErrorType {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

export class UploadError extends Error {
  public type: UploadErrorType
  public details?: any

  constructor(message: string, options: { type: UploadErrorType; details?: any }) {
    super(message)
    this.name = 'UploadError'
    this.type = options.type
    this.details = options.details
  }
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