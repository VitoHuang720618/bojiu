import { UploadError, UploadErrorType } from './types.js'

// 常數定義
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * 驗證上傳的檔案是否為有效的圖片格式
 */
export function validateImageFile(
  file: Express.Multer.File,
  options?: { maxSize?: number; allowedTypes?: string[] }
): { isValid: boolean; error?: string } {
  const maxSize = options?.maxSize || MAX_FILE_SIZE
  const allowedTypes = options?.allowedTypes || ALLOWED_IMAGE_TYPES

  try {
    // 檢查檔案類型
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `不支援的檔案格式: ${file.mimetype}`
      }
    }

    // 檢查檔案大小
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `檔案大小超過限制: ${formatFileSize(file.size)}`
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : '檔案驗證失敗'
    }
  }
}

/**
 * 驗證上傳的檔案是否為有效的圖片格式（拋出異常版本）
 */
export function validateImageFileStrict(file: Express.Multer.File): void {
  // 檢查檔案類型
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new UploadError(`不支援的檔案格式: ${file.mimetype}`, {
      type: UploadErrorType.INVALID_FORMAT,
      details: { allowedTypes: ALLOWED_IMAGE_TYPES }
    })
  }

  // 檢查檔案大小
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError(`檔案大小超過限制: ${formatFileSize(file.size)}`, {
      type: UploadErrorType.FILE_TOO_LARGE,
      details: { fileSize: file.size, maxSize: MAX_FILE_SIZE }
    })
  }
}

/**
 * 格式化檔案大小為可讀格式
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 驗證 Asset Path 格式
 */
export function validateAssetPath(path: string): boolean {
  // 基本格式檢查：應該以字母開頭，可包含點號和數字
  const pathRegex = /^[a-zA-Z][a-zA-Z0-9.]*$/
  return pathRegex.test(path)
}

/**
 * 建立 UploadError 實例
 */
export function createUploadError(message: string, type: UploadErrorType, details?: any): UploadError {
  return new UploadError(message, { type, details })
}