/**
 * 檔案清理服務
 * 負責管理 uploads 目錄中的圖片檔案，清理未使用的檔案，並支援覆蓋舊檔案
 */

import fs from 'fs'
import path from 'path'
import type { AssetManifest } from './types.js'

/**
 * 清理結果介面
 */
export interface CleanupResult {
  deletedFiles: string[]
  unusedFiles: string[]
  totalFilesBefore: number
  totalFilesAfter: number
  freedSpace: number
}

/**
 * 清理報告介面
 */
export interface CleanupReport {
  totalFiles: number
  referencedFiles: number
  unusedFiles: number
  freedSpace: number
  details: Array<{
    file: string
    status: 'deleted' | 'referenced'
    size: number
  }>
}

/**
 * 檔案關鍵字組
 */
interface FileKeywords {
  base: string[]
  keywords: string[]
}

export class FileCleanupService {
  private uploadDir: string

  constructor(uploadDir: string) {
    this.uploadDir = uploadDir

    // 確保 uploads 目錄存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  /**
   * 查找所有符合 assetPath 的檔案
   * 使用模糊匹配，允許檔案名稱差異
   *
   * @param assetPath 資產路徑，例如 "banner.pc"
   * @returns 符合的檔案名稱陣列
   */
  findMatchingFiles(assetPath: string): string[] {
    if (!assetPath) return []

    // 將 assetPath 轉換為小寫以便不區分大小寫
    const searchPath = assetPath.toLowerCase()

    // 取代點號為破折號（assetPath 格式 "banner.pc" → "banner-pc"）
    const normalizedPath = searchPath.replace(/\./g, '-')

    const allFiles = fs.readdirSync(this.uploadDir)
    const matchingFiles = allFiles.filter(file => {
      const fileName = file.toLowerCase()

      // 檢查檔名是否包含 normalizedPath
      return fileName.includes(normalizedPath) ||
             fileName.includes(searchPath) ||
             fileName.includes(normalizedPath.replace(/-\d+/, '')) // 移除時間戳記
    })

    return matchingFiles.sort()
  }

  /**
   * 提取檔案名稱的關鍵字組
   *
   * @param filename 檔案名稱
   * @returns 檔案關鍵字組
   */
  private getFileKeywords(filename: string): FileKeywords {
    const fileName = filename.toLowerCase()
    const extension = path.extname(filename).toLowerCase()

    // 移除副檔名
    const nameWithoutExt = fileName.replace(extension, '')

    // 移除時間戳記（如 -1713912345678）
    const baseName = nameWithoutExt.replace(/-\d{10,}/g, '')

    // 移除後綴
    const suffixes = ['-default', '-hover', '-defaultimage', '-hoverimage', '-image', '-webp', '.png', '.jpg', '.jpeg', '.webp']
    const keywords = baseName.split('-').filter(word => word && word !== 'upload')

    return {
      base: [baseName],
      keywords: keywords
    }
  }

  /**
   * 檢查檔案是否在配置中被引用
   *
   * @param filename 檔案名稱
   * @param manifest 資產配置
   * @returns 是否被引用
   */
  isFileReferenced(filename: string, manifest: AssetManifest): boolean {
    if (!filename) return false

    const keywords = this.getFileKeywords(filename)

    // 遍歷配置中的所有路徑
    const jsonPaths = this.getAllAssetPaths(manifest)

    // 檢查每個路徑是否指向此檔案
    return jsonPaths.some(jsonPath => {
      if (!jsonPath) return false

      const url = jsonPath.toLowerCase()

      // 檢查 URL 是否包含檔案名稱
      return url.includes(filename.toLowerCase()) ||
             url.includes(keywords.keywords.join('-'))
    })
  }

  /**
   * 根據 assetPath 找配置中所有引用的檔案路徑
   *
   * @param manifest 資產配置
   * @param assetPath 資產路徑
   * @returns 引用的檔案路徑陣列
   */
  getReferencedPaths(manifest: AssetManifest, assetPath?: string): string[] {
    const jsonPaths = this.getAllAssetPaths(manifest)

    // 如果指定了 assetPath，過濾出相關的路徑
    if (assetPath) {
      const searchPath = assetPath.toLowerCase()
      return jsonPaths.filter(jsonPath => {
        if (!jsonPath) return false

        const url = jsonPath.toLowerCase()
        return url.includes(searchPath) ||
               url.includes(assetPath)
      })
    }

    return jsonPaths
  }

  /**
   * 取得配置中所有資產路徑
   *
   * @param manifest 資產配置
   * @returns 所有路徑陣列
   */
  private getAllAssetPaths(manifest: AssetManifest): string[] {
    const paths: string[] = []

    // Helper 函數來提取路徑
    const extractPaths = (obj: any, prefix: string = '') => {
      if (typeof obj !== 'object' || obj === null) {
        if (obj) {
          paths.push(obj)
        }
        return
      }

      for (const [key, value] of Object.entries(obj)) {
        const currentPath = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'object' && value !== null) {
          extractPaths(value, currentPath)
        } else if (value && typeof value === 'string') {
          paths.push(value)
        }
      }
    }

    extractPaths(manifest)

    return paths
  }

