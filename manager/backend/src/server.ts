import express from 'express'
import multer from 'multer'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { AssetManager } from './assetManager.js'
import { WebSocketManager } from './websocket.js'
import { validateImageFileStrict, validateAssetPath, createUploadError } from './validation.js'
import { AssetManifest, ImageUploadResponse, UploadErrorType } from './types.js'

console.log('Starting backend server initialization...')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log('Directory name:', __dirname)

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT ? parseInt(process.env.PORT) : 3005
console.log(`Port configured: ${port}`)

// 中介軟體設置
app.use(cors())
app.use(express.json())

// 靜態檔案服務
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/assets', express.static(path.join(__dirname, '../public/assets')))

// 路徑配置
const CONFIG_PATH = path.join(__dirname, '../data/config.json')
const UPLOADS_DIR = path.join(__dirname, '../uploads')

// 確保必要目錄存在
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// 初始化管理器
const assetManager = new AssetManager(CONFIG_PATH)
const wsManager = new WebSocketManager(httpServer)

// Multer 配置 - 使用臨時文件名，稍後重命名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (req, file, cb) => {
    // 使用臨時文件名，稍後在路由中重命名
    const tempName = Date.now() + '-temp' + path.extname(file.originalname)
    cb(null, tempName)
  }
})

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

// API 路由

/**
 * 獲取配置
 */
app.get('/api/config', async (req, res) => {
  try {
    const manifest = await assetManager.readManifest()
    res.json(manifest)
  } catch (error) {
    console.error('讀取配置失敗:', error)
    res.status(500).json({ 
      success: false,
      error: '讀取配置失敗' 
    })
  }
})

/**
 * 更新配置（一般）
 */
app.post('/api/config', async (req, res) => {
  try {
    const config = req.body as AssetManifest
    await assetManager.writeManifest(config)
    
    // 廣播配置更新
    const updateEvent = assetManager.createUpdateEvent(
      [{ path: 'full_config', oldValue: null, newValue: config }],
      config
    )
    wsManager.broadcastConfigUpdate(updateEvent)
    
    res.json({ 
      success: true,
      message: '配置更新成功' 
    })
  } catch (error) {
    console.error('更新配置失敗:', error)
    res.status(500).json({ 
      success: false,
      error: '更新配置失敗' 
    })
  }
})

/**
 * 上傳圖片並更新配置
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { assetPath, assetType, position } = req.body
    
    console.log('Upload request:', { assetPath, assetType, position })
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '沒有上傳檔案'
      } as ImageUploadResponse)
    }

    // 驗證檔案
    validateImageFileStrict(req.file)
    
    // 根據 assetPath 生成正確的文件名並重命名文件
    let targetFilename = 'default.png'
    
    if (assetPath) {
      if (assetPath === 'logo') {
        targetFilename = 'logo.png'
      } else if (assetPath === 'banner') {
        targetFilename = 'banner.png'
      } else if (assetPath.startsWith('carouselSlides.')) {
        const index = assetPath.split('.')[1]
        targetFilename = `carousel-${index}.png`
      } else if (assetPath.startsWith('buttonLinks.')) {
        const parts = assetPath.split('.')
        const index = parts[1]
        const type = parts[2] || 'default'
        targetFilename = `button-${index}-${type}.png`
      } else if (assetPath.startsWith('toolIcons.')) {
        const parts = assetPath.split('.')
        const index = parts[1]
        const type = parts[2] || 'default'
        targetFilename = `tool-${index}-${type}.png`
      } else if (assetPath.startsWith('floatAdButtons.')) {
        const parts = assetPath.split('.')
        const index = parts[1]
        const type = parts[2] || 'default'
        targetFilename = `float-${index}-${type}.png`
      } else {
        targetFilename = assetPath.replace(/\./g, '-') + '.png'
      }
    }
    
    // 重命名文件到目標文件名
    const targetPath = path.join(UPLOADS_DIR, targetFilename)
    fs.renameSync(req.file.path, targetPath)
    
    console.log('File renamed to:', targetFilename)
    
    // 建立圖片 URL - 使用目標文件名
    const imageUrl = `http://localhost:${port}/uploads/${targetFilename}`
    
    res.json({
      success: true,
      data: {
        filename: targetFilename,
        path: imageUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    } as ImageUploadResponse)
    
  } catch (error) {
    console.error('上傳失敗:', error)
    
    // 刪除已上傳的檔案（如果存在）
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (deleteError) {
        console.error('刪除檔案失敗:', deleteError)
      }
    }
    
    let errorMessage = '上傳失敗'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      if (error.name === 'UploadError') {
        statusCode = 400
      }
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    } as ImageUploadResponse)
  }
})

/**
 * 更新特定資產路徑
 */
