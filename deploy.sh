#!/bin/bash
set -e
echo "🚀 [Deploy] Starting server-side update with Absolute Path Persistent Storage..."

# 1. 檢查並自動安裝 PM2
if ! command -v pm2 &> /dev/null; then
    echo "💾 PM2 not found, installing it globally..."
    npm install -g pm2 || { echo "❌ Failed to install PM2."; exit 1; }
fi

# 2. 建立持久化數據金庫 (Persistent Storage)
# 取得絕對路徑，確保軟連結萬無一失
APP_ROOT=$(pwd)
DATA_ROOT="$(dirname "$APP_ROOT")/bojiu-data"
mkdir -p "$DATA_ROOT/uploads" "$DATA_ROOT/defaults" "$DATA_ROOT/data"

echo "🔐 Persistent Store Path: $DATA_ROOT"

# 初始化金庫
if [ ! -f "$DATA_ROOT/data/config.json" ]; then
    echo "📦 Initializing Persistent Data from templates..."
    cp backend/data/config.json "$DATA_ROOT/data/"
    cp demo/site-settings.json "$DATA_ROOT/"
    cp -r backend/uploads/* "$DATA_ROOT/uploads/" 2>/dev/null || true
    cp -r demo/defaults/* "$DATA_ROOT/defaults/" 2>/dev/null || true
    test -f backend/data/users.db && cp backend/data/users.db "$DATA_ROOT/data/" || echo "No DB to copy."
fi

# 3. 建立軟連結 (Symlink) 傳送門 (使用絕對路徑)
rm -rf backend/uploads backend/data demo/defaults demo/site-settings.json
ln -snf "$DATA_ROOT/uploads" "$APP_ROOT/backend/uploads"
ln -snf "$DATA_ROOT/data" "$APP_ROOT/backend/data"
ln -snf "$DATA_ROOT/defaults" "$APP_ROOT/demo/defaults"
ln -snf "$DATA_ROOT/site-settings.json" "$APP_ROOT/demo/site-settings.json"

echo "✨ Symlinks established using absolute paths."

# 4. 進入後端目錄安裝必要的生產套件
echo "📦 Installing backend production dependencies..."
cd backend
npm install --production
cd ..

# 5. 啟動或重啟 PM2 服務
APP_FILE="$APP_ROOT/backend/dist/server.js"
if pm2 show bojiu-backend &>/dev/null; then
    echo "♻️ Restarting existing bojiu-backend..."
    pm2 restart bojiu-backend
else
    echo "🆕 Starting new bojiu-backend..."
    pm2 start "$APP_FILE" --name "bojiu-backend"
fi

# 6. 保存狀態
echo "💾 Saving PM2 process list..."
pm2 save

echo "✨ [Deploy] Server update completed successfully!"
