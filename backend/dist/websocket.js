import { Server as SocketIOServer } from 'socket.io';
export class WebSocketManager {
    io;
    connectedClients = new Set();
    constructor(httpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: "*", // 在生產環境中應該限制來源
                methods: ["GET", "POST"]
            }
        });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`客戶端連接: ${socket.id}`);
            this.connectedClients.add(socket.id);
            // 客戶端加入房間
            socket.on('join_room', (room) => {
                socket.join(room);
                console.log(`客戶端 ${socket.id} 加入房間: ${room}`);
            });
            // 客戶端離開房間
            socket.on('leave_room', (room) => {
                socket.leave(room);
                console.log(`客戶端 ${socket.id} 離開房間: ${room}`);
            });
            // 客戶端斷線
            socket.on('disconnect', () => {
                console.log(`客戶端斷線: ${socket.id}`);
                this.connectedClients.delete(socket.id);
            });
            // 發送連接狀態
            socket.emit('connection_status', 'connected');
        });
    }
    /**
     * 廣播配置更新事件到所有客戶端
     */
    broadcastConfigUpdate(event) {
        console.log('廣播配置更新事件:', event.changes.length, '個變更');
        this.io.emit('config_updated', event);
    }
    /**
     * 廣播配置更新事件到特定房間
     */
    broadcastConfigUpdateToRoom(room, event) {
        console.log(`廣播配置更新事件到房間 ${room}:`, event.changes.length, '個變更');
        this.io.to(room).emit('config_updated', event);
    }
    /**
     * 廣播上傳進度到特定客戶端
     */
    broadcastUploadProgress(socketId, data) {
        this.io.to(socketId).emit('upload_progress', data);
    }
    /**
     * 獲取連接的客戶端數量
     */
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
    /**
     * 檢查是否有客戶端連接
     */
    hasConnectedClients() {
        return this.connectedClients.size > 0;
    }
    /**
     * 廣播連接狀態變更
     */
    broadcastConnectionStatus(status) {
        this.io.emit('connection_status', status);
    }
}
//# sourceMappingURL=websocket.js.map