app.put('/api/asset/:path', async (req, res) => {
  try {
    const assetPath = req.params.path
    const { value } = req.body
    
    if (!validateAssetPath(assetPath)) {
      return res.status(400).json({
        success: false,
        error: '無效的資產路徑格式'
      })
    }
    
    const result = await assetManager.updateAssetPath(assetPath, value)
    
    // 廣播配置更新
    const updateEvent = assetManager.createUpdateEvent(
      [{ path: assetPath, oldValue: result.oldValue, newValue: result.newValue }],
      result.manifest
    )
    wsManager.broadcastConfigUpdate(updateEvent)
    
    res.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('更新資產失敗:', error)
    res.status(500).json({
      success: false,
      error: '更新資產失敗'
    })
  }
})

/**
 * 刪除圖片映射
 */
app.delete('/api/asset/:path', async (req, res) => {
  try {
    const assetPath = req.params.path
    
    if (!validateAssetPath(assetPath)) {
      return res.status(400).json({
        success: false,
        error: '無效的資產路徑格式'
      })
    }
    
    const result = await assetManager.updateAssetPath(assetPath, null)
    
    // 廣播配置更新
    const updateEvent = assetManager.createUpdateEvent(
      [{ path: assetPath, oldValue: result.oldValue, newValue: null }],
      result.manifest
    )
    wsManager.broadcastConfigUpdate(updateEvent)
    
    res.json({
      success: true,
      message: '圖片映射已移除',
      data: result
    })
    
  } catch (error) {
    console.error('刪除圖片映射失敗:', error)
    res.status(500).json({
      success: false,
      error: '刪除圖片映射失敗'
    })
  }
})

/**
 * 批次更新多個資產
 */
app.post('/api/assets/batch', async (req, res) => {
  try {
    const { updates } = req.body as { updates: { path: string; value: any }[] }
    
    // 驗證所有路徑
    for (const update of updates) {
      if (!validateAssetPath(update.path)) {
        return res.status(400).json({
          success: false,
          error: `無效的資產路徑格式: ${update.path}`
        })
      }
    }
    
    const result = await assetManager.updateMultipleAssets(updates)
    
    // 廣播配置更新
    const updateEvent = assetManager.createUpdateEvent(result.changes, result.manifest)
    wsManager.broadcastConfigUpdate(updateEvent)
    
    res.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('批次更新失敗:', error)
    res.status(500).json({
      success: false,
      error: '批次更新失敗'
    })
  }
})

/**
 * 獲取伺服器狀態
 */
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'running',
      connectedClients: wsManager.getConnectedClientsCount(),
      timestamp: new Date().toISOString()
    }
  })
})

// 錯誤處理中介軟體
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('未處理的錯誤:', error)
  
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: '伺服器內部錯誤'
    })
  }
})

// 啟動伺服器
httpServer.listen(port, () => {
  console.log(`Backend server successfully running at http://localhost:${port}`)
  console.log(`WebSocket server ready for connections`)
}).on('error', (err) => {
  console.error('Failed to start server:', err)
})
