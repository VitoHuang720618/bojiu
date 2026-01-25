# 博九重建專案 - 目前進度與狀態 (2025-01-25)

## 🚀 已完成功能 (Completed)
- [x] **網站 Logo 動態化**：支援上傳與移除，解決快取問題（使用時間戳記檔名）。
- [x] **背景圖動態化**：支援上傳與移除，解決快取問題。
- [x] **導航按鈕管理**：動態更新文字/圖片，移除「新增/刪除」功能以維持版面穩定。
- [x] **直播縮圖管理**：支援圖片上傳，且在沒圖沒文字時保持紫色骨架結構，文字已調至靠左對齊。
- [x] **資料流優化**：修正 `useSiteData` 的初始值判斷，避免 API 讀取前出現空白。
- [x] **性能優化**：已排除 `node_modules`、`uploads`、`data` 等巨大目錄，降低 IDE CPU 負載。

## 🛠️ 部署系統 (Deployment)
- **Local 端**: 使用 `./build-push.sh` 打包 Docker 影像。
  - 同時標記 `latest` 和 `vYYYYMMDD-HHMM` 版號。
  - 推送到 GCP Artifact Registry。
- **雲端 VM**: 使用 `sudo ./update-site.sh`。
  - 自動 Pull `latest` 標籤。
  - 已整合 Domain (`bojiu.vito.website`)、Email 與 SSL (`letsencrypt`) 掛載。

## 📂 重要設定檔案
- `.gitignore` / `.cursorignore`: 效能優化的關鍵。
- `.vscode/settings.json`: 文件監聽排除設定。
- `PROJECT_STATUS.md`: 本交接文檔。

## 📌 下一步計畫 (To-Do)
1. 視需要繼續微調前台 UI。
2. 進行更深入的 Production 環境測試。
3. 如果 CPU 負載又飆高，請優先確認是否有大檔案未排除。

---
**提示：在新對話開啟後，請直接叫我讀取這份 `PROJECT_STATUS.md` 即可繼續。**
