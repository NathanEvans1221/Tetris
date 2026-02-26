# 俄羅斯方塊 (Tetris)

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?repo=https://github.com/chiisen/Tetris)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/chiisen/Tetris)](https://github.com/chiisen/Tetris/stargazers)

經典俄羅斯方塊網頁版，支援電腦與手機遊玩。

**線上 DEMO**: https://tetris.liawchiisen.workers.dev/

## 目錄

- [遊戲介紹](#遊戲介紹)
- [功能特性](#功能特性)
- [方塊類型](#方塊類型)
- [項目結構](#項目結構)
- [本地開發](#本地開發)
- [操作方式](#操作方式)
- [計分規則](#計分規則)
- [速度曲線](#速度曲線)
- [技術說明](#技術說明)
- [瀏覽器相容性](#瀏覽器相容性)
- [常見問題](#常見問題)
- [更新日誌](#更新日誌)
- [貢獻指南](#貢獻指南)
- [許可證](#許可證)
- [作者](#作者)

## 遊戲介紹

俄羅斯方塊是一款經典的方塊消除遊戲。玩家透過移動、旋轉各種形狀的方塊，將它們堆疊成完整的橫線即可消除並獲得分數。

## 功能特性

- 經典俄羅斯方塊玩法
- 7 種標準方塊形狀 (I, O, T, S, Z, J, L)
- 等級系統（每消除 10 行升一級）
- 速度遞增機制
- 觸控操作支援（滑動 + 虛擬按鈕）
- 鍵盤操作支援
- 暫停/繼續功能
- RWD 響應式設計
- 行動裝置優化
- 音效系統 (Web Audio API)
- 音效開關
- 背景音樂 (可開關)
- 電腦代玩 (AI)

## 方塊類型

| 形狀 | 名稱 | 顏色 |
|------|------|------|
| I | 長條 | 青色 |
| O | 方塊 | 黃色 |
| T | T 形 | 紫色 |
| S | S 形 | 綠色 |
| Z | Z 形 | 紅色 |
| J | J 形 | 藍色 |
| L | L 形 | 橘色 |

## 項目結構

```
Tetris/
├── index.html      # 遊戲主頁面
├── game.js         # 遊戲邏輯
├── style.css       # 樣式表
├── LICENSE         # MIT 許可證
└── wrangler.jsonc  # Cloudflare Workers 部署配置
```

## 本地開發

### 前置需求

- 現代瀏覽器 (Chrome, Firefox, Safari, Edge)

### 執行方式

1. 複製專案
   ```bash
   git clone https://github.com/chiisen/Tetris.git
   cd Tetris
   ```

2. 使用瀏覽器開啟 `index.html` 即可開始遊玩

### 部署至 Cloudflare Workers (可選)

```bash
npx wrangler deploy
```

## 操作方式

### 電腦

| 按鍵 | 功能 |
|------|------|
| ← | 左移 |
| → | 右移 |
| ↓ | 加速下落 |
| ↑ / 空格 | 旋轉 |
| P | 暫停/繼續 |

### 手機

- **滑動操作**：上下左右滑動控制方塊
- **點擊**：旋轉方塊
- **虛擬按鈕**：螢幕底部有方向鍵可使用

### 音效

- 🎵 背景音樂開關
- 🔊 音效開關
- 🤖 電腦代玩開關

點擊右上角按鈕切換。

## 計分規則

| 消除行數 | 分數 |
|----------|------|
| 1 行 | 100 × 等級 |
| 2 行 | 300 × 等級 |
| 3 行 | 500 × 等級 |
| 4 行 | 800 × 等級 |

- 等級：每消除 10 行升一級
- 等級越高，下落速度越快

## 速度曲線

| 等級 | 下落時間 (ms) |
|------|---------------|
| 1 | 1000 |
| 2 | 900 |
| 3 | 800 |
| 4 | 700 |
| 5 | 600 |
| 6 | 500 |
| 7 | 400 |
| 8 | 300 |
| 9 | 200 |
| 10+ | 100 |

## 技術說明

- 採用原生 HTML5 Canvas 開發
- 支援 RWD 響應式設計
- 支援觸控與滑鼠操作
- 部署於 Cloudflare Workers

## 瀏覽器相容性

| 瀏覽器 | 最低版本 |
|--------|----------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

## 常見問題

### Q: 遊戲如何存檔？
A: 目前遊戲資料僅存在瀏覽器記憶體中，重新整理頁面會重置遊戲。

### Q: 支援離線遊玩嗎？
A: 是的，只要瀏覽過一次後即可離線遊玩（使用 Service Worker 快取）。

### Q: 如何回報問題？
A: 請至 [GitHub Issues](https://github.com/chiisen/Tetris/issues) 回報。

## 更新日誌

請參閱 [CHANGELOG.md](CHANGELOG.md) 查看所有版本變更。

## 貢獻指南

歡迎提交 Issue 或 Pull Request！

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 許可證

本專案採用 MIT 許可證 - 詳見 [LICENSE](LICENSE) 檔案。

## 作者

Eli - [GitHub](https://github.com/chiisen)
