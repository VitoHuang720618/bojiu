# 博九重建專案 (B9 Website Recreation) - 專案導覽與上下文

這是為 Google Gemini (Antigravity) 準備的專案上下文文件，用於記錄架構決策、近期變更與關鍵規範。

## 🏗️ 專案架構與技術棧

- **技術棧**: Vue 3 (Script Setup) + TypeScript + Vanilla CSS (Scoped)。
- **雙版本平行開發**:
  - `demo/`: 動態版本，支援從 Manager Backend API 獲取資料。
  - `demo-static/`: 靜態版本，資料鎖死在 `siteConfig.ts`，用於純靜態佈署（如 Nginx 直接提供）。
- **佈署模式**: 前後端容器化，使用 Docker 打包並推送到 GCP Artifact Registry。

## 📏 RWD 與視覺規範 (關鍵)

- **Mobile (< 740px)**: 
  - 單欄佈局，側重觸控優化。
  - `#home-main` 左右 padding 設為 15px 以最大化內容展示。
- **Tablet (740px ~ 1279px)**:
  - 回流 (Fluid) 佈局，使用百分比寬度。
  - **重要間距**: `banner` 與內容區間距為 **38px**（由 `#home-main` padding-top 控制）。
  - **推薦工具**: 標題背景色 `#200cc5`，頂部有 **2px** 金色邊框 (`#dfb082`)。
  - **浮動廣告 (Float-ad)**: 尺寸精確為 **140x60px**，左右邊距 **150px**。
- **Desktop (>= 1280px)**:
  - 最大內容寬度限制在 1520px/1500px。

## ✅ 近期關鍵修改 (2026-04)

- **路徑自動化與網址去硬編碼 (Path-Agnostic Architecture)**:
  - **動態前綴修復**: 實作 `fixPath` 函數，全面排除程式碼中的硬編碼 `/b9-site/` 前綴。
  - **網址大掃除**: 清除全站（包含 `config.json` 與 `assetManifest.ts`）中殘留的 `localhost:3002/3005` 網址，徹底解決 HTTPS 環境下的混合內容 (Mixed Content) 錯誤。
  - **三位一體對齊**: 確立了「Vite Base = Nginx Location = try_files Fallback」的部屬公式，終結了單頁應用 (SPA) 在子路徑下的無限刷新 (Infinite Reload) 難題。
- **高級絕對路徑金庫模式 (Absolute Path Persistent Store)**:
  - **金庫防護 (`bojiu-data`)**: 在專案根目錄旁建立獨立金庫，透過絕對路徑軟連結 (Symlink) 隔離代碼與數據（圖片、資料庫與設定檔）。
  - **自癒部屬腳本**: 升級 `build-local-release.sh` 產出的 `deploy.sh`，新增 PM2 自動偵測、絕對路徑連接與生產環境相依自動安裝功能，確保更新代碼時數據「穩如泰山」。
- **安全性與穩定性增強**:
  - **後端診斷偵查**: 於 `server.ts` 加入 `/api/test-path` 診斷接口，利於快速排查部屬環境中的路徑與權限問題。
  - **Multer 容錯邏輯**: 修正檔案上傳時 `req.body` 解析順序導致的崩潰風險，並增加全域請求 Log 監控。

## 📌 待辦與維護重點

1. **部署標準路徑**:
   - 如果要掛在根目錄 (`/`)，Vite 的 `base` 設為 `/`。
   - 如果要掛在子目錄 (`/abc/`)，Vite 的 `base` 則對齊 `/abc/`。
2. **Nginx 配置要領**:
   - `location /admin/` 必須搭配 `alias` 指向實體目錄。
   - `try_files` 最後一項必須寫 `/admin/index.html` 以防止路由重定向失敗。
3. **金庫管理**: 定期備份伺服器根目錄外的 `bojiu-data` 資料夾，這比備份代碼庫更重要。

## 🚀 跨機器快速遷移指南 (Know-how)

由於代碼與數據已完全解耦，切換或新增伺服器（VM）時可實現「秒級部署」：

1. **遷移「金庫」 (Stateful)**：
   - 將舊伺服器的 `/var/www/bojiu-data` 資料夾完整遷移（備份/還原）至新伺服器的相同位置。
   - 這是網站的「靈魂」，包含所有圖片、設定與帳號。

2. **佈署「核心」 (Stateless)**：
   - 在新伺服器執行 `git clone -b release git@github.com:VitoHuang720618/bojiu.git bojiu-release`。
   - 代碼本身不具備狀態，隨時可重新下載。

3. **靈魂連結 (Re-link)**：
   - 進入 `bojiu-release` 目錄並執行 `./deploy.sh`。
   - 部署腳本會自動將新拉取的代碼與現有的 `bojiu-data` 金庫重新連接（Symlink），服務即刻恢復。

---
*Last Updated: 2026-03-27*
