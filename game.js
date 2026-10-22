/**
 * 音效管理器 - 負責處理遊戲中所有音效與背景音樂
 * 使用 Web Audio API 產生各種遊戲音效
 */
class SoundManager {
    constructor() {
        this.ctx = null;                         // Web Audio Context 實例
        this.enabled = true;                      // 音效開關狀態
        this.bgmEnabled = false;                  // 背景音樂開關狀態
        this.bgmInterval = null;                  // BGM 播放定時器
        this.bgmNotes = [                         // BGM 音符配置 (頻率 Hz, 持續秒數)
            { freq: 261.63, dur: 0.2 },           // C4
            { freq: 293.66, dur: 0.2 },           // D4
            { freq: 329.63, dur: 0.2 },           // E4
            { freq: 349.23, dur: 0.2 },           // F4
            { freq: 392.00, dur: 0.2 },           // G4
            { freq: 349.23, dur: 0.2 },           // F4
            { freq: 329.63, dur: 0.2 },           // E4
            { freq: 293.66, dur: 0.2 },           // D4
        ];
        this.bgmIndex = 0;                         // 當前播放的音符索引
    }

    /**
     * 初始化 Web Audio Context
     * 必须在用户交互后调用以符合浏览器策略
     */
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * 播放單一音調
     * @param {number} freq - 頻率 (Hz)
     * @param {number} duration - 持續時間 (秒)
     * @param {string} type - 波形類型 (square/sine/sawtooth)
     * @param {number} volume - 音量 (0-1)
     */
    playTone(freq, duration, type = 'square', volume = 0.1) {
        if (!this.enabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    /**
     * 開始播放背景音樂
     * 依序播放预设的音符序列，形成循环旋律
     */
    startBgm() {
        if (!this.bgmEnabled || !this.ctx || this.bgmInterval) return;

        const playNote = () => {
            if (!this.bgmEnabled) return;
            const note = this.bgmNotes[this.bgmIndex];
            this.playTone(note.freq, note.dur * 0.8, 'sine', 0.04);
            this.bgmIndex = (this.bgmIndex + 1) % this.bgmNotes.length;
        };

        playNote();
        this.bgmInterval = setInterval(playNote, 400);
    }

    /**
     * 停止背景音樂
     */
    stopBgm() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        this.bgmIndex = 0;
    }

    /**
     * 切換背景音樂開關狀態
     * @returns {boolean} 新的BGM狀態
     */
    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
            this.init();
            this.startBgm();
        } else {
            this.stopBgm();
        }
        return this.bgmEnabled;
    }

    /**
     * 方塊移動音效 - 低頻短促音
     */
    move() {
        this.playTone(200, 0.05, 'sine', 0.05);
    }

    rotate() {
        this.playTone(300, 0.05, 'sine', 0.05);
    }

    /**
     * 軟掉落音效 - 低頻短促音
     */
    drop() {
        this.playTone(150, 0.05, 'sine', 0.05);
    }

    /**
     * 消除行數音效 - 根據消除行數產生不同頻率的音效
     * @param {number} lines - 消除的行數 (1-4)
     */
    lineClear(lines) {
        const baseFreq = 400 + (lines * 50);
        for (let i = 0; i < lines; i++) {
            setTimeout(() => {
                this.playTone(baseFreq + (i * 100), 0.15, 'square', 0.08);
            }, i * 50);
        }
    }

    /**
     * 升級音效 - 播放上升音階 (C5, E5, G5, C6)
     */
    levelUp() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.1);
            }, i * 100);
        });
    }

    /**
     * 遊戲結束音效 - 播放下降音階
     */
    gameOver() {
        const notes = [400, 350, 300, 250, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.3, 'sawtooth', 0.1);
            }, i * 150);
        });
    }

    /**
     * 切換音效開關
     * @returns {boolean} 新的音效狀態
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// ==================== 遊戲常數 ====================
/** 遊戲區域寬度 (格子數) */
const COLS = 10;
/** 遊戲區域高度 (格子數) */
const ROWS = 20;
/** 每個方塊的大小 (像素)，從 CSS 變數讀取，預設 28px */
const BLOCK_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 28;

