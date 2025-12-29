import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { validateImageFile, validateImageFileStrict, validateAssetPath } from '../validation.js'
import { UploadError, UploadErrorType } from '../types.js'

describe('Validation Property Tests', () => {
  /**
   * 屬性 5: 檔案格式驗證
   * 對於任何上傳的檔案，系統應該只接受 PNG、JPG 或 JPEG 格式的圖片檔案
   * 驗證需求: Requirements 2.2
   */
  describe('Property 5: File format validation', () => {
    it('should accept valid image formats', () => {
      fc.assert(fc.property(
        fc.constantFrom('image/png', 'image/jpg', 'image/jpeg'),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 5 * 1024 * 1024 }), // 1B to 5MB
        (mimetype, filename, size) => {
          const mockFile = {
            mimetype,
            originalname: filename,
            size,
            buffer: Buffer.alloc(size),
            fieldname: 'file',
            encoding: '7bit',
            destination: '',
            filename: '',
            path: '',
            stream: null as any
          } as Express.Multer.File

          const result = validateImageFile(mockFile)
          expect(result.isValid).toBe(true)
          expect(result.error).toBeUndefined()
        }
      ), { numRuns: 50 })
    })

    it('should reject invalid image formats', () => {
      fc.assert(fc.property(
        fc.constantFrom('text/plain', 'application/pdf', 'video/mp4', 'audio/mp3', 'image/gif', 'image/svg+xml'),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
        (mimetype, filename, size) => {
          const mockFile = {
            mimetype,
            originalname: filename,
            size,
            buffer: Buffer.alloc(size),
            fieldname: 'file',
            encoding: '7bit',
            destination: '',
            filename: '',
            path: '',
            stream: null as any
          } as Express.Multer.File

          const result = validateImageFile(mockFile)
          expect(result.isValid).toBe(false)
          expect(result.error).toContain('不支援的檔案格式')
        }
      ), { numRuns: 30 })
    })

    it('should reject files that are too large', () => {
      fc.assert(fc.property(
        fc.constantFrom('image/png', 'image/jpg', 'image/jpeg'),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 5 * 1024 * 1024 + 1, max: 50 * 1024 * 1024 }), // > 5MB
        (mimetype, filename, size) => {
          const mockFile = {
            mimetype,
            originalname: filename,
            size,
            buffer: Buffer.alloc(1024), // 不需要分配實際大小的 buffer
            fieldname: 'file',
            encoding: '7bit',
            destination: '',
            filename: '',
            path: '',
            stream: null as any
          } as Express.Multer.File

          const result = validateImageFile(mockFile)
          expect(result.isValid).toBe(false)
          expect(result.error).toContain('檔案大小超過限制')
        }
      ), { numRuns: 20 })
    })

    it('should throw UploadError for invalid formats in strict mode', () => {
      fc.assert(fc.property(
        fc.constantFrom('text/plain', 'application/pdf', 'video/mp4'),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
        (mimetype, filename, size) => {
          const mockFile = {
            mimetype,
            originalname: filename,
            size,
            buffer: Buffer.alloc(size),
            fieldname: 'file',
            encoding: '7bit',
            destination: '',
            filename: '',
            path: '',
            stream: null as any
          } as Express.Multer.File

          expect(() => validateImageFileStrict(mockFile)).toThrow(UploadError)
          
          try {
            validateImageFileStrict(mockFile)
          } catch (error) {
            expect(error).toBeInstanceOf(UploadError)
            expect((error as UploadError).type).toBe(UploadErrorType.INVALID_FORMAT)
          }
        }
      ), { numRuns: 20 })
    })

    it('should throw UploadError for oversized files in strict mode', () => {
      fc.assert(fc.property(
        fc.constantFrom('image/png', 'image/jpg', 'image/jpeg'),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 5 * 1024 * 1024 + 1, max: 50 * 1024 * 1024 }),
        (mimetype, filename, size) => {
          const mockFile = {
            mimetype,
            originalname: filename,
            size,
            buffer: Buffer.alloc(1024),
            fieldname: 'file',
            encoding: '7bit',
            destination: '',
            filename: '',
            path: '',
            stream: null as any
          } as Express.Multer.File

          expect(() => validateImageFileStrict(mockFile)).toThrow(UploadError)
          
          try {
            validateImageFileStrict(mockFile)
          } catch (error) {
            expect(error).toBeInstanceOf(UploadError)
            expect((error as UploadError).type).toBe(UploadErrorType.FILE_TOO_LARGE)
          }
        }
      ), { numRuns: 15 })
    })
  })

  /**
   * 屬性測試：資產路徑驗證
   * 對於任何資產路徑，系統應該驗證其格式正確性
   */
  describe('Asset path validation', () => {
    it('should accept valid asset paths', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z][a-zA-Z0-9.]*$/.test(s)),
        (path) => {
          expect(validateAssetPath(path)).toBe(true)
        }
      ), { numRuns: 100 })
    })

    it('should reject invalid asset paths', () => {
      fc.assert(fc.property(
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[0-9]/.test(s)), // 以數字開頭
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[^a-zA-Z]/.test(s) && !/^[0-9]/.test(s)), // 以非字母非數字開頭
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => /[^a-zA-Z0-9.]/.test(s)) // 包含無效字符
        ),
        (path) => {
          expect(validateAssetPath(path)).toBe(false)
        }
      ), { numRuns: 50 })
    })
  })

  /**
   * 屬性測試：檔案大小邊界條件
   * 驗證檔案大小驗證的邊界條件
   */
  describe('File size boundary conditions', () => {
    it('should handle boundary file sizes correctly', () => {
      const boundaryTests = [
        { size: 5 * 1024 * 1024, shouldPass: true }, // 正好 5MB
        { size: 5 * 1024 * 1024 - 1, shouldPass: true }, // 5MB - 1B
        { size: 5 * 1024 * 1024 + 1, shouldPass: false }, // 5MB + 1B
        { size: 0, shouldPass: true }, // 0 bytes
        { size: 1, shouldPass: true } // 1 byte
      ]

      boundaryTests.forEach(({ size, shouldPass }) => {
        const mockFile = {
          mimetype: 'image/png',
          originalname: 'test.png',
          size,
          buffer: Buffer.alloc(Math.min(size, 1024)),
          fieldname: 'file',
          encoding: '7bit',
          destination: '',
          filename: '',
          path: '',
          stream: null as any
        } as Express.Multer.File

        const result = validateImageFile(mockFile)
        expect(result.isValid).toBe(shouldPass)
        
        if (shouldPass) {
          expect(result.error).toBeUndefined()
        } else {
          expect(result.error).toContain('檔案大小超過限制')
        }
      })
    })
  })
})