  /**
   * 清理未使用的檔案
   *
   * @param manifest 資產配置
   * @returns 清理結果
   */
  async cleanupUnusedAssets(manifest: AssetManifest): Promise<CleanupResult> {
    const startTime = Date.now()
    const totalFilesBefore = this.getTotalFiles()
    const allFiles = fs.readdirSync(this.uploadDir)

    // 找出所有被引用的檔案
    const referencedPaths = this.getReferencedPaths(manifest)
    const referencedFiles = new Set<string>()

    referencedPaths.forEach(path => {
      if (!path) return

      // 從路徑中提取檔案名稱（/uploads/filename.png → filename.png）
      const filename = path.split('/').pop()
      if (filename) {
        referencedFiles.add(filename)
      }
    })

    // 找出未使用的檔案
    const unusedFiles = allFiles.filter(file => {
      const filePath = path.join(this.uploadDir, file)

      // 跳過隱藏檔案
      if (file.startsWith('.')) return false

      // 跳過資料庫檔案
      if (file.endsWith('.db') || file.endsWith('.db-shm') || file.endsWith('.db-wal')) return false

      // 如果檔案被引用，跳過
      if (referencedFiles.has(file)) return false

      // 檢查檔案是否實際存在且可讀
      try {
        return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
      } catch {
        return false
      }
    })

    // 刪除未使用的檔案
    const deletedFiles: string[] = []
    let freedSpace = 0

    for (const file of unusedFiles) {
      const filePath = path.join(this.uploadDir, file)

      try {
        const stats = fs.statSync(filePath)
        freedSpace += stats.size

        fs.unlinkSync(filePath)
        deletedFiles.push(file)

        console.log(`[FileCleanup] 已刪除未使用檔案: ${file}`)
      } catch (error) {
        console.error(`[FileCleanup] 刪除檔案失敗 ${file}:`, error)
      }
    }

    const totalFilesAfter = this.getTotalFiles()
    const elapsedTime = Date.now() - startTime

    console.log(`[FileCleanup] 清理完成`)
    console.log(`[FileCleanup] 刪除檔案: ${deletedFiles.length}/${totalFilesBefore}`)
    console.log(`[FileCleanup] 釋放空間: ${this.formatBytes(freedSpace)}`)
    console.log(`[FileCleanup] 耗時: ${elapsedTime}ms`)

    return {
      deletedFiles,
      unusedFiles,
      totalFilesBefore,
      totalFilesAfter,
      freedSpace
    }
  }

  /**
   * 覆蓋舊檔案（上傳時使用）
   *
   * @param assetPath 資產路徑
   * @returns 被刪除的舊檔案名稱，如果沒有則返回 null
   */
  async overwriteOldFile(assetPath: string): Promise<string | null> {
    if (!assetPath) return null

    const matchingFiles = this.findMatchingFiles(assetPath)

    if (matchingFiles.length === 0) {
      return null
    }

    // 刪除所有匹配的檔案
    for (const file of matchingFiles) {
      const filePath = path.join(this.uploadDir, file)

      try {
        fs.unlinkSync(filePath)
        console.log(`[FileCleanup] 覆蓋舊檔案: ${file}`)
      } catch (error) {
        console.error(`[FileCleanup] 刪除舊檔案失敗 ${file}:`, error)
      }
    }

    // 返回第一個檔案名稱（如果有）
    return matchingFiles[0] || null
  }

  /**
   * 生成清理報告
   *
   * @param files 所有檔案名稱
   * @param referencedPaths 被引用的路徑
   * @returns 清理報告
   */
  generateCleanupReport(files: string[], referencedPaths: string[]): CleanupReport {
    const totalFiles = files.length
    const referencedFiles = new Set<string>()

    referencedPaths.forEach(path => {
      if (!path) return

      const filename = path.split('/').pop()
      if (filename) {
        referencedFiles.add(filename)
      }
    })

    const unusedFiles = files.filter(file => !referencedFiles.has(file))
    let freedSpace = 0

    for (const file of unusedFiles) {
      const filePath = path.join(this.uploadDir, file)
      try {
        freedSpace += fs.statSync(filePath).size
      } catch {
        // 跳過無法存取的檔案
      }
    }

    const details = files.map(file => {
      const isReferenced = referencedFiles.has(file)
      const filePath = path.join(this.uploadDir, file)

      return {
        file,
        status: (isReferenced ? 'referenced' : 'deleted') as 'deleted' | 'referenced',
        size: isReferenced ? 0 : (fs.existsSync(filePath) ? fs.statSync(filePath).size : 0)
      }
    })

    return {
      totalFiles,
      referencedFiles: referencedFiles.size,
      unusedFiles: unusedFiles.length,
      freedSpace,
      details
    }
  }

  /**
   * 獲取 uploads 目錄總檔案數
   *
   * @returns 檔案總數
   */
  getTotalFiles(): number {
    try {
      const files = fs.readdirSync(this.uploadDir)
      // 排除隱藏檔案和資料庫檔案
      return files.filter(file =>
        !file.startsWith('.') &&
        !file.endsWith('.db') &&
        !file.endsWith('.db-shm') &&
        !file.endsWith('.db-wal')
      ).length
    } catch {
      return 0
    }
  }

  /**
   * 獲取 uploads 目錄總大小
   *
   * @returns 總大小（字節）
   */
  getTotalSize(): number {
    try {
      const files = fs.readdirSync(this.uploadDir)
      let totalSize = 0

      for (const file of files) {
        const filePath = path.join(this.uploadDir, file)
        try {
          totalSize += fs.statSync(filePath).size
        } catch {
          // 跳過無法存取的檔案
        }
      }

      return totalSize
    } catch {
      return 0
    }
  }

  /**
   * 格式化字節大小為可讀格式
   *
   * @param bytes 字節數
   * @returns 格式化後的大小字串
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 列出所有檔案（用於調試）
   *
   * @returns 檔案列表
   */
  listFiles(): string[] {
    try {
      const files = fs.readdirSync(this.uploadDir)
      return files.filter(file =>
        !file.startsWith('.') &&
        !file.endsWith('.db') &&
        !file.endsWith('.db-shm') &&
        !file.endsWith('.db-wal')
      )
    } catch {
      return []
    }
  }
}