/** 方塊編號：1 I、2 O、3 T、4 S、5 Z、6 J、7 L。 */
const COLORS = [null, '#00f0f0', '#f0f000', '#a000f0', '#00f000', '#f00000', '#0000f0', '#f0a000'];
const SHAPES = [
    [],
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    [[2,2],[2,2]],
    [[0,3,0],[3,3,3],[0,0,0]],
    [[0,4,4],[4,4,0],[0,0,0]],
    [[5,5,0],[0,5,5],[0,0,0]],
    [[6,0,0],[6,6,6],[0,0,0]],
    [[0,0,7],[7,7,7],[0,0,0]]
];

/**
 * 俄羅斯方塊遊戲主類別
 * 負責遊戲邏輯、渲染、控制與 AI 自動玩法
 */
class Tetris {
    constructor() {
        // 取得 DOM 元素
        this.canvas = document.getElementById('game-canvas');           // 遊戲畫布
        this.ctx = this.canvas.getContext('2d');                        // 2D 繪圖上下文
        this.nextCanvas = document.getElementById('next-canvas');       // 下一個方塊畫布
        this.nextCtx = this.nextCanvas.getContext('2d');               // 下一個方塊繪圖上下文

        // 建立音效管理器
        this.sounds = new SoundManager();

        // 設定畫布尺寸
        this.canvas.width = COLS * BLOCK_SIZE;      // 遊戲區域寬度
        this.canvas.height = ROWS * BLOCK_SIZE;     // 遊戲區域高度
        this.nextCanvas.width = 4 * BLOCK_SIZE;     // 預覽區寬度
        this.nextCanvas.height = 4 * BLOCK_SIZE;    // 預覽區高度

        // 遊戲狀態
        this.board = this.createBoard();             // 遊戲區域 (20x10 的二維陣列)
        this.score = 0;                              // 當前分數
        this.level = 1;                              // 當前等級
        this.lines = 0;                              // 總消除行數
        this.combo = 0;                              // 連擊次數
        this.gameOver = false;                       // 遊戲結束標誌
        this.paused = false;                         // 暫停標誌

        // 方塊狀態
        this.currentPiece = null;                    // 當前控制的方塊
        this.nextPiece = null;                       // 下一個方塊

        // 計時與速度控制
        this.dropInterval = 1000;                    // 自動掉落間隔 (毫秒)
        this.lastDrop = 0;                           // 上次掉落時間戳
        this.lastLevel = 1;                          // 記錄前一次等級

        // 自動玩法功能
        this.autoPlay = false;                       // 自動玩法開關
        this.autoPlayInterval = null;                 // 自動玩法定時器

        // 循環狀態
        this.isLooping = false;                      // 記錄循環是否正在運行

        // 綁定鍵盤與按鈕事件
        this.bindEvents();

        // 啟動初始遊戲循環 (負責繪製背景與未開始狀態)
        this.gameLoop();
    }

    /**
     * 建立空的遊戲區域
     * @returns {Array<Array<number>>} 20x10 的二維陣列，0 表示空
     */
    createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    /**
     * 初始化遊戲狀態
     * 重置所有遊戲變數並準備開始新遊戲
     */
    init() {
        this.sounds.init();                              // 初始化音效系統
        this.board = this.createBoard();                // 建立新遊戲區域
        this.score = 0;                                 // 重置分數
        this.level = 1;                                 // 重置等級
        this.lines = 0;                                 // 重置消除行數
        this.combo = 0;                                 // 重置連擊
        this.gameOver = false;                          // 清除遊戲結束狀態
        this.paused = false;                            // 清除暫停狀態
        this.started = false;                           // 標記為未開始
        this.nextPiece = null;                          // 清除下一個方塊
        this.currentPiece = null;                       // 清除當前方塊
        this.dropInterval = 1000;                       // 重置掉落速度
        this.lastDrop = Date.now();                     // 重置計時
        this.lastLevel = 1;                             // 重置等級記錄

        // 停止並清除自動玩法定時器
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.autoPlay = false;                          // 關閉自動玩法
        document.getElementById('btn-auto').textContent = '🤖';  // 重置按鈕圖示

        this.updateScore();                             // 更新分數顯示
        this.draw();                                    // 繪製初始畫面
    }

