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
- **前端展示**：[http://localhost/](http://localhost/)
- **管理後台**：[http://localhost/admin/](http://localhost/admin/)

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

## 授權

私有專案
