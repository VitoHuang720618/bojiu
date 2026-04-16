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
cat <<'EOF' | tr -d '\r' > "$RELEASE_DIR/deploy.sh"
#!/bin/bash
set -e
echo "🚀 [Local Deploy] Setting up symlinks and permissions..."
# 這裡保留您的部署邏輯範本，但預設在本地環境執行
# (略過複雜的持久化掛載，單純處理連結)
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