    /**
     * 開始遊戲
     * 產生第一個方塊並啟動遊戲循環
     */
    start() {
        this.started = true;
        this.spawnPiece();                            // 產生第一個方塊
        this.lastDrop = Date.now();

        // 如果循環因為遊戲結束而停止，則重新啟動
        if (!this.isLooping) {
            this.gameLoop();
        }
    }

    /**
     * 硬掉落 - 讓方塊直接落到底部
     * 每次下落 2 分，快速填充時使用
     */
    canAct() {
        return this.started && !this.gameOver && !this.paused && !!this.currentPiece;
    }

    softDrop() {
        if (this.drop()) {
            this.score++;
            this.sounds.drop();
            this.updateScore();
        }
    }

    hardDrop() {
        if (!this.canAct()) return;
        // 持續向下直到無法移動
        while (!this.collide(this.board, { ...this.currentPiece, y: this.currentPiece.y + 1 })) {
            this.currentPiece.y++;
            this.score += 2;  // 每次移動獲得 2 分
        }
        this.lock();           // 鎖定方塊
        this.clearLines();     // 檢查消除
        this.spawnPiece();     // 產生新方塊
        this.updateScore();    // 更新顯示
    }

    /**
     * 鎖定方塊
     * 將當前方塊的顏色寫入遊戲區域
     */
    lock() {
        // 遍歷方塊的每個格子
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                // 將非空的格子寫入遊戲區域
                if (this.currentPiece.shape[y][x] !== 0) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    // 確保在畫面範圍內 (y >= 0)
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    /**
     * 消除滿行
     * 檢查每行是否有空格，若滿行則消除並計算分數
     */
    clearLines() {
        let linesCleared = 0;

        // 從底部向上檢查每一行
        for (let y = ROWS - 1; y >= 0; y--) {
            // 檢查該行是否全滿 (沒有 0)
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);              // 移除該行
                this.board.unshift(Array(COLS).fill(0));  // 頂部加入新空行
                linesCleared++;
                y++;  // 重新檢查同一位置 (因為上方行已下移)
            }
        }

        // 有消除行數時計算分數與升級
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.combo++;

            // 分數計算: 基礎分數 (依消除行數) * 等級 + 連擊獎勵
            // 消除 1-4 行分別獲得 100, 300, 500, 800 分 (乘以等級)
            const baseScore = [0, 100, 300, 500, 800][linesCleared] * this.level;
            const comboBonus = this.combo > 1 ? 50 * this.combo * this.level : 0;
            this.score += baseScore + comboBonus;

