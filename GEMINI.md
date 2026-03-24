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

- **UI 視覺全面升級**:
  - **Header/Footer 漸層**: 
    - Header 更新為新的湛藍漸層 (`linear-gradient(0deg,#3041b9 0%, #081fb3 100%)`) 並增加陰影。
    - Footer 與平板/手機版廣告區塊更新為深色質感漸層 (`#060417, #232323`)。
  - **推薦區域 (.recommend-content)**: 
    - 背景由半透明改為實色 (`rgba(20, 10, 104, 1.0)`) 以增加內容可讀性。
    - **標題優化**: 「推荐优质线路」更換新版皇冠圖示 (48x33px)，文字改為純白色 (`#ffffff`)，並透過解除固定寬度修正了文字裁切問題。
    - **區塊細節**: `.block-title` 背景色統一調整為深靛藍色 `#3625c3`，且 Tool Hover 效果同步更新。
  - **按鈕與圖示**:
    - 「回到頂部」按鈕樣式重塑，改用本地圖片資源替代純 CSS 結構。
    - 更新「賽事精選」與「娛樂直播」區塊標題圖示。
- **靜態化與資產本地化**:
  - 成功建置 `demo-static` 純靜態分支，資料鎖定於 `siteConfig.ts`。
  - 透過 `./scripts/download.cjs` 完成 GCP 圖片全數下載並指向 `/uploads/` 目錄。
- **穩定性修正**:
  - `FooterComponent.vue`: 移除不必要的 Code 依賴，並將版權宣告硬編碼至樣板中，防止因 API 請求失敗導致底部文字缺失。
  - 修正了 `build-push.sh` 在打包時可能遇到的 TypeScript 未使用變數報錯 (TS6133)。

## 📌 待辦與維護重點

1. **雙專案同步標準流程 (重要)**:
   - 先於 `demo` 進行代碼變更。
   - 執行同步指令：`rsync -av --delete --exclude 'node_modules' --exclude 'dist' --exclude '.git' --exclude 'public/uploads' demo/ demo-static/`。
   - 重新執行 `node demo-static/scripts/download.cjs` 確保圖片與設定同步。
2. **靜態資源管理**: 新增圖片若需進入 `demo-static`，必須確保其路徑已在 `siteConfig.ts` 指向 `/uploads/`。
3. **VM 更新**: commit 推送後需在 VM 執行更新指令才能生效。

---
*Last Updated: 2026-03-24*
