import express, { Request, Response, NextFunction } from 'express'
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
import { DatabaseService } from './databaseService.js'
import { AuthMiddleware } from './authMiddleware.js'
import { createUserRoutes } from './userRoutes.js'
import { AuthService } from './authService.js'
import { UserService } from './userService.js'

console.log('Starting backend server initialization...')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log('Directory name:', __dirname)

const app = express()
const httpServer = createServer(app)

// Environment configuration for container deployment
const port = process.env.PORT ? parseInt(process.env.PORT) :
  process.env.API_PORT ? parseInt(process.env.API_PORT) : 3002
const uploadPath = process.env.UPLOAD_PATH || process.env.UPLOAD_DIR || path.join(__dirname, '../uploads')
const configPath = process.env.CONFIG_PATH || process.env.CONFIG_DIR || path.join(__dirname, '../data')
const maxFileSize = process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 10 * 1024 * 1024 // 10MB default
const nodeEnv = process.env.NODE_ENV || 'development'

console.log('Environment configuration:')
console.log(`  NODE_ENV: ${nodeEnv}`)
console.log(`  Port: ${port}`)
console.log(`  Upload path: ${uploadPath}`)
console.log(`  Config path: ${configPath}`)
console.log(`  Max file size: ${maxFileSize} bytes`)

// CORS configuration for container deployment
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // In container deployment, allow same-origin requests (no origin header)
    // and requests from the same host
    if (!origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      nodeEnv === 'development') {
      callback(null, true)
    } else {
      // In production container, allow requests from same host
      callback(null, true)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

// 中介軟體設置
app.set('trust proxy', true) // Trust proxy headers from Nginx
app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 靜態檔案服務 - 使用環境變量配置的路徑
app.use('/uploads', express.static(uploadPath))
app.use('/assets', express.static(path.join(__dirname, '../public/assets')))

// 路徑配置
const CONFIG_PATH = path.join(configPath, 'config.json')
const UPLOADS_DIR = uploadPath

// 確保必要目錄存在
if (!fs.existsSync(UPLOADS_DIR)) {
  console.log(`Creating uploads directory: ${UPLOADS_DIR}`)
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

if (!fs.existsSync(configPath)) {
  console.log(`Creating config directory: ${configPath}`)
  fs.mkdirSync(configPath, { recursive: true })
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
    fileSize: maxFileSize
  },
  fileFilter: (req, file, cb) => {
    // 只允許圖片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只允許上傳圖片文件'))
    }
  }
})

// API 路由

/**
 * 健康檢查端點 - 容器部署必需
 */
app.get('/api/health', (req, res) => {
  try {
    // 檢查基本服務狀態
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: nodeEnv,
      services: {
        api: 'running',
        fileSystem: fs.existsSync(UPLOADS_DIR) && fs.existsSync(configPath),
        config: fs.existsSync(CONFIG_PATH)
      }
    }

    // 檢查配置文件是否可讀
    try {
      fs.accessSync(CONFIG_PATH, fs.constants.R_OK)
      healthStatus.services.config = true
    } catch (error) {
      healthStatus.services.config = false
    }

    const allServicesHealthy = Object.values(healthStatus.services).every(service => service === 'running' || service === true)

    if (allServicesHealthy) {
      res.status(200).json(healthStatus)
    } else {
      res.status(503).json({
        ...healthStatus,
        status: 'unhealthy'
      })
    }
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    })
  }
})

// 啟動伺服器
let serverStarted = false;