            // 等級計算: 每消除 10 行升一級
            const oldLevel = this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            // 速度計算: 每升一級減少 100ms，最少 100ms
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);

            this.sounds.lineClear(linesCleared);  // 播放消除音效
            if (this.level > oldLevel) {
                this.sounds.levelUp();            // 播放升級音效
            }

            this.animateLineClear();              // 播放消除動畫
            if (this.combo > 1) {
                this.showComboEffect(this.combo); // 顯示連擊效果
            }
            this.updateScore();
        } else {
            this.combo = 0;  // 沒有消除時重置連擊
            this.updateScore();
        }
    }

    /**
     * 產生新方塊
     * 隨機選擇一種方塊類型，設定位置並檢查遊戲結束條件
     */
    spawnPiece() {
        // 第一次產生方塊時，隨機選擇類型
        if (this.nextPiece === null) {
            // 隨機產生 1-7 的數字對應 7 種方塊形狀
            const type = Math.floor(Math.random() * 7) + 1;
            this.currentPiece = {
                shape: SHAPES[type].map(row => [...row]),  // 深拷貝形狀矩陣
                color: type,                               // 記錄顏色類型
                x: Math.floor(COLS / 2) - 2,              // 水平置中
                y: 0                                        // 從頂部開始
            };

            // 產生下一個方塊
            const nextType = Math.floor(Math.random() * 7) + 1;
            this.nextPiece = {
                shape: SHAPES[nextType].map(row => [...row]),
                color: nextType
            };
        } else {
            // 使用預存的下一個方塊
            this.currentPiece = {
                shape: this.nextPiece.shape.map(row => [...row]),
                color: this.nextPiece.color,
                x: Math.floor(COLS / 2) - 2,
                y: 0
            };

            const nextType = Math.floor(Math.random() * 7) + 1;
            this.nextPiece = {
                shape: SHAPES[nextType].map(row => [...row]),
                color: nextType
            };
        }

        // 檢查新方塊是否與現有方塊碰撞 (遊戲結束條件)
        if (this.collide(this.board, this.currentPiece)) {
            this.gameOver = true;
            this.showGameOver();  // 顯示遊戲結束畫面
        }

        this.drawNextPiece();    // 繪製下一個方塊預覽
    }

    /**
     * 檢測方塊是否與遊戲區域碰撞
     * @param {Array<Array<number>>} board - 遊戲區域
     * @param {Object} piece - 方塊物件 (包含 shape, x, y)
     * @returns {boolean} true 表示發生碰撞
     */
    collide(board, piece) {
        // 遍歷方塊的每個格子
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                // 只檢查非空格子
                if (piece.shape[y][x] !== 0) {
                    const newX = piece.x + x;    // 計算絕對 X 座標
                    const newY = piece.y + y;    // 計算絕對 Y 座標
                    // 檢查邊界: 左/右邊界、底部邊界、與已放置方塊碰撞
                    if (newX < 0 || newX >= COLS || newY >= ROWS ||
                        (newY >= 0 && board[newY]?.[newX] !== 0)) {
                        return true;  // 發生碰撞
                    }
                }
            }
        }
        return false;  // 無碰撞
    }

    /**
     * 旋轉當前方塊
     * 順時針旋轉 90 度，若旋轉後碰撞則還原
     */
    rotate() {
        if (!this.canAct()) return false;
        // 矩陣旋轉演算法: 先轉置再反轉每行
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        const previous = this.currentPiece.shape;  // 儲存旋轉前的狀態
        this.currentPiece.shape = rotated;          // 套用旋轉後的形狀

        // 檢查旋轉後是否碰撞，若碰撞則還原
        if (this.collide(this.board, this.currentPiece)) {
            this.currentPiece.shape = previous;
        } else {
            this.sounds.rotate();  // 播放旋轉音效
        }
    }

    /**
     * 水平移動方塊
     * @param {number} dir - 移動方向 (-1: 左, 1: 右)
     */
    move(dir) {
        if (!this.canAct()) return false;
        this.currentPiece.x += dir;  // 嘗試移動
        if (this.collide(this.board, this.currentPiece)) {
            this.currentPiece.x -= dir;  // 碰撞則還原
        } else {
            this.sounds.move();  // 播放移動音效
        }
    }

    /**
     * 軟掉落 - 方塊下降一格
     * 若無法下降則鎖定方塊並檢查消除
     */
    drop() {
        // 如果方塊為空，則直接返回
        if (!this.canAct()) return false;

        this.currentPiece.y++;
        if (this.collide(this.board, this.currentPiece)) {
            this.currentPiece.y--;
            this.lock();
            this.clearLines();
            this.spawnPiece();
            this.lastDrop = Date.now();
            return false;
        }
        this.lastDrop = Date.now();
        return true;
    }


    /**
     * 消除行數動畫效果
     * 觸發 CSS lineClear 動畫
     */
    animateLineClear() {
        this.draw();
        const cells = document.querySelectorAll('#game-canvas');
        cells.forEach(cell => {
            cell.style.animation = 'none';
            cell.offsetHeight;  // 強制重繪
            cell.style.animation = 'lineClear 0.3s ease';
        });
    }

    /**
     * 更新分數顯示
     * 將遊戲狀態同步到 HTML 元素
     */
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
        const comboElement = document.getElementById('combo');
        if (comboElement) comboElement.textContent = this.combo;
    }

    /**
     * 顯示連擊效果文字
     * @param {number} combo - 當前連擊數
     */
    showComboEffect(combo) {
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;

        const effect = document.createElement('div');
        effect.className = 'combo-effect';
        effect.textContent = `Combo ${combo}x!`;

        gameArea.appendChild(effect);
        // 1 秒後移除效果元素
        setTimeout(() => {
            if (gameArea.contains(effect)) {
                gameArea.removeChild(effect);
            }
        }, 1000);
    }

    /**
     * 繪製遊戲畫面
     * 清空畫布並繪製遊戲區域與當前方塊
     */
    draw() {
        // 清空畫布，填入背景色
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 繪製遊戲區域中已固定的方塊
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBlock(x, y, COLORS[this.board[y][x]]);
                }
            }
        }

        // 繪製當前移動中的方塊
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x] !== 0) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            COLORS[this.currentPiece.color]
                        );
                    }
                }
            }
        }
    }

    /**
     * 繪製單一方塊
     * 包含主體、高光 (左上) 與陰影 (右下) 效果
     * @param {number} x - X 座標 (格子索引)
     * @param {number} y - Y 座標 (格子索引)
     * @param {string} color - 方塊顏色
     */
    drawBlock(x, y, color) {
        const padding = 1;

        // 繪製方塊主體
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * BLOCK_SIZE + padding,
            y * BLOCK_SIZE + padding,
            BLOCK_SIZE - padding * 2,
            BLOCK_SIZE - padding * 2
        );

        // 繪製左上角高光效果 (模擬 3D 感)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(
            x * BLOCK_SIZE + padding,
            y * BLOCK_SIZE + padding,
            BLOCK_SIZE - padding * 2,
            4
        );

        // 繪製右下角陰影效果 (模擬 3D 感)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(
            x * BLOCK_SIZE + padding,
            y * BLOCK_SIZE + BLOCK_SIZE - 6,
            BLOCK_SIZE - padding * 2,
            4
        );
    }

    /**
     * 繪製下一個方塊預覽
     * 在右側小畫布中顯示即將出現的方塊
     */
    drawNextPiece() {
        // 清空預覽畫布
        this.nextCtx.fillStyle = '#1a1a2e';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        if (!this.nextPiece) return;

        // 計算置中偏移量
        const offsetX = (4 - this.nextPiece.shape[0].length) / 2;
        const offsetY = (4 - this.nextPiece.shape.length) / 2;

        // 繪製方塊
        for (let y = 0; y < this.nextPiece.shape.length; y++) {
            for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                if (this.nextPiece.shape[y][x] !== 0) {
                    this.nextCtx.fillStyle = COLORS[this.nextPiece.color];
                    this.nextCtx.fillRect(
                        (offsetX + x) * BLOCK_SIZE + 1,
                        (offsetY + y) * BLOCK_SIZE + 1,
                        BLOCK_SIZE - 2,
                        BLOCK_SIZE - 2
                    );
                }
            }
        }
    }

    /**
     * 遊戲主循環
     * 使用 requestAnimationFrame 實現流暢的遊戲更新
     */
    gameLoop() {
        if (this.gameOver) {
            this.isLooping = false;
            return;
        }
        this.isLooping = true;

        // 遊戲尚未開始時只進行繪製
        if (!this.started) {
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
            return;
        }

        // 檢查是否應該自動掉落
        const now = Date.now();
        if (!this.paused && this.currentPiece && now - this.lastDrop > this.dropInterval) {
            this.drop();  // 執行軟掉落
        }

        this.draw();  // 繪製遊戲畫面
        requestAnimationFrame(() => this.gameLoop());  // 繼續循環
    }

    /**
     * 顯示遊戲結束畫面
     * 播放遊戲結束音效並顯示結束面板
     */
    showGameOver() {
        this.sounds.gameOver();  // 播放結束音效

        // 如果自動玩法開啟，則停止並還原速度
        if (this.autoPlay) {
            this.autoPlay = false;
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
            document.getElementById('btn-auto').textContent = '🤖';
            this.dropInterval = Math.min(1000, this.dropInterval * 10);
        }

        // 顯示最終分數與遊戲結束畫面
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }

    /**
     * 切換暫停/繼續狀態
     */
    togglePause() {
        if (!this.started || this.gameOver) return;
        this.paused = !this.paused;
        const overlay = document.getElementById('pause-overlay');

        if (this.paused) {
            // 進入暫停狀態
            overlay.classList.remove('hidden');
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        } else {
            // 繼續遊戲
            overlay.classList.add('hidden');
            this.lastDrop = Date.now();  // 重置計時避免瞬間掉落
            if (this.autoPlay) {
                this.runAutoPlay();  // 恢復自動玩法
            }
            this.gameLoop();
        }
    }

    /**
     * 綁定所有輸入事件
     * 包括鍵盤、手機觸控、滑鼠與按鈕點擊
     */
    bindEvents() {
        // 鍵盤控制
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || !this.started) return;

            if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'p', 'P'].includes(e.key)) e.preventDefault();
            switch (e.key) {
                case 'ArrowLeft':
                    this.move(-1);    // 左移
                    break;
                case 'ArrowRight':
                    this.move(1);     // 右移
                    break;
                case 'ArrowDown':
                    this.softDrop();
                    break;
                case 'ArrowUp':
                case ' ':            // 空白鍵
                    this.rotate();    // 旋轉
                    break;
                case 'p':
                case 'P':
                    this.togglePause();  // 暫停/繼續
                    break;
            }
        });

        document.getElementById('btn-start').addEventListener('click', () => {
            document.getElementById('start-overlay').classList.add('hidden');
            this.init();
            this.start();
        });

        document.getElementById('btn-sound').addEventListener('click', (e) => {
            const enabled = this.sounds.toggle();
            e.target.textContent = enabled ? '🔊' : '🔇';
        });

        document.getElementById('btn-bgm').addEventListener('click', (e) => {
            const enabled = this.sounds.toggleBgm();
            e.target.textContent = enabled ? '🎵' : '🔕';
        });

        document.getElementById('btn-left').addEventListener('click', () => this.move(-1));
        document.getElementById('btn-right').addEventListener('click', () => this.move(1));
        document.getElementById('btn-down').addEventListener('click', () => {
            this.softDrop();
        });
        document.getElementById('btn-rotate').addEventListener('click', () => this.rotate());
        document.getElementById('btn-drop').addEventListener('click', () => this.hardDrop());

        document.getElementById('btn-restart').addEventListener('click', () => {
            document.getElementById('game-over').classList.add('hidden');
            this.init();
            this.start();
        });

        document.getElementById('pause-overlay').addEventListener('click', () => {
            if (this.paused) this.togglePause();
        });

        this.bindTouchEvents();
        this.bindMouseEvents();
    }

    bindTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.canAct()) return;
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (!this.canAct()) return;
            e.preventDefault();

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;

            const minSwipe = 30;

            if (deltaTime < 300 && Math.abs(deltaX) < minSwipe && Math.abs(deltaY) < minSwipe) {
                this.rotate();
            } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > minSwipe) this.move(1);
                else if (deltaX < -minSwipe) this.move(-1);
            } else {
                if (deltaY > minSwipe) {
                    this.softDrop();
                }
            }
        }, { passive: false });
    }

    bindMouseEvents() {
        let mouseStartX = 0;
        let mouseStartY = 0;
        let mouseStartTime = 0;
        let isMouseDown = false;

        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.canAct()) return;
            mouseStartX = e.clientX;
            mouseStartY = e.clientY;
            mouseStartTime = Date.now();
            isMouseDown = true;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!isMouseDown || !this.canAct()) return;

            const deltaX = e.clientX - mouseStartX;
            const deltaY = e.clientY - mouseStartY;
            const minDrag = 50;

            if (Math.abs(deltaX) > minDrag) {
                if (deltaX > 0) this.move(1);
                else this.move(-1);
                mouseStartX = e.clientX;
                mouseStartY = e.clientY;
            }

            if (deltaY > minDrag) {
                this.softDrop();
                mouseStartY = e.clientY;
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.canAct()) return;

            const deltaX = e.clientX - mouseStartX;
            const deltaY = e.clientY - mouseStartY;
            const deltaTime = Date.now() - mouseStartTime;

            if (deltaTime < 200 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                this.rotate();
            }

            isMouseDown = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            isMouseDown = false;
        });

        document.getElementById('btn-auto').addEventListener('click', (e) => {
            this.toggleAutoPlay();
            e.target.textContent = this.autoPlay ? '⏹️' : '🤖';
        });
    }

    /**
     * 切換自動玩法開關
     * 自動玩法會大幅提高遊戲速度
     */
    toggleAutoPlay() {
        if (!this.started || this.gameOver || !this.currentPiece) return;
        this.autoPlay = !this.autoPlay;
        if (this.autoPlay && this.started && !this.gameOver && !this.paused) {
            this.dropInterval = Math.max(50, this.dropInterval / 10);  // 加速 10 倍
            this.runAutoPlay();
        } else if (!this.autoPlay && this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            this.dropInterval = Math.min(1000, this.dropInterval * 10);  // 還原速度
        }
    }

    /**
     * 執行自動玩法
     * AI 自動控制方塊移動，嘗試獲得最高分
     */
    runAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }

        let targetX = 0;           // 目標 X 座標
        let targetRotations = 0;    // 目標旋轉次數
        let currentPieceId = null; // 記錄當前方塊 ID

        // 每 200ms 執行一次 AI 決策
        this.autoPlayInterval = setInterval(() => {
            if (this.gameOver || this.paused || !this.autoPlay || !this.currentPiece) {
                return;
            }

            const pieceId = this.currentPiece.color;

            if (pieceId !== currentPieceId) {
                const best = this.findBestMove();
                if (best) {
                    targetX = best.x;
                    targetRotations = best.rotations;
                    currentPieceId = pieceId;
                }
            }

            if (targetRotations > 0) {
                this.rotate();
                targetRotations--;
            } else if (this.currentPiece.x < targetX) {
                this.move(1);
            } else if (this.currentPiece.x > targetX) {
                this.move(-1);
            } else {
                this.hardDrop();
                currentPieceId = null;
            }
        }, 200);
    }

    calculateBestMove() {
        const piece = this.currentPiece;
        if (!piece) return null;

        let bestScore = -Infinity;
        let best = null;

        const shapes = this.getAllRotations(piece.shape);

        for (let r = 0; r < shapes.length; r++) {
            const shape = shapes[r];
            const width = shape[0].length;

            for (let x = -2; x <= COLS - width + 2; x++) {
                if (this.canPlace(piece.shape, x, 0)) {
                    const landingY = this.getDropY(piece.shape, x);
                    const score = this.evaluateMove(piece.shape, x, landingY);

                    if (score > bestScore) {
                        bestScore = score;
                        best = { x: x, rotate: r };
                    }
                }
            }
        }

        return best;
    }

    getAllRotations(shape) {
        const result = [shape];
        let current = shape;

        for (let i = 1; i < 4; i++) {
            current = this.rotateMatrix(current);
            if (this.matricesEqual(current, shape)) break;
            result.push(current);
        }

        return result;
    }

    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];

        for (let x = 0; x < cols; x++) {
            rotated[x] = [];
            for (let y = rows - 1; y >= 0; y--) {
                rotated[x].push(matrix[y][x]);
            }
        }

        return rotated;
    }

    matricesEqual(a, b) {
        if (!a || !b || a.length !== b.length) return false;
        for (let y = 0; y < a.length; y++) {
            for (let x = 0; x < a[y].length; x++) {
                if (a[y][x] !== b[y][x]) return false;
            }
        }
        return true;
    }

    canPlace(shape, x, y) {
        for (let dy = 0; dy < shape.length; dy++) {
            for (let dx = 0; dx < shape[dy].length; dx++) {
                if (shape[dy][dx] !== 0) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
                    if (ny >= 0 && this.board[ny][nx] !== 0) return false;
                }
            }
        }
        return true;
    }

    /**
     * 計算方塊能落下的最低 Y 座標
     * @param {Array<Array<number>>} shape - 方塊形狀
     * @param {number} x - X 座標
     * @returns {number} 最終 Y 座標
     */
    getDropY(shape, x) {
        let y = -shape.length;
        while (this.canPlace(shape, x, y + 1)) {
            y++;
        }
        return y;
    }

    /**
     * 評估移動的分數
     * 使用多個指標計算該移動的優劣:
     * - 消除行數 (最重要)
     * - 空洞數量 (避免)
     * - 最大高度 (避免過高)
     * - 凹凸程度 (避免不平穩)
     * @param {Array<Array<number>>} shape - 方塊形狀
     * @param {number} x - X 座標
     * @param {number} landingY - 落下後的 Y 座標
     * @returns {number} 評估分數
     */
    evaluateMove(shape, x, landingY) {
        // 建立測試棋盤，模擬這一步後的狀態
        const testBoard = this.board.map(row => [...row]);

        // 將方塊放置到測試棋盤上
        for (let dy = 0; dy < shape.length; dy++) {
            for (let dx = 0; dx < shape[dy].length; dx++) {
                if (shape[dy][dx] !== 0) {
                    const ny = landingY + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
                        testBoard[ny][nx] = this.currentPiece.color;
                    }
                }
            }
        }

        let score = 0;

        // 計算消除行數 (權重: 100000)
        let lines = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (testBoard[y].every(cell => cell !== 0)) {
                lines++;
            }
        }
        score += lines * 100000;

        // 計算空洞數量 - 下方有空格上方有方塊的情況 (權重: -10000)
        // 空洞難以填充，應盡量避免
        let holes = 0;
        for (let x = 0; x < COLS; x++) {
            let hasBlock = false;
            for (let y = 0; y < ROWS; y++) {
                if (testBoard[y][x] !== 0) hasBlock = true;
                else if (hasBlock) holes++;
            }
        }
        score -= holes * 10000;

        // 計算最大高度 (權重: -100)
        // 高度過高會縮短可用空間
        let maxHeight = 0;
        for (let x = 0; x < COLS; x++) {
            for (let y = 0; y < ROWS; y++) {
                if (testBoard[y][x] !== 0) {
                    maxHeight = Math.max(maxHeight, ROWS - y);
                    break;
                }
            }
        }
        score -= maxHeight * 100;

        // 計算凹凸程度 - 各行高度差異 (權重: -500)
        // 凹凸不平會影響後續堆疊
        let bumps = 0;
        let heights = [];
        for (let x = 0; x < COLS; x++) {
            let h = 0;
            for (let y = 0; y < ROWS; y++) {
                if (testBoard[y][x] !== 0) {
                    h = ROWS - y;
                    break;
                }
            }
            heights.push(h);
        }
        for (let x = 0; x < COLS - 1; x++) {
            bumps += Math.abs(heights[x] - heights[x + 1]);
        }
        score -= bumps * 500;

        return score;
    }

    /**
     * 搜尋最佳移動
     * 使用評估函數找到最佳的旋轉次數與 X 座標
     * @returns {Object|null} 最佳移動 {x, rotations}
     */
    findBestMove() {
        if (!this.currentPiece) return null;

        let bestScore = -Infinity;
        let bestMove = null;

        const rotations = this.getAllRotations(this.currentPiece.shape);

        for (let r = 0; r < rotations.length; r++) {
            const shape = rotations[r];
            const width = shape[0].length;

            for (let x = -2; x <= COLS - width + 2; x++) {
                if (!this.canPlace(shape, x, 0)) continue;

                const landingY = this.getDropY(shape, x);
                const score = this.evaluateMove(shape, x, landingY);

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { x: x, rotations: r };
                }
            }
        }

        return bestMove;
    }
}

// ==================== 遊戲初始化 ====================
// 頁面載入完成後，建立遊戲實例並開始運作
window.addEventListener('load', () => {
    window.tetris = new Tetris();
});
