// 檔案上傳限制
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg']
export const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg']

// 預設圖片
export const DEFAULT_FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NS4zMzMzIDY2LjY2NjdIMTE0LjY2N1Y4My4zMzMzSDg1LjMzMzNWNjYuNjY2N1oiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+CjxwYXRoIGQ9Ik05Mi42NjY3IDc0SDEwNy4zMzNWODMuMzMzM0g5Mi42NjY3Vjc0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'

// WebSocket 事件名稱
export const WEBSOCKET_EVENTS = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  CONFIG_UPDATED: 'config_updated',
  UPLOAD_PROGRESS: 'upload_progress',
  CONNECTION_STATUS: 'connection_status',
} as const

// API 端點
export const API_ENDPOINTS = {
  CONFIG: '/api/config',
  UPLOAD: '/api/upload',
  ASSETS: '/api/assets',
} as const

// 重試配置
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BACKOFF_MULTIPLIER: 2,
} as const