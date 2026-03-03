# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述 (Project Overview)

這是一個使用 Vue 3 重建的 B9 娛樂網站專案，採用 Monorepo 架構，包含動態展示網站、靜態展示網站與管理後台系統。

**核心技術棧**：Vue 3 (Composition API + `<script setup>`), TypeScript, Vite, Node.js, Express, SQLite

## 專案結構 (Project Structure)

```
b9-website-recreation/
├── demo/              # 動態展示網站 (Vue 3 + Vite)
├── demo-static/       # 純靜態展示網站 (Vue 3 + Vite, 無 API 依賴)
├── manager/
│   ├── front/        # 管理後台前端 (Vue 3 + Vite + Pinia)
│   └── backend/      # 管理後台後端 (Node.js + Express + SQLite)
├── data/             # 配置檔案與資料庫 (持久化存儲)
├── uploads/          # 上傳的圖片資源 (持久化存儲)
└── Dockerfile        # 雲端部署配置
```

## 常用指令 (Common Commands)

### 前端展示網站 (demo/)
```bash
cd demo
yarn install
yarn dev          # 開發模式 (port 3000)
yarn build        # 生產構建
yarn test         # 執行測試
```

### 靜態展示網站 (demo-static/)
```bash
cd demo-static
yarn install
yarn dev          # 開發模式 (port 3005)
yarn build        # 生產構建
```

### 管理後台前端 (manager/front/)
```bash
cd manager/front
yarn install
yarn dev          # 開發模式 (port 3001)
yarn build        # 生產構建
```

### 管理後台後端 (manager/backend/)
```bash
cd manager/backend
yarn install
yarn dev          # 開發模式 (port 3002, 使用 nodemon + ts-node)
yarn build        # 編譯 TypeScript
yarn start        # 執行編譯後的產物
```

### Docker 部署
```bash
docker-compose up --build -d    # 本地開發與測試
docker-compose down -v          # 清理容器與 volumes
```

### 測試 (各專案通用)
```bash
yarn test           # 執行測試
yarn test:watch     # 監看模式 (demo/)
```

## 核心架構 (Core Architecture)

### 雙層認證機制 (Dual Authentication)

1. **Nginx Basic Auth**：保護 `/admin/` 路徑，帳號密碼見 `README.md`
2. **JWT Application Auth**：
   - Access Token: 1 小時過期
   - Refresh Token: 7 天過期 (存於 localStorage)
   - 前端 `apiService` 會自動換證，使用者無感

### 資料流架構 (Data Flow Architecture)

#### 動態版本 (demo/)
- **API 模式** (`useApi: true`)：透過 `carouselService.getConfig()` 從後端 API 獲取配置
- **本地模式** (`useApi: false`)：使用 `siteConfig.ts` 中的本地配置
- **降級策略**：API 請求失敗時自動回退到本地配置

#### 靜態版本 (demo-static/)
- 完全本地化，無 API 請求
- 圖片存放於 `public/uploads/`
- 連結已硬編碼對齊官網狀態

### 配置管理 (Configuration Management)

- **`siteConfig.ts`**：核心站點配置，包含導航、主題、資源等
- **`useSiteData` composable**：管理資料狀態，提供 API 與本地配置的優先級邏輯
- **運行時配置**：支援 `/site-settings.json` 載入動態配置

### 圖片上傳處理 (Image Upload Handling)

- 使用時間戳記檔名來解決快取問題
- `apiService` 自動偵測 `FormData` 並略過 `Content-Type` 設定
- 圖片路徑統一處理：`/uploads/` 用於上傳圖片，`/assets/` 用於靜態資源

### 響應式設計斷點 (RWD Breakpoints)

- **Mobile (< 740px)**：涵蓋大螢幕手機與折疊機
- **Tablet (740px ~ 1279px)**：流體佈局
- **Desktop (>= 1280px)**：最大寬度 1500px

## 開發規範 (Coding Standards)

### Vue 3 開發
- 使用 Composition API 與 `<script setup>` 語法
- `ref()` 用於 primitives，`reactive()` 用於 objects
- Props 使用 `defineProps<Props>()` 解構

### 程式碼品質
- 測試覆蓋率要求：70%+
- 禁止 `console.log` 於生產程式碼
- 禁止忽略錯誤 (Error Handling 必須完整)

### Git 工作流程
- 使用 Conventional Commits 格式
- 分支從 `main` 建立 feature branch
- PR 需包含描述與測試計畫

## 部署注意事項 (Deployment Notes)

### 持久化存儲 (Critical)
雲端部署時必須掛載以下目錄：
- `/app/data`：存放 `config.json` 與 `users.db`
- `/app/uploads`：存放所有上傳的圖片資源

### 環境變數
- `NODE_ENV`：建議設為 `production`
- `PORT`：雲端平台會自動注入
- `API_PORT`：後端 API 端口
- `UPLOAD_PATH`：上傳目錄路徑
- `CONFIG_PATH`：配置目錄路徑

### 本地開發 Proxy
- 前端 (3001) 透過 `vite.config.ts` 的 Proxy 設定轉發 API 請求至後端 (3002)
- 若出現 `ECONNREFUSED`，請確認後端 Server 已啟動

## 關鍵檔案位置 (Key Files)

- `demo/src/config/siteConfig.ts`：主要站點配置
- `demo/src/composables/useSiteData.ts`：資料狀態管理
- `demo/src/services/carouselService.ts`：API 服務
- `demo/src/types/index.ts`：TypeScript 型別定義
- `manager/backend/src/server.ts`：後端伺服器入口
- `docker-compose.yml`：Docker 配置
