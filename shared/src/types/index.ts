import type { CSSProperties } from 'vue'

// Asset Manifest 型別定義
export interface AssetManifest {
  logo: string
  banner: string
  buttonLinks: ButtonLink[]
  carouselSlides: string[]
  titles: TitleImages
  routeLinks: RouteLinks
  toolIcons: ToolIcon[]
  videoThumbnails: string[]
  programThumbnails: string[]
  floatAdButtons: FloatAdButton[]
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

export interface RouteLinks {
  default: string
  hover: string
}

export interface ToolIcon {
  id: string
  default: string
  hover: string
  alt: string
}

export interface FloatAdButton {
  id: string
  default: string
  hover: string
  alt: string
}

// 組件 Props 型別定義
export interface ImageComponentProps {
  src: string
  alt?: string
  loading?: 'lazy' | 'eager'
  fallback?: string
  className?: string
  style?: CSSProperties
}

export interface EditableImageProps extends ImageComponentProps {
  editable: boolean
  assetPath: string
  assetType: 'single' | 'button' | 'carousel' | 'array'
  uploadEndpoint: string
}

export interface WysiwygEditorProps {
  mode: 'edit' | 'preview'
  assetManifest: AssetManifest
  apiBaseUrl: string
}

// 圖片載入狀態
export type ImageLoadState = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseImageLoaderOptions {
  maxRetries?: number
  retryDelay?: number
}

// API 資料模型
export interface ImageUploadRequest {
  file: File
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

// WebSocket 事件
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

// 錯誤處理
export enum UploadErrorType {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

export enum SyncErrorType {
  CONNECTION_LOST = 'CONNECTION_LOST',
  CONFIG_CONFLICT = 'CONFIG_CONFLICT',
  INVALID_CONFIG = 'INVALID_CONFIG',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

export interface SyncError extends Error {
  type: SyncErrorType
  retryable: boolean
  retryAfter?: number
}