async function startServer() {
  if (serverStarted) {
    console.log('Server already started, skipping...');
    return;
  }
  serverStarted = true;

  try {
    // Initialize database service
    const databaseService = new DatabaseService(path.join(configPath, 'users.db'))
    console.log('Initializing database service...')
    await databaseService.initializeDatabase()
    console.log('Database service initialized successfully')

    // Initialize user management services
    const userService = new UserService(databaseService)
    await userService.initialize()
    const authService = new AuthService(userService)
    const authMiddlewareInstance = new AuthMiddleware(authService)

    // Create user management routes
    const userRoutes = createUserRoutes(authService, userService, authMiddlewareInstance)
    app.use('/api', userRoutes)

    // Create auth middleware function for protecting routes
    const authMiddleware = authMiddlewareInstance.authenticate()

    // Test endpoint without authentication
    app.get('/api/test', (req: Request, res: Response) => {
      res.json({ success: true, message: 'Test endpoint working' })
    })

    // Public configuration endpoint for demo frontend (no authentication required)
    app.get('/api/public/config', async (req: Request, res: Response) => {
      try {
        const manifest = await assetManager.readManifest()
        res.json(manifest)
      } catch (error) {
        console.error('讀取公開配置失敗:', error)
        res.status(500).json({
          success: false,
          error: '讀取配置失敗'
        })
      }
    })

    // Protected configuration endpoints
    app.get('/api/config', authMiddleware, async (req: Request, res: Response) => {
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

    app.post('/api/config', authMiddleware, async (req: Request, res: Response) => {
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

    app.post('/api/upload', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
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
          } else if (assetPath.startsWith('banner.')) {
            const device = assetPath.split('.')[1]
            targetFilename = `banner-${device}.png`
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

        // 建立圖片 URL - 容器部署使用相對路徑
        let imageUrl: string
        if (nodeEnv === 'production') {
          // 在容器中使用相對路徑，由 Nginx 處理
          imageUrl = `/uploads/${targetFilename}`
        } else {
          // 開發環境使用完整 URL
          imageUrl = `http://localhost:${port}/uploads/${targetFilename}`
        }

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

    app.put('/api/asset/:path', authMiddleware, async (req: Request, res: Response) => {
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

    app.delete('/api/asset/:path', authMiddleware, async (req: Request, res: Response) => {
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

    app.post('/api/assets/batch', authMiddleware, async (req: Request, res: Response) => {
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

    app.post('/api/publish', authMiddleware, async (req: Request, res: Response) => {
      try {
        const config = await assetManager.readManifest()

        // Define Paths
        let targetDefaultsDir: string
        let targetSettingsPath: string

        if (nodeEnv === 'production') {
          // Docker container path
          targetDefaultsDir = '/usr/share/nginx/html/demo/defaults'
          targetSettingsPath = '/usr/share/nginx/html/demo/site-settings.json'
        } else {
          // Local development path
          targetDefaultsDir = path.join(__dirname, '../../../demo/public/defaults')
          targetSettingsPath = path.join(__dirname, '../../../demo/public/site-settings.json')
        }

        console.log(`Publishing to: ${targetDefaultsDir}`)

        // Ensure target directory exists
        if (!fs.existsSync(targetDefaultsDir)) {
          fs.mkdirSync(targetDefaultsDir, { recursive: true })
        }

        // Helper to copy image and return new path
        const processImage = (url: string) => {
          if (!url) return ''

          // 如果已經是 defaults 或 assets 路徑，直接回傳
          if (url.includes('/defaults/') || url.includes('/assets/')) return url

          // 只有 uploads 目錄的圖需要複製到 defaults
          if (url.includes('/uploads/')) {
            const filename = url.split('/uploads/').pop()
            if (!filename) return url

            const sourcePath = path.join(UPLOADS_DIR, filename)
            const targetPath = path.join(targetDefaultsDir, filename)

            if (fs.existsSync(sourcePath)) {
              fs.copyFileSync(sourcePath, targetPath)
            }

            return `/defaults/${filename}`
          }

          return url
        }

        // Process Data & Assets
        const runtimeConfig = {
          siteConfig: {
            useApi: false // Force API off
          },
          logo: processImage(config.logo || ''),
          buttonLinks: (config.buttonLinks || []).map(btn => ({
            label: btn.text || '', // 後端用 text
            href: btn.href || '',
            isExternal: btn.target === '_blank', // 後端用 target
            default: processImage(btn.defaultImage || ''),
            hover: processImage(btn.hoverImage || '')
          })),
          banner: {
            pc: processImage(config.banner.pc),
            tablet: processImage(config.banner.tablet),
            mobile: processImage(config.banner.mobile)
          },
          backgroundImage: processImage(config.backgroundImage || ''),
          routeLinksImages: (config.routeLinks || []).map(link => ({
            default: processImage(link.default),
            hover: processImage(link.hover),
            href: link.href || ''
          })),
          recommendedRoutes: (config.routeLinks || []).map((link, index) => ({
            id: `route-${index + 1}`,
            index: index + 1,
            title: `线路 ${index + 1}`,
            href: link.href || ''
          })),
          recommendedTools: (config.toolIcons || []).map((tool, index) => ({
            id: `tool-${index}`,
            name: `Tool ${index}`,
            href: tool.href || '#',
            default: processImage(tool.default),
            hover: processImage(tool.hover)
          })),
          videoThumbnails: (config.videoThumbnails || []).map((video, index) => ({
            id: `video-${index}`,
            title: video.title || '',
            href: video.href || '#',
            image: processImage(video.image || ''),
            alt: video.alt || ''
          })),
          programThumbnails: (config.programThumbnails || []).map((program, index) => ({
            id: `program-${index}`,
            title: program.title || '',
            href: program.href || '#',
            image: processImage(program.image || ''),
            alt: program.alt || ''
          })),
          carouselSlides: (config.carouselSlides || []).map((slide, index) => ({
            id: `slide-${index}`,
            image: processImage(slide.image),
            href: slide.href || '',
            alt: slide.title || `Carousel ${index}`
          })),
          floatAdButtons: (config.floatAdButtons || []).map((btn, index) => ({
            id: `float-${index}`,
            name: `Float ${index}`,
            href: btn.href || '#',
            default: processImage(btn.default),
            hover: processImage(btn.hover)
          }))
        }

        // Write site-settings.json
        fs.writeFileSync(targetSettingsPath, JSON.stringify(runtimeConfig, null, 2), 'utf8')

        console.log(`Successfully published settings to ${targetSettingsPath}`)

        res.json({
          success: true,
          message: '發布成功！靜態設定已生成。'
        })

      } catch (error) {
        console.error('發布失敗:', error)
        res.status(500).json({
          success: false,
          error: '發布失敗'
        })
      }
    })

    app.get('/api/status', authMiddleware, (req: Request, res: Response) => {
      res.json({
        success: true,
        data: {
          status: 'running',
          connectedClients: wsManager.getConnectedClientsCount(),
          timestamp: new Date().toISOString()
        }
      })
    })

    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`Backend server successfully running at http://0.0.0.0:${port}`)
      console.log(`Environment: ${nodeEnv}`)
      console.log(`WebSocket server ready for connections`)
      console.log(`Health check available at: http://0.0.0.0:${port}/api/health`)
      console.log(`User management system initialized`)
    }).on('error', (err) => {
      console.error('Failed to start server:', err)
      process.exit(1)
    })
  } catch (error) {
    console.error('Failed to initialize server:', error)
    process.exit(1)
  }
}

startServer()

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

// 優雅關閉處理
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})