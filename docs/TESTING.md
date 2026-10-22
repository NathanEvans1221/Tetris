# 驗證方式

需要 Node.js 22 以上，不需安裝 npm 套件。Windows PowerShell 執行：

```powershell
npm.cmd test
npm.cmd run check
git diff --check
```

測試以 Node VM 執行真正的 game.js，僅替代 DOM、Canvas、AudioContext、時鐘與排程等瀏覽器邊界。隨機來源可注入，時間可手動推進，沒有真實等待或網路依賴。

這些測試驗證遊戲狀態及排程邏輯，不代表畫面、觸控或實際音效已通過瀏覽器驗證。每個相關 Issue 應另記錄瀏覽器、視窗尺寸、操作結果與驗證限制。

## 瀏覽器紀錄（2026-10-23）

- #3：本機 Brave／Chromium，1810×968 CSS px。開始、左移、鍵盤暫停、連續五次恢復／暫停、點擊覆蓋層恢復正常；遊戲畫面正常，當次 console error 為 0。單一 RAF 數量由 Node 排程測試驗證。
- 本機服務：node scripts/serve.cjs；僅綁定 127.0.0.1:8000，僅提供遊戲所需的四個靜態檔案。
