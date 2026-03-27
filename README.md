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

## 生產環境發布流程 (Production Release Workflow)

本專案採用 **「源碼與成品分離」** 的雙分支發布策略，以確保伺服器環境的輕量化與部署的高效性。

### 1. 分支策略 (Branch Strategy)
- **`master` 分支**：存放所有 TypeScript/Vue 原始碼，用於開發與版本管理。
- **`release` 分支**：僅存放編譯後的成品 (`dist/`)、靜態資產與自動化部署腳本。

### 2. 本地發布流程 (本地開發機執行)
當您在 `master` 分支完成修改並測試無誤後，請執行根目錄的自動化發布腳本：
```bash
./publish-release.sh
```
此腳本會自動完成：
- 三端編譯 (Demo, Manager Front, Backend)。
- 收集成品至臨時目錄。
- 生成伺服器部署工具 (`deploy.sh`, `generate-nginx-conf.sh`)。
- 強制推送至 GitHub 的 `release` 分支。

### 3. 伺服器部署流程 (GCP 伺服器執行)
在伺服器的 `bojiu-release` 目錄下，僅需執行以下兩步：
```bash
# 1. 抓取最新成品
git fetch origin release && git reset --hard origin/release

# 2. 啟動全自動部署
./deploy.sh
```
`deploy.sh` 會自動處理 PM2 安裝、依賴安裝、以及 **數據金庫 (Persistent Storage)** 的掛載。

---

## 數據持久化與保護 (Data Persistence)

為了防止代碼更新時覆蓋掉使用者上傳的圖片或數據，專案採用了 **「金庫隔離與軟連結」** 架構。

### 1. 數據金庫 (`bojiu-data`)
所有具備持久化屬性的資料皆存放於專案路徑平級的 `../bojiu-data` 資料夾中，包含：
- `uploads/`：使用者上傳的圖片、Banner。
- `data/`：`config.json` (網站設定) 與 `users.db` (帳號資料庫)。
- `site-settings.json`：前端使用的靜態配置。

### 2. 空間傳送門 (Symlinks)
每當執行 `./deploy.sh` 時，腳本會自動建立絕對路徑的軟連結，將程式內部的路徑指向外部金庫。這意味著：
- **代碼更新不會殺死數據**：即使您 `git reset --hard` 清空代碼，金庫內的資料依然穩如泰山。
- **維修方便**：您可以單獨備份整個 `bojiu-data` 資料夾。

---

## Nginx 配置工具

我們為佈署人員提供了自動化配置工具：
1. **`nginx-template.conf`**：預先封裝好的 Nginx `server` 區塊範本。
2. **`generate-nginx-conf.sh`**：執行後會自動偵測當前目錄的絕對路徑，產出一份與環境完全對齊的 `bojiu.nginx.conf`。

---

## 預設認證資訊

- **後台入口 (Nginx Basic Auth)**:
  - 帳號: `guard_x92`
  - 密碼: `X92_#Titan_Shield_@2026`
- **後台登入 (Application Auth)**:
  - 預設帳號: `admin`
  - 預設密碼: `Admin123!` (已停用強制修改密碼，可直接使用)

## 授權

私有專案


