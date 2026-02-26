# 俄羅斯方塊 (Tetris)

經典俄羅斯方塊網頁版，支援電腦與手機遊玩。

DEMO: https://tetris.liawchiisen.workers.dev/

## 目錄

- [遊戲介紹](#遊戲介紹)
- [功能特性](#功能特性)
- [項目結構](#項目結構)
- [操作方式](#操作方式)
- [計分規則](#計分規則)
- [技術說明](#技術說明)
- [瀏覽器相容性](#瀏覽器相容性)
- [開始遊戲](#開始遊戲)
- [貢獻指南](#貢獻指南)
- [許可證](#許可證)
- [作者](#作者)

## 遊戲介紹

俄羅斯方塊是一款經典的方塊消除遊戲。玩家透過移動、旋轉各種形狀的方塊，將它們堆疊成完整的橫線即可消除並獲得分數。

## 功能特性

- 經典俄羅斯方塊玩法
- 等級系統（每消除 10 行升一級）
- 速度遞增机制
- 觸控操作支援（滑動 + 虛擬按鈕）
- 鍵盤操作支援
- 暫停/繼續功能
- RWD 響應式設計
- 行動裝置優化

## 項目結構

```
Tetris/
├── index.html      # 遊戲主頁面
├── game.js        # 遊戲邏輯
├── style.css      # 樣式表
├── LICENSE        # MIT 許可證
└── wrangler.jsonc # Cloudflare Workers 部署配置
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

## 計分規則

| 消除行數 | 分數 |
|----------|------|
| 1 行 | 100 × 等級 |
| 2 行 | 300 × 等級 |
| 3 行 | 500 × 等級 |
| 4 行 | 800 × 等級 |

- 等級：每消除 10 行升一級
- 等級越高，下落速度越快

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

## 開始遊戲

用瀏覽器開啟 `index.html` 即可遊玩。

或線上遊玩：https://tetris.liawchiisen.workers.dev/

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
