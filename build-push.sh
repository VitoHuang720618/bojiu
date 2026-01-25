#!/bin/bash

# ==============================================================================
# B9 Website - Build & Push (Local Machine)
# ==============================================================================

# 配置變數 (請確認您目前的 Artifact Registry 地址)
IMAGE_BASE="asia-east1-docker.pkg.dev/slot-439403/b9/my-web-app"

# 1. 取得當前時間點作為備份版號 (例如 v20250125-1630)
BACKUP_TAG="v$(date +%Y%m%d-%H%M)"

echo "🏗️ 開始構建 Image..."
echo "🏷️ 標記版本: ${BACKUP_TAG} 且同時更新 latest"

# 2. 執行 Docker BuildX (多階段構建，AMD64 架構適配 GCP)
# 我們同時打上時間標籤和 latest 標籤
docker buildx build --platform linux/amd64 \
    -t ${IMAGE_BASE}:${BACKUP_TAG} \
    -t ${IMAGE_BASE}:latest \
    . --push

if [ $? -eq 0 ]; then
    echo "✅ 構建並推送成功！"
    echo "🌐 Image 網址: ${IMAGE_BASE}:latest"
    echo "💡 您現在可以去 VM 執行 ./update-site.sh 了"
else
    echo "❌ 構建失敗。"
    exit 1
fi
