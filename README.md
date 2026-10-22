# 🎮 俄羅斯方塊 (Tetris)

本機啟動（Windows PowerShell，無需安裝套件）：

```powershell
Start-Process .\index.html
```

需要本機 HTTP 服務時，使用 Node.js 22 以上執行 `npm.cmd run dev`，再開啟 http://127.0.0.1:8000。測試與瀏覽器驗證紀錄見 [docs/TESTING.md](docs/TESTING.md)。

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?repo=https://github.com/chiisen/Tetris)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)  
[![GitHub stars](https://img.shields.io/github/stars/chiisen/Tetris)](https://github.com/chiisen/Tetris/stargazers)  

原生 JavaScript／Canvas 單機遊戲，支援鍵盤、滑鼠與觸控操作，沒有多人同步功能。

![Tetris](./images/Tetris.png)

🔗 **線上啟動遊戲**: [https://tetris.liawchiisen.workers.dev/](https://tetris.liawchiisen.workers.dev/)

---

## 📑 目錄

- [📖 遊戲介紹](#遊戲介紹)
- [🌟 功能特性](#功能特性)
- [🧱 方塊類型](#方塊類型)
- [📂 項目結構](#項目結構)
- [💻 本地開發](#本地開發)
- [🎮 操作方式](#操作方式)
- [🏆 計分規則](#計分規則)
- [📈 速度曲線](#速度曲線)
- [🛠️ 技術說明](#技術說明)
- [🌐 瀏覽器相容性](#瀏覽器相容性)
- [❓ 常見問題](#常見問題)
- [📝 更新日誌](#更新日誌)
- [🤝 貢獻指南](#貢獻指南)
- [⚖️ 許可證](#許可證)
- [👤 作者](#作者)

---

## 📖 遊戲介紹

俄羅斯方塊是一款風靡全球的經典方塊消除遊戲。玩家需要透過靈活移動、精準旋轉各種隨機落下的方塊，將它們拼湊成完整的橫線。每消除一行都能獲得分數並釋放空間，挑戰你的手速與空間邏輯！

## 🌟 功能特性

- 🕹️ **經典再現**：提供方塊移動、旋轉、消行及計分。
- 🌈 **全型態方塊**：提供 I、O、T、S、Z、J、L 七種形狀；目前為矩陣旋轉，尚非完整 SRS。
- 🆙 **等級系統**：每消除 10 行即自動升級，挑戰更高難度。
- ⚡ **動態難度**：隨等級提升的方塊下落速度曲線。
- 📱 **全平台支援**：支援輕觸、左右／向下滑動與虛擬按鈕；已驗證手機尺寸排版，實體觸控裝置尚未驗證。
- ⌨️ **流暢控制**：流暢的鍵盤操作響應。
- ⏸️ **隨性暫停**：P 鍵暫停／恢復，頁面隱藏時自動暫停；返回後需手動繼續。
- 🎨 **響應式佈局**：依可用寬高調整棋盤，矮橫向畫面使用雙欄配置。
- 🎵 **沈浸式體驗**：以 Web Audio API 合成音效與背景音樂，提供獨立開關。
- 👻 **落點預覽**：遊戲進行中以淺色外框標示硬降位置，不影響棋盤、分數或音效。
- 🎲 **七袋隨機**：每袋包含七種方塊各一次，下一塊預覽與實際生成共用同一序列。
- 🤖 **智慧 AI**：內建電腦代玩模式，觀察 AI 是如何挑戰高分的。

## 🧱 方塊類型

| 形狀 | 名稱 | 顏色 | 代表符號 |
|:---:|:---:|:---:|:---:|
| **I** | 長條 | 青色 | 🟦 |
| **O** | 方塊 | 黃色 | 🟨 |
| **T** | T 形 | 紫色 | 🟪 |
| **S** | S 形 | 綠色 | 🟩 |
| **Z** | Z 形 | 紅色 | 🟥 |
| **J** | J 形 | 藍色 | 🟦 |
| **L** | L 形 | 橘色 | 🟧 |

## 📂 項目結構

```
Tetris/
├── index.html      # 遊戲主頁面
├── game.js         # 核心遊戲邏輯
├── style.css       # 介面視覺樣式表
├── LICENSE         # MIT 許可證
└── wrangler.jsonc  # Cloudflare Workers 部署配置
```

## 💻 本地開發

### 🚩 前置需求

- 現代瀏覽器；直接開啟遊戲不需要 Node.js。
- 本機 HTTP 服務與測試需要 Node.js 22 以上，不需執行 npm install。

### 🚀 執行方式

1. **複製專案到本地**：
   ```powershell
   git clone https://github.com/chiisen/Tetris.git
   cd Tetris
   ```

2. **啟動遊戲**：
   直接使用瀏覽器開啟 `index.html` 即可開始遊玩！

### ☁️ 部署至 Cloudflare Workers (可選)

如果您希望線上運行自己的版本：
```powershell
npx wrangler deploy
```

## 🎮 操作方式

### ⌨️ 電腦鍵盤

| 按鍵 | 功能說明 |
|:---:|---|
| **←** | 向左平移方塊 |
| **→** | 向右平移方塊 |
| **↓** | 加速下落 (軟降) |
| **↑ / 空格** | 順時針旋轉方塊 |
| **P** | 暫停遊戲 / 恢復遊戲 |

### 📱 手機觸控

- **滑動控制**：向左／右滑動移動，向下滑動軟降；向上滑動目前沒有動作。
- **輕觸點擊**：點擊遊戲區域即可旋轉方塊。
- **虛擬操控**：窄螢幕或矮螢幕顯示移動、旋轉、軟降與「快速」硬降按鈕。
- **滑鼠**：點擊畫布旋轉，左右拖曳移動，向下拖曳軟降。
- 暫停時可點擊「點擊繼續」或按 P 恢復。

### ⚙️ 控制面板

點擊右上角按鈕可快速切換：
- 🎵 **背景音樂** (BGM ON/OFF)
- 🔊 **遊戲音效** (SFX ON/OFF)
- 🤖 **AI 代玩模式** (AI ON/OFF)

## 🏆 計分規則

| 消除行數 | 獲得分數 |
|:---:|---|
| 1 行 | 100 × 當前等級 |
| 2 行 | 300 × 當前等級 |
| 3 行 | 500 × 當前等級 |
| 4 行 | 800 × 當前等級 (Tetris!) |

- **成長機制**：每消除 10 行累計升一級，消行分數使用消行前等級。
- **連擊**：連續消行從第二次起額外加 `50 × 連擊數 × 等級`，未消行即重設。
- **下落**：手動軟降每實際移動一格加 1 分；硬降每格加 2 分；自然下落不加分。
- **AI**：正常下落間隔除以 10，最低 50ms；關閉時依目前等級恢復。
- **難度遞增**：等級越高，方塊的重力感應就越強！

## 📈 速度曲線

| 等級 | 下落間隔時間 (ms) | 挑戰程度 |
|:---:|:---:|:---|
| 1 | 1000 | 開心遊玩 |
| 2 | 900 | |
| 3 | 800 | |
| 4 | 700 | 小試身手 |
| 5 | 600 | |
| 6 | 500 | |
| 7 | 400 | 高手對決 |
| 8 | 300 | |
| 9 | 200 | 極限生存 |
| 10+ | 100 | 神之領域 |

## 🛠️ 技術說明

- 🎨 **HTML5 Canvas**: 基於高速渲染的畫布技術。
- 📡 **Web Audio API**: 提供無延遲的動態音效回饋。
- 📱 **Mobile First**: 優先考慮觸控體驗與彈性佈局。
- ⚡ **Cloudflare Workers**: 高效、快速的全球 CDN 佈局服務。

## 🌐 瀏覽器相容性

| 環境 | 驗證狀態 |
|---|---|
| Windows 本機 Brave／Chromium | 已驗證開始、移動、暫停／恢復與音訊按鈕切換 |
| Codex 內建 Chromium | 已驗證 375×667、390×844、844×390、1280×720 排版與虛擬按鈕 |
| Chrome、Edge、Firefox、Safari | 預期可使用，但本輪未逐一驗證版本 |
| iOS／Android 實體裝置 | 尚未驗證觸控與音訊輸出 |

工具限制及詳細結果見 [測試紀錄](docs/TESTING.md)。

## ❓ 常見問題

### Q: 遊戲進度如何存檔？
A: 目前採用輕量化設計，遊戲資料即時存在記憶體中，重新整理頁面將重啟新局。

### Q: 支援離線遊玩嗎？
A: 將 index.html、game.js、style.css 放在同一個本機資料夾，可直接開檔離線遊玩。線上版本未實作 Service Worker，不能保證首次開啟後就能離線重訪。

### Q: 本機服務無法啟動，或聽不到聲音？
A: 本機服務預設使用 127.0.0.1:8000，先確認連接埠未被占用。音訊須先點擊開始或 BGM 按鈕，並確認瀏覽器與系統沒有靜音。

### Q: 發現 Bug 或想提供建議？
A: 非常歡迎！請前往 [GitHub Issues](https://github.com/chiisen/Tetris/issues) 分享您的想法。

## 📝 更新日誌

詳細的版本演進請參閱 [CHANGELOG.md](CHANGELOG.md)。

## 🤝 貢獻指南

我們非常歡迎開發者社群的參與！

1. Fork 本專案。
2. 建立專屬的功能分支 (`git checkout -b feature/AmazingFeature`)。
3. 提交您的精彩更動 (`git commit -m 'feat(game): 新增遊戲功能'`)。
4. 將分支推送到 GitHub (`git push origin feature/AmazingFeature`)。
5. 發起一個 Pull Request。

## ⚖️ 許可證

本專案基於 **MIT 許可證** 開源 - 詳見 [LICENSE](LICENSE) 檔案。

## 👤 作者

**Eli** - [GitHub Profile](https://github.com/chiisen)

---
*Made with ❤️ by Eli*
