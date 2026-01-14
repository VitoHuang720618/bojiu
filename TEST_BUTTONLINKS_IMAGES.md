# ButtonLinks 圖片載入測試

## 問題描述
管理界面中的按鈕鏈接設置沒有載入原本該有的圖片。

## 解決方案

### 1. 修復了配置載入邏輯
- 在 `ConfigManager.vue` 的 `loadConfig` 方法中添加了預設值初始化
- 確保當 API 返回空的 buttonLinks 時，會自動填充預設配置

### 2. 添加了圖片路徑處理
- 新增 `getImageUrl` 方法來處理不同類型的圖片路徑
- 支持 `/uploads/` 路徑（用戶上傳的圖片）
- 支持 `/assets/` 路徑（預設的靜態資源）

### 3. 確認圖片文件存在
所有配置中引用的圖片文件都存在於 `demo/public/assets/images/` 目錄中：

**按鈕 1 - 寰宇瀏覽器：**
- 默認圖：`2d60d632-004e-4b69-ac84-8fc1817ce52e.png` ✅
- 懸停圖：`6ef6554f-4b80-4cd0-9bbf-782dc066c330.png` ✅

**按鈕 2 - APP：**
- 默認圖：`1630a76f-f7e7-4af7-8099-082bc201512c.png` ✅
- 懸停圖：`4d106ec5-aa73-4fd5-915e-7e1c6311afa5.png` ✅

**按鈕 3 - FUN乐园：**
- 默認圖：`64e1d47d-537d-45d0-bfd4-801e473bb525.png` ✅
- 懸停圖：`87fe8990-8297-4e70-9693-e37c665ee087.png` ✅

**按鈕 4 - 合作夥伴：**
- 默認圖：`95e17bec-043c-49ea-a438-e8057a39f4ad.png` ✅
- 懸停圖：`e9df8ef5-cd97-4c06-b051-a894e67f0935.png` ✅

## 測試步驟

### 1. 啟動服務
```bash
# 啟動後端
npm run dev:backend

# 啟動管理前端
npm run dev:manager

# 啟動 demo 前端
npm run dev:demo
```

### 2. 測試管理界面
1. 訪問 `http://localhost:3001`
2. 登錄管理界面
3. 進入「配置管理」→「按鈕鏈接」
4. 確認所有按鈕都顯示了預設圖片

### 3. 測試前端顯示
1. 訪問 `http://localhost:3000`
2. 確認頂部 4 個按鈕都正確顯示
3. 測試滑鼠懸停效果
4. 測試點擊跳轉功能

## 修復的關鍵代碼

### ConfigManager.vue - 配置載入邏輯
```typescript
// 如果 buttonLinks 為空或不完整，初始化預設值
if (!config.buttonLinks || config.buttonLinks.length === 0) {
  config.buttonLinks = [
    {
      text: '寰宇瀏覽器',
      href: 'https://www.ub66.com/',
      target: '_blank',
      defaultImage: '/assets/images/2d60d632-004e-4b69-ac84-8fc1817ce52e.png',
      hoverImage: '/assets/images/6ef6554f-4b80-4cd0-9bbf-782dc066c330.png'
    },
    // ... 其他按鈕配置
  ]
}
```

### 圖片路徑處理
```typescript
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return ''
  
  // 處理 /uploads/ 路徑
  if (imagePath.startsWith('/uploads/')) {
    return imagePath
  }
  
  // 處理 /assets/ 路徑
  if (imagePath.startsWith('/assets/')) {
    if (import.meta.env.DEV) {
      return `http://localhost:3000${imagePath}`
    }
    return imagePath
  }
  
  return imagePath
}
```

## 預期結果

修復後，管理界面應該能夠：
1. ✅ 正確載入並顯示所有按鈕的預設圖片
2. ✅ 支持上傳新的按鈕圖片
3. ✅ 正確處理不同路徑的圖片資源
4. ✅ 在預覽區域正確顯示按鈕效果

前端 demo 應該能夠：
1. ✅ 顯示正確的按鈕圖片
2. ✅ 支持懸停效果切換
3. ✅ 點擊按鈕正確跳轉
4. ✅ 動態更新配置變更