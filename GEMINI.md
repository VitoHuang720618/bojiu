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

## ✅ 近期關鍵修改 (2026-03)

- **生產環境自動化發布流程 (GCP/VPS)**:
  - **成品化模型 (Build-Artifact Model)**: 引進 `release` 專用分支，僅存放本地編譯後的成品 (`dist/`)，徹底解決伺服器端編譯工具依賴問題。
  - **發布雙引擎**:
    - `publish-release.sh` (本地機): 一鍵完成「三端編譯 + 抽離成品 + 強力推送」。
    - `deploy.sh` (伺服器端): 支援「自動安裝 PM2 + 持久化金庫掛載 + 服務重啟」。
  - **一鍵更新工具**: 新增 `update.sh` 與 `generate-nginx-conf.sh`，大幅簡化營運人員的操作難度。
- **數據與核心分離 (Decoupling Architecture)**:
  - **持久化金庫 (`bojiu-data`)**: 在代碼目錄旁建立獨立資料夾，保護上傳圖片、資料庫與動態設定。
  - **絕對路徑傳送門 (Absolute Symlinks)**: 透過部署腳本自動建立絕對路徑軟連結，確保 `git reset --hard` 更新代碼時，使用者數據依然穩如泰山且能正確讀取。
- **穩定性與安全性修正**:
  - **動態樣式優化**: 重構 `HomePage.vue` 與 `HeaderComponent.vue`，改用 `watch` + 手動 `document.head` 注入動態 CSS，解決了熱更新時 Vue 全域側邊效應報錯的問題。
  - **預設認證固化**: 於後端初始化邏輯中鎖定預設管理員為 `admin` / `Admin123!`，且關閉初次登入強制修改密碼，確保新環境佈署後的即時可用性。

## 📌 待辦與維護重點

1. **部署標準流程 (重要)**:
   - **發布**: 在本機執行 `./publish-release.sh`。
   - **更新**: 在伺服器執行 `./update.sh`。
2. **雙專案同步流程**:
   - `demo` 修改後，執行 `rsync -av --delete --exclude 'node_modules' --exclude 'dist' --exclude '.git' --exclude 'public/uploads' demo/ demo-static/`。
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
