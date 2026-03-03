# B9 網站重建專案

本專案是使用 Vue 3、Vite 和 TypeScript 對 B9 網站進行的高完整度重建。包含了一個動態的展示前端 (Demo) 以及一個功能完善的後端管理系統 (Manager)。

## 專案架構

本專案採用單一代碼庫 (Monorepo) 結構：

```
b9-website-recreation/
├── demo/               # 前端展示頁面 (Vue 3 + Vite)
├── manager/
│   ├── front/          # 管理後台前端 (Vue 3 + Vite)
│   └── backend/        # 管理後台後端 (Node.js + Express + SQLite)
├── shared/             # 前後端共用的型別與工具
├── docker/             # Docker 配置 (Nginx, 啟動腳本)
├── uploads/            # 上傳的圖片資源 (持久化存儲)
├── data/               # 配置檔案與資料庫 (持久化存儲)
├── Dockerfile          # 雲端部署用的 Docker 配置
└── docker-compose.yml  # 本地開發與測試環境
```

## 功能特點

- **高效能前端**：利用 Vue 3 Composition API 與 Vite 構建，極速載入。
- **動態配置管理**：透過管理後台即時更新網站的圖表、連結、輪播圖等資訊。
- **響應式設計**：針對 PC、平板與手機板提供最佳化的顯示效果。
- **現代化 UI**：管理後台採用全新重構的三欄式現代化設計，操作直覺。
- **部署優化**：內建 Docker 與 Nginx 配置，支援 Zeabur 與 GCP Cloud Run 的動態端口適配。

## 快速啟動 (Docker)

最簡單的執行方式是使用 Docker：

```bash
docker-compose up --build -d
```

啟動後即可訪問：
### 1. 專案目錄結構
- `manager/`: 後台管理系統 (Go + Vue 3)。
- `demo/`: 動態展示網站 (Vue 3 + Vite)，依賴 API 獲取資料。
- `demo-static/`: **純靜態展示網站**。不依賴後台 API 與外部圖床，所有資源與連結皆已本地化，適合離線部署或追求極速加載的場景。

---

### 2. 環境與端口 (Environment)
- Manager Backend: http://localhost:3002
- Manager Frontend: http://localhost:3001
- Demo Site (Dynamic): http://localhost:3000
- Demo Site (Static): http://localhost:3005 (預設可自行調整)

---

### 3. 如何啟動靜態版 (demo-static)
如果要啟動完全靜態化的版本，請進入 `demo-static` 目錄：
```bash
cd demo-static
yarn install
yarn dev
```
靜態版特點：
*   **無後台傳輸**：`useApi` 已設為 `false`，不請求任何外部設定。
*   **本地圖檔**：圖片皆存放於 `public/uploads/`，不依賴 GCP。
*   **硬編碼連結**：所有導流連結皆已對齊 2026-03-02 官網狀態。

---

### 4. 開發規範 (Coding Standards)
- **前端展示**：[http://localhost/](http://localhost/)
- **管理後台**: [http://localhost/admin/](http://localhost/admin/)
  - **Nginx 防護 (Basic Auth)**:
    - 帳號: `guard_x92`
    - 密碼: `X92_#Titan_Shield_@2026`
  - **後台登入**:
    - 預設帳號: `admin`
    - 預設密碼: `Admin123!`

## 雲端部署注意事項

### 1. 本地構建與推送
專案已優化，您可以直接將代碼推送到 GitHub，並在 Zeabur 或 GCP 上進行自動化部署。

### 2. 持久化存儲 (Volumes)
**極其重要**：在雲端部署時，必須掛載以下目錄以確保數據不遺失：
- `/app/data`：存放 `config.json` 與 `users.db` (資料庫)。
- `/app/uploads`：存放所有管理員上傳的圖片資源。

### 3. 環境變數
- `NODE_ENV`: 建議設置為 `production`。
- `PORT`: 雲端平台會自動注入，Nginx 已配置為自動適配。

## 技術棧

- **前端**：Vue 3, TypeScript, Vite, Pinia
- **後端**：Node.js, Express, SQLite3
- **部署**：Docker, Nginx

## 開發規範與設計決策

### 響應式設計斷點 (RWD Breakpoints)

本專案為了適應現代化移動設備（如大螢幕手機、折疊機），針對「手機」的判定範圍進行了優化調整，而不僅僅遵循傳統的 430px 界線。

- **Mobile (< 740px)**
  - **判定邏輯**：寬度小於 740px 的所有設備皆視為「手機」。
  - **設計原因**：傳統的 `< 430px` 僅能涵蓋標準 iPhone/Android 手機。許多現代大尺寸手機（如 iPhone Pro Max）或折疊機在展開前，寬度往往介於 430px ~ 740px 之間。
  - **使用者體驗**：將此區間歸類為 Mobile，可確保這些手持設備使用者能看到專為直立閱讀優化的版面（如較大的 Banner 字體、單欄排版），而非縮小的平板/桌面介面。

- **Tablet (740px ~ 1279px)**
  - **適用設備**：iPad Mini、iPad Air、iPad Pro (直立)。
  - **佈局特性**：流體佈局 (Fluid Layout)，適應各種平板尺寸。

- **Desktop (>= 1280px)**
  - **適用設備**：筆記型電腦、桌上型螢幕。
  - **佈局特性**：寬螢幕設計，最大內容寬度限制為 1500px。

## 架構決策與疑難排解 (Architecture & Troubleshooting)

### 1. 認證機制 (Dual Authentication)
本專案採用雙層認證架構：
- **第一層 (Nginx)**: Basic Auth (`/admin/` 路徑)。
  - 目的：保護後台入口，防止被掃描器或未授權者接觸。
  - 特性：瀏覽器層級驗證，除非關閉瀏覽器，否則不會過期。
- **第二層 (Application)**: JWT (JSON Web Tokens)。
  - 目的：應用程式內部的權限控管 (RBAC)。
  - 特性：
    - Access Token: 1 小時過期。
    - Refresh Token: 7 天過期 (存於 localStorage)。
    - **自動換證機制**: 前端 `apiService` 會在收到 401 錯誤時自動使用 Refresh Token 換取新憑證，使用者無感。

### 2. 圖片上傳 (Upload Handling)
- **問題**: `apiService` 曾預設強制加入 `Content-Type: application/json`，導致 `FormData` 上傳失敗 (500 Error)。
- **解決**: `apiService` 現已加入自動判斷邏輯，當偵測到 `FormData` 時會自動略過 Content-Type 設定，讓瀏覽器自動生成正確的 Boundary。

### 3. 本地開發 (Local Development)
- **Vite Proxy**: 前端 (3001) 透過 `vite.config.ts` 的 Proxy 設定轉發 API 請求至後端 (3002)。
- **常見錯誤**: 若出現 `ECONNREFUSED`，代表後端 Server 未啟動。請確保同時開啟兩個終端機分別執行 `yarn dev:manager` 和 `yarn dev:backend`。

## 授權

私有專案
