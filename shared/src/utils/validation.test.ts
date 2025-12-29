import { describe, it, expect } from 'vitest'
import { validateImageFile, validateImageFileStrict, formatFileSize, validateAssetPath, isValidUrl, UploadError } from './validation'
import { UploadErrorType } from '../types'

describe('validation utils', () => {
  describe('validateImageFile', () => {
    it('should accept valid PNG file', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      const result = validateImageFile(file)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept valid JPEG file', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const result = validateImageFile(file)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid file type', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' })
      const result = validateImageFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('不支援的檔案格式')
    })

    it('should reject file that is too large', () => {
      // 建立一個超過 5MB 的檔案
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' })
      const result = validateImageFile(largeFile)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('檔案大小超過限制')
    })
  })

  describe('validateImageFileStrict', () => {
    it('should accept valid PNG file', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      expect(() => validateImageFileStrict(file)).not.toThrow()
    })

    it('should accept valid JPEG file', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      expect(() => validateImageFileStrict(file)).not.toThrow()
    })

    it('should throw UploadError for invalid file type', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' })
      expect(() => validateImageFileStrict(file)).toThrow(UploadError)
      
      try {
        validateImageFileStrict(file)
      } catch (error) {
        expect(error).toBeInstanceOf(UploadError)
        expect((error as UploadError).type).toBe(UploadErrorType.INVALID_FORMAT)
      }
    })

    it('should throw UploadError for file that is too large', () => {
      // 建立一個超過 5MB 的檔案
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' })
      
      expect(() => validateImageFileStrict(largeFile)).toThrow(UploadError)
      
      try {
        validateImageFileStrict(largeFile)
      } catch (error) {
        expect(error).toBeInstanceOf(UploadError)
        expect((error as UploadError).type).toBe(UploadErrorType.FILE_TOO_LARGE)
      }
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })
  })

  describe('validateAssetPath', () => {
    it('should accept valid asset paths', () => {
      expect(validateAssetPath('logo')).toBe(true)
      expect(validateAssetPath('buttonLinks.0.default')).toBe(true)
      expect(validateAssetPath('titles.recommendedRoutes')).toBe(true)
    })

    it('should reject invalid asset paths', () => {
      expect(validateAssetPath('123invalid')).toBe(false)
      expect(validateAssetPath('.invalid')).toBe(false)
      expect(validateAssetPath('invalid-path')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should accept valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('/assets/image.png')).toBe(true)
      expect(isValidUrl('./relative/path.png')).toBe(true)
      expect(isValidUrl('../parent/path.png')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })
})