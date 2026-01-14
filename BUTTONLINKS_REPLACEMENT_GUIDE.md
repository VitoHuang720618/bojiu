# ButtonLinks 置換功能使用指南

## 功能概述

現在 demo/frontbuttonLinks 已經支持完整的動態置換功能，包括：
- 動態配置按鈕鏈接地址和顯示文字
- 上傳自定義按鈕圖片（默認圖和懸停圖）
- 通過管理界面進行可視化編輯
- 所有按鈕鏈接都會在新視窗中打開

## 配置方式

### 1. 通過管理界面配置（推薦）

1. 啟動後端服務器：`npm run dev:backend`
2. 啟動管理前端：`npm run dev:manager`
3. 訪問管理界面：`http://localhost:3001`
4. 登錄後進入「配置管理」
5. 點擊「按鈕鏈接」標籤頁
6. 在此頁面可以：
   - **新增按鈕鏈接**：添加新的按鈕
   - **編輯按鈕內容**：修改顯示文字和鏈接地址
   - **上傳按鈕圖片**：分別上傳默認圖片和懸停圖片
   - **刪除按鈕**：移除不需要的按鈕
   - **重置為預設**：一鍵恢復到預設配置

### 2. 直接編輯配置文件

在 `data/config.json` 中配置 buttonLinks：

```json
{
  "buttonLinks": [
    {
      "text": "寰宇瀏覽器",
      "href": "https://www.ub66.com/",
      "target": "_blank",
      "defaultImage": "/assets/images/2d60d632-004e-4b69-ac84-8fc1817ce52e.png",
      "hoverImage": "/assets/images/6ef6554f-4b80-4cd0-9bbf-782dc066c330.png"
    },
    {
      "text": "APP",
      "href": "https://haa68686.com:9900/web/simple.php#/aioDownload",
      "target": "_blank",
      "defaultImage": "/assets/images/1630a76f-f7e7-4af7-8099-082bc201512c.png",
      "hoverImage": "/assets/images/4d106ec5-aa73-4fd5-915e-7e1c6311afa5.png"
    }
  ]
}
```

## 管理界面功能詳解

### 按鈕鏈接管理頁面特色：

1. **圖片上傳功能**：
   - **默認圖片**：按鈕正常狀態下顯示的圖片
   - **懸停圖片**：滑鼠懸停時顯示的圖片
   - 支持常見圖片格式（PNG, JPG, GIF, SVG）
   - 自動處理圖片路徑和存儲

2. **視覺化編輯**：
   - 直觀的表單界面，無需手動編輯 JSON
   - 圖片預覽功能，上傳後立即可見
   - 響應式設計，支持移動設備操作

3. **即時預覽**：
   - 修改後可立即在預覽區域查看效果
   - 自動刷新預覽頁面

4. **批量操作**：
   - 「新增按鈕」：添加新的按鈕鏈接
   - 「重置為預設」：一鍵恢復到預設配置（包含預設圖片）

### 字段說明：

- **顯示文字**：按鈕的 alt 文字和標題（用於無障礙訪問）
- **鏈接地址**：點擊按鈕後跳轉的 URL
- **默認圖片**：按鈕正常狀態的圖片
- **懸停圖片**：滑鼠懸停時的圖片
- **打開方式**：固定為新視窗打開（`_blank`）

## 圖片管理功能

### 上傳流程：
1. 點擊「選擇文件」按鈕
2. 選擇圖片文件（建議尺寸相同以保持一致性）
3. 系統自動上傳並保存到 `/uploads/` 目錄
4. 立即更新配置並刷新預覽

### 圖片要求：
- **格式**：PNG, JPG, GIF, SVG
- **建議尺寸**：根據設計需求，建議所有按鈕圖片使用相同尺寸
- **文件大小**：建議小於 2MB 以確保載入速度

### 圖片回退機制：
- 如果自定義圖片不存在，會自動使用 assetManifest 中的預設圖片
- 確保按鈕始終有圖片顯示，不會出現空白

## API 端點

- **公開配置**：`/api/public/config` - 前端獲取配置數據
- **管理配置**：`/api/config` - 管理界面讀寫配置
- **圖片上傳**：`/api/upload` - 處理圖片上傳

## 工作原理

### 前端渲染邏輯：
1. **載入配置**：HomePage.vue 在 `onMounted` 時調用 API
2. **圖片優先級**：
   - 優先使用 API 返回的自定義圖片
   - 如果沒有自定義圖片，使用 assetManifest 中的預設圖片
3. **動態渲染**：使用 `effectiveButtonLinks` 計算屬性處理數據
4. **響應式更新**：配置變更後自動更新顯示

### 數據流：
```
管理界面 → API → 配置文件 → 前端 API → 頁面渲染
```

## 數據格式

### 完整配置格式：
```typescript
interface ButtonLinkConfig {
  text: string           // 顯示文字
  href: string          // 鏈接地址
  target: string        // 打開方式（固定為 "_blank"）
  defaultImage?: string // 默認圖片路徑
  hoverImage?: string   // 懸停圖片路徑
}
```

### API 返回格式：
```json
{
  "buttonLinks": [
    {
      "text": "按鈕名稱",
      "href": "https://example.com",
      "target": "_blank",
      "defaultImage": "/uploads/button-default.png",
      "hoverImage": "/uploads/button-hover.png"
    }
  ]
}
```

## 測試方式

### 完整測試流程：
1. **啟動服務**：
   ```bash
   npm run dev:backend    # 後端 API 服務
   npm run dev:manager    # 管理界面
   npm run dev:demo       # 前端展示頁面
   ```

2. **測試圖片上傳**：
   - 在管理界面上傳新的按鈕圖片
   - 檢查圖片是否正確保存到 `/uploads/` 目錄
   - 驗證前端頁面是否顯示新圖片

3. **測試鏈接功能**：
   - 修改按鈕鏈接地址
   - 在前端頁面點擊按鈕
   - 確認是否跳轉到正確的 URL

4. **測試懸停效果**：
   - 在前端頁面將滑鼠懸停在按鈕上
   - 確認圖片是否正確切換

## 注意事項

### 設計建議：
- **圖片一致性**：建議所有按鈕使用相同的尺寸和風格
- **懸停效果**：懸停圖片應該與默認圖片有明顯的視覺差異
- **按鈕數量**：建議保持 4 個按鈕以符合原始設計

### 技術限制：
- 圖片文件大小限制：10MB（可在後端配置中調整）
- 支持的圖片格式：PNG, JPG, GIF, SVG
- 所有按鈕鏈接都會在新視窗中打開

### 故障排除：
1. **圖片不顯示**：
   - 檢查圖片路徑是否正確
   - 確認圖片文件是否存在於 `/uploads/` 目錄
   - 檢查圖片格式是否支持

2. **上傳失敗**：
   - 檢查文件大小是否超過限制
   - 確認後端服務是否正常運行
   - 查看瀏覽器控制台錯誤信息

## 相關文件

### 前端文件：
- **主組件**：`demo/src/components/HomePage.vue`
- **服務層**：`demo/src/services/carouselService.ts`
- **類型定義**：`demo/src/types/index.ts`

### 管理界面：
- **配置組件**：`manager/front/src/components/ConfigManager.vue`
- **服務層**：`manager/front/src/services/configService.ts`

### 後端文件：
- **API 服務**：`manager/backend/src/server.ts`
- **類型定義**：`manager/backend/src/types.ts`
- **配置文件**：`data/config.json`

這個完整的按鈕鏈接置換功能現在支持圖片上傳和管理，提供了與精選短視頻設置相同的用戶體驗。