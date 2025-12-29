import fs from 'fs'
import path from 'path'
import { AssetManifest, ConfigUpdateEvent } from './types.js'

export class AssetManager {
  private configPath: string
  private backupPath: string

  constructor(configPath: string) {
    this.configPath = configPath
    this.backupPath = configPath.replace('.json', '.backup.json')
  }

  /**
   * 讀取 Asset Manifest
   */
  async readManifest(): Promise<AssetManifest> {
    try {
      const data = await fs.promises.readFile(this.configPath, 'utf8')
      return JSON.parse(data) as AssetManifest
    } catch (error) {
      // 如果主配置檔案讀取失敗，嘗試從備份恢復
      try {
        console.warn('主配置檔案讀取失敗，嘗試從備份恢復...')
        const backupData = await fs.promises.readFile(this.backupPath, 'utf8')
        const manifest = JSON.parse(backupData) as AssetManifest
        
        // 恢復主配置檔案
        await this.writeManifest(manifest)
        return manifest
      } catch (backupError) {
        throw new Error('無法讀取配置檔案和備份檔案')
      }
    }
  }

  /**
   * 寫入 Asset Manifest
   */
  async writeManifest(manifest: AssetManifest): Promise<void> {
    try {
      // 先備份現有配置
      await this.createBackup()
      
      // 寫入新配置
      await fs.promises.writeFile(
        this.configPath, 
        JSON.stringify(manifest, null, 2), 
        'utf8'
      )
    } catch (error) {
      throw new Error(`寫入配置檔案失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  /**
   * 更新 Asset Manifest 中的特定路徑
   */
  async updateAssetPath(assetPath: string, newValue: any): Promise<{ oldValue: any; newValue: any; manifest: AssetManifest }> {
    const manifest = await this.readManifest()
    const oldValue = this.getNestedProperty(manifest, assetPath)
    
    this.setNestedProperty(manifest, assetPath, newValue)
    await this.writeManifest(manifest)
    
    return { oldValue, newValue, manifest }
  }

  /**
   * 批次更新多個資產路徑
   */
  async updateMultipleAssets(updates: { path: string; value: any }[]): Promise<{ changes: { path: string; oldValue: any; newValue: any }[]; manifest: AssetManifest }> {
    const manifest = await this.readManifest()
    const changes: { path: string; oldValue: any; newValue: any }[] = []
    
    for (const update of updates) {
      const oldValue = this.getNestedProperty(manifest, update.path)
      this.setNestedProperty(manifest, update.path, update.value)
      changes.push({ path: update.path, oldValue, newValue: update.value })
    }
    
    await this.writeManifest(manifest)
    return { changes, manifest }
  }

  /**
   * 處理不同類型的資產更新
   */
  async handleAssetUpdate(
    assetPath: string, 
    assetType: 'single' | 'button' | 'carousel' | 'array',
    newValue: any,
    position?: number
  ): Promise<{ changes: { path: string; oldValue: any; newValue: any }[]; manifest: AssetManifest }> {
    const manifest = await this.readManifest()
    const changes: { path: string; oldValue: any; newValue: any }[] = []

    switch (assetType) {
      case 'single':
        // 單一圖片直接替換
        const oldSingleValue = this.getNestedProperty(manifest, assetPath)
        this.setNestedProperty(manifest, assetPath, newValue)
        changes.push({ path: assetPath, oldValue: oldSingleValue, newValue })
        break

      case 'button':
        // 按鈕圖片需要處理 default 和 hover 狀態
        const defaultPath = `${assetPath}.default`
        const hoverPath = `${assetPath}.hover`
        
        const oldDefaultValue = this.getNestedProperty(manifest, defaultPath)
        const oldHoverValue = this.getNestedProperty(manifest, hoverPath)
        
        this.setNestedProperty(manifest, defaultPath, newValue)
        this.setNestedProperty(manifest, hoverPath, newValue) // 暫時使用相同圖片
        
        changes.push(
          { path: defaultPath, oldValue: oldDefaultValue, newValue },
          { path: hoverPath, oldValue: oldHoverValue, newValue }
        )
        break

      case 'carousel':
      case 'array':
        // 陣列類型的處理
        // 檢查 assetPath 是否包含數組索引（如 carouselSlides.0）
        const pathParts = assetPath.split('.')
        const lastPart = pathParts[pathParts.length - 1]
        const isIndexedPath = /^\d+$/.test(lastPart)
        
        if (isIndexedPath) {
          // 處理索引路徑（如 carouselSlides.0）
          const arrayPath = pathParts.slice(0, -1).join('.')
          const index = parseInt(lastPart)
          const arrayValue = this.getNestedProperty(manifest, arrayPath) as any[]
          
          if (!Array.isArray(arrayValue)) {
            throw new Error(`路徑 ${arrayPath} 不是數組`)
          }
          
          const oldValue = arrayValue[index]
          
          // 確保數組有足夠的長度
          while (arrayValue.length <= index) {
            arrayValue.push(null)
          }
          
          arrayValue[index] = newValue
          changes.push({ path: assetPath, oldValue, newValue })
        } else {
          // 處理整個數組路徑
          const arrayValue = this.getNestedProperty(manifest, assetPath) as any[]
          
          if (!Array.isArray(arrayValue)) {
            throw new Error(`路徑 ${assetPath} 不是數組`)
          }
          
          const oldArrayValue = [...arrayValue]
          
          if (typeof position === 'number' && position >= 0) {
            // 更新特定位置
            if (position < arrayValue.length) {
              arrayValue[position] = newValue
            } else {
              // 如果位置超出範圍，擴展陣列
              while (arrayValue.length <= position) {
                arrayValue.push(null)
              }
              arrayValue[position] = newValue
            }
          } else {
            // 添加到陣列末尾
            arrayValue.push(newValue)
          }
          
          this.setNestedProperty(manifest, assetPath, arrayValue)
          changes.push({ path: assetPath, oldValue: oldArrayValue, newValue: arrayValue })
        }
        break

      default:
        throw new Error(`不支援的資產類型: ${assetType}`)
    }

    await this.writeManifest(manifest)
    return { changes, manifest }
  }

  /**
   * 建立配置備份
   */
  private async createBackup(): Promise<void> {
    try {
      if (fs.existsSync(this.configPath)) {
        await fs.promises.copyFile(this.configPath, this.backupPath)
      }
    } catch (error) {
      console.warn('建立備份失敗:', error)
    }
  }

  /**
   * 獲取嵌套屬性值
   */
  private getNestedProperty(obj: any, pathStr: string): any {
    const keys = pathStr.split('.')
    let current = obj

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }

    return current
  }

  /**
   * 設置嵌套屬性值
   */
  private setNestedProperty(obj: any, pathStr: string, value: any): void {
    const keys = pathStr.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key] || typeof current[key] !== 'object') {
        // 判斷下一個鍵是否為數字，決定建立物件還是陣列
        current[key] = isNaN(Number(keys[i + 1])) ? {} : []
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * 建立配置更新事件
   */
  createUpdateEvent(changes: { path: string; oldValue: any; newValue: any }[], manifest: AssetManifest): ConfigUpdateEvent {
    return {
      type: 'asset_update',
      timestamp: Date.now(),
      changes,
      manifest
    }
  }
}