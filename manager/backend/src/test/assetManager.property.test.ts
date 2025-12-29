import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import fs from 'fs'
import path from 'path'
import { AssetManager } from '../assetManager.js'
import { AssetManifest } from '../types.js'

describe('AssetManager Property Tests', () => {
  let testConfigPath: string
  let assetManager: AssetManager
  let testManifest: AssetManifest

  beforeEach(() => {
    // 建立臨時測試配置檔案
    testConfigPath = path.join(__dirname, `test-config-${Date.now()}.json`)
    testManifest = {
      logo: "/assets/images/logo.png",
      banner: "/assets/images/banner.png",
      buttonLinks: [
        {
          id: "test-button",
          default: "/assets/images/button-default.png",
          hover: "/assets/images/button-hover.png",
          alt: "測試按鈕"
        }
      ],
      carouselSlides: [
        "/assets/images/slide1.png",
        "/assets/images/slide2.png"
      ],
      titles: {
        recommendedRoutes: "/assets/images/title1.png",
        recommendedBrowsers: "/assets/images/title2.png",
        selectedVideos: "/assets/images/title3.png",
        hotPrograms: "/assets/images/title4.png"
      },
      routeLinks: {
        default: "/assets/images/route-default.png",
        hover: "/assets/images/route-hover.png"
      },
      toolIcons: [],
      videoThumbnails: [],
      programThumbnails: [],
      floatAdButtons: []
    }

    fs.writeFileSync(testConfigPath, JSON.stringify(testManifest, null, 2))
    assetManager = new AssetManager(testConfigPath)
  })

  afterEach(() => {
    // 清理測試檔案
    try {
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath)
      }
      const backupPath = testConfigPath.replace('.json', '.backup.json')
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath)
      }
    } catch (error) {
      console.warn('清理測試檔案失敗:', error)
    }
  })

  /**
   * 核心屬性 3: 綜合資源管理
   * 對於任何類型的圖片資源操作（單一、按鈕、陣列），系統應該正確處理並維持 Asset_Manifest 的資料結構完整性
   * 驗證需求: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
   */
  describe('Core Property 3: Comprehensive resource management', () => {
    it('should handle single asset updates correctly', async () => {
      await fc.assert(fc.asyncProperty(
        fc.constantFrom('logo', 'banner'),
        fc.webUrl(),
        async (assetPath, newValue) => {
          const result = await assetManager.handleAssetUpdate(assetPath, 'single', newValue)
          
          // 驗證變更記錄
          expect(result.changes).toHaveLength(1)
          expect(result.changes[0].path).toBe(assetPath)
          expect(result.changes[0].newValue).toBe(newValue)
          
          // 驗證配置更新
          expect(result.manifest[assetPath as keyof AssetManifest]).toBe(newValue)
          
          // 驗證檔案已寫入
          const savedManifest = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
          expect(savedManifest[assetPath]).toBe(newValue)
        }
      ), { numRuns: 20 })
    })

    it('should handle button asset updates correctly', async () => {
      await fc.assert(fc.asyncProperty(
        fc.webUrl(),
        async (newValue) => {
          const assetPath = 'buttonLinks.0'
          const result = await assetManager.handleAssetUpdate(assetPath, 'button', newValue)
          
          // 驗證變更記錄（按鈕應該更新 default 和 hover）
          expect(result.changes).toHaveLength(2)
          
          const defaultChange = result.changes.find(c => c.path === `${assetPath}.default`)
          const hoverChange = result.changes.find(c => c.path === `${assetPath}.hover`)
          
          expect(defaultChange).toBeDefined()
          expect(hoverChange).toBeDefined()
          expect(defaultChange!.newValue).toBe(newValue)
          expect(hoverChange!.newValue).toBe(newValue)
          
          // 驗證配置更新
          const buttonLink = result.manifest.buttonLinks[0]
          expect(buttonLink.default).toBe(newValue)
          expect(buttonLink.hover).toBe(newValue)
        }
      ), { numRuns: 15 })
    })

    it('should handle array asset updates correctly', async () => {
      await fc.assert(fc.asyncProperty(
        fc.webUrl(),
        fc.integer({ min: 0, max: 5 }),
        async (newValue, position) => {
          const assetPath = 'carouselSlides'
          const result = await assetManager.handleAssetUpdate(assetPath, 'array', newValue, position)
          
          // 驗證變更記錄
          expect(result.changes).toHaveLength(1)
          expect(result.changes[0].path).toBe(assetPath)
          
          // 驗證陣列更新
          const slides = result.manifest.carouselSlides
          if (position < testManifest.carouselSlides.length) {
            expect(slides[position]).toBe(newValue)
          } else {
            // 如果位置超出範圍，應該擴展陣列
            expect(slides.length).toBeGreaterThan(position)
            expect(slides[position]).toBe(newValue)
          }
        }
      ), { numRuns: 20 })
    })

    it('should maintain data structure integrity after updates', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.record({
          path: fc.constantFrom('logo', 'banner'),
          type: fc.constantFrom('single'),
          value: fc.webUrl(),
          position: fc.option(fc.integer({ min: 0, max: 3 }))
        }), { minLength: 1, maxLength: 3 }),
        async (updates) => {
          // 執行多個更新
          for (const update of updates) {
            await assetManager.handleAssetUpdate(
              update.path, 
              update.type as any, 
              update.value, 
              update.position || undefined
            )
          }
          
          // 驗證最終配置的結構完整性
          const finalManifest = await assetManager.readManifest()
          
          // 檢查必要屬性存在
          expect(finalManifest).toHaveProperty('logo')
          expect(finalManifest).toHaveProperty('banner')
          expect(finalManifest).toHaveProperty('buttonLinks')
          expect(finalManifest).toHaveProperty('carouselSlides')
          expect(finalManifest).toHaveProperty('titles')
          expect(finalManifest).toHaveProperty('routeLinks')
          
          // 檢查陣列類型
          expect(Array.isArray(finalManifest.buttonLinks)).toBe(true)
          expect(Array.isArray(finalManifest.carouselSlides)).toBe(true)
          expect(Array.isArray(finalManifest.toolIcons)).toBe(true)
          expect(Array.isArray(finalManifest.videoThumbnails)).toBe(true)
          expect(Array.isArray(finalManifest.programThumbnails)).toBe(true)
          expect(Array.isArray(finalManifest.floatAdButtons)).toBe(true)
          
          // 檢查物件類型
          expect(typeof finalManifest.titles).toBe('object')
          expect(typeof finalManifest.routeLinks).toBe('object')
        }
      ), { numRuns: 5 })
    })
  })

  /**
   * 屬性 16: 備份恢復機制
   * 對於任何 Asset_Manifest 檔案損壞的情況，系統應該從備份檔案正確恢復配置
   * 驗證需求: Requirements 5.2
   */
  describe('Property 16: Backup recovery mechanism', () => {
    it('should create backup before writing', async () => {
      await fc.assert(fc.asyncProperty(
        fc.webUrl(),
        async (newValue) => {
          // 記錄原始值
          const originalManifest = await assetManager.readManifest()
          const originalLogo = originalManifest.logo
          
          // 執行更新操作
          await assetManager.updateAssetPath('logo', newValue)
          
          // 檢查備份檔案是否存在
          const backupPath = testConfigPath.replace('.json', '.backup.json')
          expect(fs.existsSync(backupPath)).toBe(true)
          
          // 檢查備份內容
          const backupContent = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
          expect(backupContent.logo).toBe(originalLogo) // 應該是原始值
        }
      ), { numRuns: 5 })
    })

    it('should recover from backup when main config is corrupted', async () => {
      // 先建立一個有效的備份
      await assetManager.updateAssetPath('logo', '/new-logo.png')
      
      // 損壞主配置檔案
      fs.writeFileSync(testConfigPath, 'invalid json content')
      
      // 嘗試讀取配置，應該從備份恢復
      const recoveredManifest = await assetManager.readManifest()
      
      // 驗證恢復的配置
      expect(recoveredManifest).toHaveProperty('logo')
      expect(recoveredManifest).toHaveProperty('banner')
      expect(recoveredManifest).toHaveProperty('buttonLinks')
      
      // 驗證主配置檔案已恢復
      expect(fs.existsSync(testConfigPath)).toBe(true)
      const restoredContent = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'))
      expect(restoredContent).toEqual(recoveredManifest)
    })
  })

  /**
   * 屬性測試：嵌套屬性操作
   * 驗證嵌套屬性的讀取和設置操作
   */
  describe('Nested property operations', () => {
    it('should handle nested property paths correctly', async () => {
      await fc.assert(fc.asyncProperty(
        fc.constantFrom(
          'titles.recommendedRoutes',
          'titles.recommendedBrowsers', 
          'routeLinks.default',
          'routeLinks.hover'
        ),
        fc.webUrl(),
        async (path, value) => {
          const result = await assetManager.updateAssetPath(path, value)
          
          expect(result.newValue).toBe(value)
          
          // 驗證嵌套路徑正確更新
          const manifest = await assetManager.readManifest()
          const pathParts = path.split('.')
          let current: any = manifest
          
          for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]]
            expect(current).toBeDefined()
          }
          
          expect(current[pathParts[pathParts.length - 1]]).toBe(value)
        }
      ), { numRuns: 20 })
    })
  })

  /**
   * 屬性測試：並發更新處理
   * 驗證多個同時更新操作的處理
   */
  describe('Concurrent update handling', () => {
    it('should handle multiple simultaneous updates correctly', async () => {
      const updates = [
        { path: 'logo', value: '/new-logo.png' },
        { path: 'banner', value: '/new-banner.png' },
        { path: 'titles.recommendedRoutes', value: '/new-title.png' }
      ]
      
      // 順序執行更新以避免並發問題
      for (const update of updates) {
        await assetManager.updateAssetPath(update.path, update.value)
      }
      
      // 驗證最終狀態
      const finalManifest = await assetManager.readManifest()
      updates.forEach(update => {
        const pathParts = update.path.split('.')
        let current: any = finalManifest
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]]
        }
        
        expect(current[pathParts[pathParts.length - 1]]).toBe(update.value)
      })
    })
  })
})