#!/bin/bash

# ==============================================================================
# B9 Website - VM Deployment Script (Latest Optimized)
# ==============================================================================

# 配置變數
IMAGE_NAME="asia-east1-docker.pkg.dev/slot-439403/b9/my-web-app"
CONTAINER_NAME="bojiu-web"
DEFAULT_TAG="latest"

# 域名與 SSL 配置
DOMAIN="bojiu.vito.website"
EMAIL="vito@ukplus.online"

# 接受參數作為 Tag，若無則使用預設值 (latest)
TAG=${1:-$DEFAULT_TAG}
FULL_IMAGE="${IMAGE_NAME}:${TAG}"

echo "🚀 開始準備部署版本: ${TAG}"

# 1. Pull 最新的 Image
echo "📥 正在從 Artifact Registry 拉取映像檔..."
docker pull ${FULL_IMAGE}
if [ $? -ne 0 ]; then
    echo "❌ 拉取失敗，請檢查 GCP 權限 (gcloud auth configure-docker)"
    exit 1
fi

# 2. 停止並移除舊容器
if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
    echo "🛑 正在停止舊服務: ${CONTAINER_NAME}..."
    docker stop ${CONTAINER_NAME}
    echo "🗑️ 正在移除舊容器..."
    docker rm ${CONTAINER_NAME}
fi

# 3. 啟動新容器 (整合您的自定義參數)
echo "⚙️ 正在啟動新容器..."
docker run -d \
  --name ${CONTAINER_NAME} \
  -p 80:80 \
  -p 443:443 \
  -e DOMAIN="${DOMAIN}" \
  -e EMAIL="${EMAIL}" \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/letsencrypt:/etc/letsencrypt \
  --restart always \
  ${FULL_IMAGE}

if [ $? -eq 0 ]; then
    echo "✅ 服務已成功啟動！"
    echo "🌐 域名: ${DOMAIN}"
    echo "🔍 檢查狀態:"
    docker ps -f name=${CONTAINER_NAME}
else
    echo "❌ 啟動失敗，請檢查 Docker 記錄。"
    exit 1
fi

# 4. 清理過時的 Images
echo "🧹 清理舊有的過時映像檔..."
docker image prune -f
