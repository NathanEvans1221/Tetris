# 驗證方式

需要 Node.js 22 以上，不需安裝 npm 套件。Windows PowerShell 執行：

```powershell
npm.cmd test
npm.cmd run check
git diff --check
```

測試以 Node VM 執行真正的 game.js，僅替代 DOM、Canvas、AudioContext、時鐘與排程等瀏覽器邊界。隨機來源可注入，時間可手動推進，沒有真實等待或網路依賴。

這些測試驗證遊戲狀態及排程邏輯，不代表畫面、觸控或實際音效已通過瀏覽器驗證。每個相關 Issue 應另記錄瀏覽器、視窗尺寸、操作結果與驗證限制。
