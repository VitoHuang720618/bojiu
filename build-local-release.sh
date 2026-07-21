#!/bin/bash
set -e

# =================================================================
# 🚀 Bojiu Local Build Tool (No Git Push)
# 目的: 編譯所有端點並將成品搬運至指定目錄，不觸碰 Git
# =================================================================

RELEASE_DIR="/Users/vitohuang/project/b9-site/"

echo "🌟 [Local Build] Starting production build process..."

# 1. 前端 展示站 編譯 (Demo Site)
echo "🏗️ Building Demo site..."
cd demo
# 這裡建議確保依賴已安裝
# yarn install
yarn build
cd ..

# 2. 管理後台 前端 編譯 (Manager Front)
echo "🏗️ Building Manager frontend..."
cd manager/front
# yarn install
yarn build
cd ../..

# 3. 後端 編譯 (Manager Backend)
echo "🏗️ Building Manager backend..."
cd manager/backend
# yarn install
yarn build
cd ../..

# 4. 準備發布目錄
echo "🧹 Preparing release directory: $RELEASE_DIR"
if [ ! -d "$RELEASE_DIR" ]; then
    mkdir -p "$RELEASE_DIR"
fi

# 清理舊內容，但如果裡面有 .git 則保留
if [ -d "$RELEASE_DIR/.git" ]; then
    echo "📂 Preserving .git folder, cleaning other contents..."
    find "$RELEASE_DIR" -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +
else
    rm -rf "$RELEASE_DIR"/* 2>/dev/null || true
fi

# 建立結構
mkdir -p "$RELEASE_DIR/demo/defaults" "$RELEASE_DIR/admin" "$RELEASE_DIR/backend/dist" "$RELEASE_DIR/backend/uploads" "$RELEASE_DIR/backend/data"

# 5. 搬運成品
echo "🚚 Collecting artifacts to $RELEASE_DIR..."

# 5.1 前端成品
cp -r demo/dist/* "$RELEASE_DIR/demo/"
rm -rf "$RELEASE_DIR/demo/uploads" # 移除本地測試圖
cp -r manager/front/dist/* "$RELEASE_DIR/admin/"

# 5.2 後端成品
cp -r manager/backend/dist/* "$RELEASE_DIR/backend/dist/"
cp manager/backend/package.json "$RELEASE_DIR/backend/"
cp manager/backend/package-lock.json "$RELEASE_DIR/backend/"
cp manager/backend/data/config.json "$RELEASE_DIR/backend/data/"
test -f manager/backend/data/users.db && cp manager/backend/data/users.db "$RELEASE_DIR/backend/data/" || echo "ℹ️ No users.db template found."

# 5.3 基礎靜態資源 (site-settings.json, defaults等)
cp demo/public/site-settings.json "$RELEASE_DIR/demo/"
cp -r demo/public/defaults/* "$RELEASE_DIR/demo/defaults/"
cp -r demo/public/defaults/* "$RELEASE_DIR/backend/uploads/"

# 6. 生成必要的輔助腳本 (比照 publish-release.sh 的高品質規格)
echo "📜 Generating helper scripts (deploy.sh, update.sh, etc.)..."

# 建立 deploy.sh (這在本地伺服器測試時很有用)
cat << 'EOF' > "$RELEASE_DIR/deploy.sh"
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
# 這裡確保使用絕對路徑啟動，防止 PM2 找不到路徑
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
EOF
chmod +x "$RELEASE_DIR/deploy.sh"

# 生成 Nginx 設定產生器
cat <<'EOF' | tr -d '\r' > "$RELEASE_DIR/generate-nginx-conf.sh"
#!/bin/bash
CURRENT_DIR=$(pwd)
echo "🔍 Generating Nginx config for: $CURRENT_DIR"
# ... 這裡放入產生 Nginx Conf 的邏輯
EOF
chmod +x "$RELEASE_DIR/generate-nginx-conf.sh"

echo "✨ [Done] Local build completed successfully!"
echo "📁 Path: $RELEASE_DIR"
echo "👉 You can now point your Nginx site root to $RELEASE_DIR/demo"
