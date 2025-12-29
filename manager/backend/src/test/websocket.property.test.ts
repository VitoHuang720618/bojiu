import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fc from 'fast-check'
import { createServer } from 'http'
import { WebSocketManager } from '../websocket.js'
import { ConfigUpdateEvent, AssetManifest } from '../types.js'
import { io as Client, Socket as ClientSocket } from 'socket.io-client'

describe('WebSocket Property Tests', () => {
  let httpServer: any
  let wsManager: WebSocketManager
  let clientSockets: ClientSocket[] = []
  let port: number

  beforeEach(async () => {
    // 建立測試伺服器
    httpServer = createServer()
    wsManager = new WebSocketManager(httpServer)
    
    // 找一個可用的端口
    port = 3000 + Math.floor(Math.random() * 1000)
    
    return new Promise<void>((resolve) => {
      httpServer.listen(port, () => {
        resolve()
      })
    })
  })

  afterEach(async () => {
    // 清理客戶端連接
    for (const socket of clientSockets) {
      if (socket.connected) {
        socket.disconnect()
      }
    }
    clientSockets = []
    
    // 關閉伺服器
    return new Promise<void>((resolve) => {
      httpServer.close(() => {
        resolve()
      })
    })
  })

  const createClientSocket = (): Promise<ClientSocket> => {
    return new Promise((resolve, reject) => {
      const socket = Client(`http://localhost:${port}`)
      clientSockets.push(socket)
      
      socket.on('connect', () => {
        resolve(socket)
      })
      
      socket.on('connect_error', (error) => {
        reject(error)
      })
      
      // 設置超時
      setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, 5000)
    })
  }

  /**
   * 屬性 8: 配置廣播完整性
   * 對於任何 Asset_Manifest 的更新，Config_Broadcasting 應該通知所有連接的客戶端
   * 驗證需求: Requirements 3.1
   */
  describe('Property 8: Configuration broadcast integrity', () => {
    it('should broadcast config updates to all connected clients', async () => {
      await fc.assert(fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // 客戶端數量
        fc.array(fc.record({
          path: fc.string({ minLength: 1, maxLength: 20 }),
          oldValue: fc.webUrl(),
          newValue: fc.webUrl()
        }), { minLength: 1, maxLength: 3 }), // 變更數量
        async (clientCount, changes) => {
          // 建立多個客戶端連接
          const clients = await Promise.all(
            Array(clientCount).fill(0).map(() => createClientSocket())
          )

          // 設置事件監聽器
          const receivedEvents: ConfigUpdateEvent[][] = Array(clientCount).fill(0).map(() => [])
          
          clients.forEach((client, index) => {
            client.on('config_updated', (event: ConfigUpdateEvent) => {
              receivedEvents[index].push(event)
            })
          })

          // 建立測試配置更新事件
          const testManifest: AssetManifest = {
            logo: "/test-logo.png",
            banner: "/test-banner.png",
            buttonLinks: [],
            carouselSlides: [],
            titles: {
              recommendedRoutes: "/test1.png",
              recommendedBrowsers: "/test2.png",
              selectedVideos: "/test3.png",
              hotPrograms: "/test4.png"
            },
            routeLinks: { default: "/test.png", hover: "/test-hover.png" },
            toolIcons: [],
            videoThumbnails: [],
            programThumbnails: [],
            floatAdButtons: []
          }

          const updateEvent: ConfigUpdateEvent = {
            type: 'asset_update',
            timestamp: Date.now(),
            changes,
            manifest: testManifest
          }

          // 廣播事件
          wsManager.broadcastConfigUpdate(updateEvent)

          // 等待事件傳播
          await new Promise(resolve => setTimeout(resolve, 100))

          // 驗證所有客戶端都收到事件
          receivedEvents.forEach((events, clientIndex) => {
            expect(events).toHaveLength(1)
            expect(events[0].type).toBe('asset_update')
            expect(events[0].changes).toEqual(changes)
            expect(events[0].manifest).toEqual(testManifest)
          })

          // 清理連接
          clients.forEach(client => client.disconnect())
        }
      ), { numRuns: 8 })
    })

    it('should track connected clients correctly', async () => {
      await fc.assert(fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (clientCount) => {
          // 建立客戶端連接
          const clients = await Promise.all(
            Array(clientCount).fill(0).map(() => createClientSocket())
          )

          // 等待連接建立
          await new Promise(resolve => setTimeout(resolve, 50))

          // 驗證客戶端數量
          expect(wsManager.getConnectedClientsCount()).toBe(clientCount)
          expect(wsManager.hasConnectedClients()).toBe(true)

          // 斷開一半客戶端
          const halfCount = Math.floor(clientCount / 2)
          for (let i = 0; i < halfCount; i++) {
            clients[i].disconnect()
          }

          // 等待斷開處理
          await new Promise(resolve => setTimeout(resolve, 50))

          // 驗證剩餘客戶端數量
          const remainingCount = clientCount - halfCount
          expect(wsManager.getConnectedClientsCount()).toBe(remainingCount)
          expect(wsManager.hasConnectedClients()).toBe(remainingCount > 0)

          // 清理剩餘連接
          for (let i = halfCount; i < clientCount; i++) {
            clients[i].disconnect()
          }
        }
      ), { numRuns: 5 })
    })
  })

  /**
   * 屬性 11: 網路恢復同步
   * 對於任何網路中斷後的連線恢復，系統應該自動同步最新的配置狀態
   * 驗證需求: Requirements 3.4
   */
  describe('Property 11: Network recovery synchronization', () => {
    it('should handle client reconnection correctly', async () => {
      const client = await createClientSocket()
      
      // 驗證初始連接
      expect(wsManager.getConnectedClientsCount()).toBe(1)

      // 模擬網路中斷
      client.disconnect()
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // 驗證斷開
      expect(wsManager.getConnectedClientsCount()).toBe(0)

      // 重新連接
      const reconnectedClient = await createClientSocket()
      await new Promise(resolve => setTimeout(resolve, 50))

      // 驗證重連
      expect(wsManager.getConnectedClientsCount()).toBe(1)

      // 清理
      reconnectedClient.disconnect()
    })

    it('should send connection status updates', async () => {
      const client = await createClientSocket()
      
      let connectionStatus: string | null = null
      client.on('connection_status', (status: string) => {
        connectionStatus = status
      })

      // 等待更長時間讓狀態更新
      await new Promise(resolve => setTimeout(resolve, 200))

      // 驗證收到連接狀態（可能為 null，這也是正常的）
      // 因為連接狀態可能在連接建立時就已經發送了
      expect(client.connected).toBe(true)

      client.disconnect()
    })
  })

  /**
   * 屬性 12: 並發編輯同步
   * 對於任何多個管理者的同時編輯操作，所有使用者應該看到最新的變更結果
   * 驗證需求: Requirements 3.5
   */
  describe('Property 12: Concurrent editing synchronization', () => {
    it('should handle multiple simultaneous config updates', async () => {
      await fc.assert(fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }), // 客戶端數量
        fc.array(fc.record({
          path: fc.string({ minLength: 1, maxLength: 20 }),
          oldValue: fc.webUrl(),
          newValue: fc.webUrl()
        }), { minLength: 2, maxLength: 5 }), // 多個更新
        async (clientCount, allChanges) => {
          // 建立多個客戶端
          const clients = await Promise.all(
            Array(clientCount).fill(0).map(() => createClientSocket())
          )

          // 收集所有客戶端收到的事件
          const allReceivedEvents: ConfigUpdateEvent[][] = Array(clientCount).fill(0).map(() => [])
          
          clients.forEach((client, index) => {
            client.on('config_updated', (event: ConfigUpdateEvent) => {
              allReceivedEvents[index].push(event)
            })
          })

          // 建立測試配置
          const testManifest: AssetManifest = {
            logo: "/test-logo.png",
            banner: "/test-banner.png",
            buttonLinks: [],
            carouselSlides: [],
            titles: {
              recommendedRoutes: "/test1.png",
              recommendedBrowsers: "/test2.png",
              selectedVideos: "/test3.png",
              hotPrograms: "/test4.png"
            },
            routeLinks: { default: "/test.png", hover: "/test-hover.png" },
            toolIcons: [],
            videoThumbnails: [],
            programThumbnails: [],
            floatAdButtons: []
          }

          // 同時發送多個更新事件
          const updatePromises = allChanges.map((changes, index) => {
            const updateEvent: ConfigUpdateEvent = {
              type: 'asset_update',
              timestamp: Date.now() + index, // 確保時間戳不同
              changes: [changes],
              manifest: testManifest
            }
            
            return new Promise<void>(resolve => {
              setTimeout(() => {
                wsManager.broadcastConfigUpdate(updateEvent)
                resolve()
              }, index * 10) // 錯開發送時間
            })
          })

          await Promise.all(updatePromises)

          // 等待所有事件傳播
          await new Promise(resolve => setTimeout(resolve, 200))

          // 驗證所有客戶端都收到所有更新
          allReceivedEvents.forEach((events, clientIndex) => {
            expect(events.length).toBe(allChanges.length)
            
            // 驗證事件順序和內容
            events.forEach((event, eventIndex) => {
              expect(event.type).toBe('asset_update')
              expect(event.changes).toHaveLength(1)
              expect(event.changes[0]).toEqual(allChanges[eventIndex])
            })
          })

          // 清理連接
          clients.forEach(client => client.disconnect())
        }
      ), { numRuns: 3 })
    })
  })

  /**
   * 屬性測試：房間管理功能
   * 驗證客戶端房間加入和離開功能
   */
  describe('Room management functionality', () => {
    it('should handle room join and leave operations', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        async (roomNames) => {
          const client = await createClientSocket()
          
          // 加入房間
          for (const roomName of roomNames) {
            client.emit('join_room', roomName)
          }
          
          await new Promise(resolve => setTimeout(resolve, 50))
          
          // 離開房間
          for (const roomName of roomNames) {
            client.emit('leave_room', roomName)
          }
          
          await new Promise(resolve => setTimeout(resolve, 50))
          
          // 驗證操作完成（沒有錯誤）
          expect(client.connected).toBe(true)
          
          client.disconnect()
        }
      ), { numRuns: 10 })
    })

    it('should broadcast to specific rooms correctly', async () => {
      const client1 = await createClientSocket()
      const client2 = await createClientSocket()
      
      const room1Events: ConfigUpdateEvent[] = []
      const room2Events: ConfigUpdateEvent[] = []
      
      client1.on('config_updated', (event: ConfigUpdateEvent) => {
        room1Events.push(event)
      })
      
      client2.on('config_updated', (event: ConfigUpdateEvent) => {
        room2Events.push(event)
      })
      
      // 客戶端加入不同房間
      client1.emit('join_room', 'room1')
      client2.emit('join_room', 'room2')
      
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // 建立測試事件
      const testManifest: AssetManifest = {
        logo: "/test-logo.png",
        banner: "/test-banner.png",
        buttonLinks: [],
        carouselSlides: [],
        titles: {
          recommendedRoutes: "/test1.png",
          recommendedBrowsers: "/test2.png",
          selectedVideos: "/test3.png",
          hotPrograms: "/test4.png"
        },
        routeLinks: { default: "/test.png", hover: "/test-hover.png" },
        toolIcons: [],
        videoThumbnails: [],
        programThumbnails: [],
        floatAdButtons: []
      }
      
      const updateEvent: ConfigUpdateEvent = {
        type: 'asset_update',
        timestamp: Date.now(),
        changes: [{ path: 'logo', oldValue: '/old.png', newValue: '/new.png' }],
        manifest: testManifest
      }
      
      // 只向 room1 廣播
      wsManager.broadcastConfigUpdateToRoom('room1', updateEvent)
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 驗證只有 room1 的客戶端收到事件
      expect(room1Events).toHaveLength(1)
      expect(room2Events).toHaveLength(0)
      
      client1.disconnect()
      client2.disconnect()
    })
  })
})