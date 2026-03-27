#!/bin/bash

# ------------------------------------------------------------------
# B9 Website Recreation - Production Release Script
# Author: Antigravity (Senior Cloud-Native Architect)
# Description: Automates the build and push of artifacts to release branch.
# ------------------------------------------------------------------

set -e

echo "🚀 [Antigravity] Starting production build process..."

# 1. 進入 demo 目錄並編譯
echo "📦 Building Frontend Demo..."
cd demo
yarn build
cd ..

# 2. 進入 manager/front 目錄並編譯
echo "📦 Building Manager Frontend..."
cd manager/front
yarn build
cd ../..

# 3. 進入 manager/backend 目錄並編譯
echo "📦 Building Manager Backend (TS to JS)..."
cd manager/backend
yarn build
cd ../..

# 4. 準備臨時發布目錄
echo "🧹 Preparing temporary deployment directory..."
rm -rf deploy_temp
mkdir -p deploy_temp/demo/defaults deploy_temp/admin deploy_temp/backend/dist deploy_temp/backend/uploads deploy_temp/backend/data

# 5. 複製成品與基礎設施
echo "🚚 Collecting artifacts..."

# 前端與後台管理
cp -r demo/dist/* deploy_temp/demo/
cp -r manager/front/dist/* deploy_temp/admin/

# 後端 JS 執行檔與配置
cp -r manager/backend/dist/* deploy_temp/backend/dist/
cp manager/backend/package.json deploy_temp/backend/
cp manager/backend/package-lock.json deploy_temp/backend/
cp manager/backend/data/config.json deploy_temp/backend/data/
# 如果有數據庫地基也帶上 (不帶敏感資料)
test -f manager/backend/data/users.db && cp manager/backend/data/users.db deploy_temp/backend/data/ || echo "No users.db template, skipping."

# 基礎圖片與設定 (雙向保障)
cp demo/public/site-settings.json deploy_temp/demo/
cp -r demo/public/defaults/* deploy_temp/demo/defaults/
cp -r demo/public/defaults/* deploy_temp/backend/uploads/

# 加入標記檔防止 Git 略過空目錄
touch deploy_temp/backend/uploads/.gitkeep
touch deploy_temp/demo/defaults/.gitkeep

# 5.5 生成伺服器部署腳本 (deploy.sh)
echo "📜 Generating server-side deploy.sh with Absolute Path support..."
cat <<'EOF' | tr -d '\r' > deploy_temp/deploy.sh
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
EOF
chmod +x deploy_temp/deploy.sh

# 5.6 生成 Nginx 設定範本與工具
echo "📜 Generating Nginx configuration templates..."
cat <<'EOF' > deploy_temp/nginx-template.conf
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP; # 範例: bojiu.vito.website
    client_max_body_size 50M;

    # 前端 Demo 頁面
    location / {
        root BASE_PATH/demo;
        try_files $uri $uri/ /index.html;

        location ~* \.(js|css)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 靜態設定檔與資產
    location /site-settings.json {
        alias BASE_PATH/demo/site-settings.json;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    location /defaults/ {
        alias BASE_PATH/demo/defaults/;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # 管理後台前端 (Admin)
    location /admin/ {
        alias BASE_PATH/admin/;
        try_files $uri $uri/ /admin/index.html;

        # Basic Auth Security
        # auth_basic "Restricted Access";
        # auth_basic_user_file BASE_PATH/deploy/.htpasswd;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 後台圖片上傳區 (Uploads)
    location /uploads/ {
        alias BASE_PATH/backend/uploads/;
        add_header Cache-Control "no-cache, must-revalidate";
        expires -1;

        location ~* \.(jpg|jpeg|png|gif|webp)$ { }
        location ~* \.(php|pl|py|jsp|asp|sh|cgi|js|html)$ { deny all; }
    }

    # 內部後端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;

        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }

    # 健康檢查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # 日誌記錄
    error_log /var/log/nginx/bojiu_error.log;
    access_log /var/log/nginx/bojiu_access.log;
}
EOF

cat <<'EOF' | tr -d '\r' > deploy_temp/generate-nginx-conf.sh
#!/bin/bash
CURRENT_DIR=$(pwd)
echo "🔍 Generating complete Nginx server block for path: $CURRENT_DIR"
sed "s|BASE_PATH|$CURRENT_DIR|g" nginx-template.conf > bojiu.nginx.conf
echo "✨ Success! Config generated: bojiu.nginx.conf"
echo "👉 You can now symlink this file to /etc/nginx/sites-enabled/ or paste its content into your Nginx config."
EOF
chmod +x deploy_temp/generate-nginx-conf.sh

# 6. 初始化 Git 並推送到 release 分支
echo "📤 Pushing to GitHub [release] branch..."
cd deploy_temp
git init
git remote add origin git@github.com:VitoHuang720618/bojiu.git
git checkout -b release
git add --all --force
git commit -m "Distribution: Auto-compiled release with refined nginx tools at $(date '+%Y-%m-%d %H:%M:%S')"
git push -f origin release

# 7. 清理現場
cd ..
rm -rf deploy_temp

echo "✨ [Antigravity] Success! Your production artifacts are now live on the release branch."
echo "🔗 Please run 'git reset --hard origin/release' on your GCP server."
