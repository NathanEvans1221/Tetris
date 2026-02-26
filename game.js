class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.bgmEnabled = false;
        this.bgmInterval = null;
        this.bgmNotes = [
            { freq: 261.63, dur: 0.2 },
            { freq: 293.66, dur: 0.2 },
            { freq: 329.63, dur: 0.2 },
            { freq: 349.23, dur: 0.2 },
            { freq: 392.00, dur: 0.2 },
            { freq: 349.23, dur: 0.2 },
            { freq: 329.63, dur: 0.2 },
            { freq: 293.66, dur: 0.2 },
        ];
        this.bgmIndex = 0;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

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

    stopBgm() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        this.bgmIndex = 0;
    }

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

    move() {
        this.playTone(200, 0.05, 'sine', 0.05);
    }

    rotate() {
        this.playTone(300, 0.05, 'sine', 0.05);
    }

    drop() {
        this.playTone(150, 0.05, 'sine', 0.05);
    }

    lineClear(lines) {
        const baseFreq = 400 + (lines * 50);
        for (let i = 0; i < lines; i++) {
            setTimeout(() => {
                this.playTone(baseFreq + (i * 100), 0.15, 'square', 0.08);
            }, i * 50);
        }
    }

    levelUp() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.1);
            }, i * 100);
        });
    }

    gameOver() {
        const notes = [400, 350, 300, 250, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.3, 'sawtooth', 0.1);
            }, i * 150);
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 28;

const COLORS = [
    null,
    '#00f0f0',
    '#f0f000',
    '#a000f0',
    '#00f000',
    '#f00000',
    '#0000f0',
    '#f0a000'
];

const SHAPES = [
    [],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
    [[4, 4], [4, 4]],
    [[0, 5, 0], [5, 5, 5], [0, 0, 0]],
    [[6, 6, 6], [6, 0, 0], [0, 0, 0]],
    [[0, 0, 7], [7, 7, 7], [0, 0, 0]]
];

class Tetris {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.sounds = new SoundManager();
        
        this.canvas.width = COLS * BLOCK_SIZE;
        this.canvas.height = ROWS * BLOCK_SIZE;
        this.nextCanvas.width = 4 * BLOCK_SIZE;
        this.nextCanvas.height = 4 * BLOCK_SIZE;
        
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropInterval = 1000;
        this.lastDrop = 0;
        this.lastLevel = 1;
        this.autoPlay = false;
        this.autoPlayInterval = null;
        
        this.bindEvents();
    }
    
    createBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
    
    init() {
        this.sounds.init();
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.started = false;
        this.nextPiece = null;
        this.currentPiece = null;
        this.dropInterval = 1000;
        this.lastDrop = Date.now();
        this.lastLevel = 1;
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.autoPlay = false;
        document.getElementById('btn-auto').textContent = '🤖';
        
        this.updateScore();
        this.draw();
    }
    
    start() {
        this.started = true;
        this.lastDrop = Date.now();
        this.spawnPiece();
        if (this.autoPlay) {
            this.runAutoPlay();
        }
        this.gameLoop();
    }
    
    spawnPiece() {
        if (this.nextPiece === null) {
            const type = Math.floor(Math.random() * 7) + 1;
            this.currentPiece = {
                shape: SHAPES[type].map(row => [...row]),
                color: type,
                x: Math.floor(COLS / 2) - 2,
                y: 0
            };
            
            const nextType = Math.floor(Math.random() * 7) + 1;
            this.nextPiece = {
                shape: SHAPES[nextType].map(row => [...row]),
                color: nextType
            };
        } else {
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
        
        if (this.collide(this.board, this.currentPiece)) {
            this.gameOver = true;
            this.showGameOver();
        }
        
        this.drawNextPiece();
    }
    
    collide(board, piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const newX = piece.x + x;
                    const newY = piece.y + y;
                    if (newX < 0 || newX >= COLS || newY >= ROWS ||
                        (newY >= 0 && board[newY]?.[newX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    rotate() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        const previous = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.collide(this.board, this.currentPiece)) {
            this.currentPiece.shape = previous;
        } else {
            this.sounds.rotate();
        }
    }
    
    move(dir) {
        this.currentPiece.x += dir;
        if (this.collide(this.board, this.currentPiece)) {
            this.currentPiece.x -= dir;
        } else {
            this.sounds.move();
        }
    }
    
    drop() {
        this.currentPiece.y++;
        if (this.collide(this.board, this.currentPiece)) {
            this.currentPiece.y--;
            this.lock();
            this.clearLines();
            this.spawnPiece();
        }
        this.lastDrop = Date.now();
    }
    
    hardDrop() {
        while (!this.collide(this.board, { ...this.currentPiece, y: this.currentPiece.y + 1 })) {
            this.currentPiece.y++;
            this.score += 2;
        }
        this.lock();
        this.clearLines();
        this.spawnPiece();
        this.updateScore();
    }
    
    lock() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] !== 0) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += [0, 100, 300, 500, 800][linesCleared] * this.level;
            
            const oldLevel = this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            
            this.sounds.lineClear(linesCleared);
            if (this.level > oldLevel) {
                this.sounds.levelUp();
            }
            
            this.animateLineClear();
            this.updateScore();
        }
    }
    
    animateLineClear() {
        this.draw();
        const cells = document.querySelectorAll('#game-canvas');
        cells.forEach(cell => {
            cell.style.animation = 'none';
            cell.offsetHeight;
            cell.style.animation = 'lineClear 0.3s ease';
        });
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    draw() {
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBlock(x, y, COLORS[this.board[y][x]]);
                }
            }
        }
        
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
    
    drawBlock(x, y, color) {
        const padding = 1;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * BLOCK_SIZE + padding,
            y * BLOCK_SIZE + padding,
            BLOCK_SIZE - padding * 2,
            BLOCK_SIZE - padding * 2
        );
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(
            x * BLOCK_SIZE + padding,
            y * BLOCK_SIZE + padding,
            BLOCK_SIZE - padding * 2,
            4
        );
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(
            x * BLOCK_SIZE + padding,
            y * BLOCK_SIZE + BLOCK_SIZE - 6,
            BLOCK_SIZE - padding * 2,
            4
        );
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#1a1a2e';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (!this.nextPiece) return;
        
        const offsetX = (4 - this.nextPiece.shape[0].length) / 2;
        const offsetY = (4 - this.nextPiece.shape.length) / 2;
        
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
    
    gameLoop() {
        if (this.gameOver) return;
        if (!this.started) {
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        const now = Date.now();
        if (!this.paused && now - this.lastDrop > this.dropInterval) {
            this.drop();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    showGameOver() {
        this.sounds.gameOver();
        if (this.autoPlay) {
            this.autoPlay = false;
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
            document.getElementById('btn-auto').textContent = '🤖';
        }
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    togglePause() {
        this.paused = !this.paused;
        const overlay = document.getElementById('pause-overlay');
        
        if (this.paused) {
            overlay.classList.remove('hidden');
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        } else {
            overlay.classList.add('hidden');
            this.lastDrop = Date.now();
            if (this.autoPlay) {
                this.runAutoPlay();
            }
            this.gameLoop();
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || !this.started) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.move(-1);
                    break;
                case 'ArrowRight':
                    this.move(1);
                    break;
                case 'ArrowDown':
                    this.drop();
                    this.score += 1;
                    this.updateScore();
                    break;
                case 'ArrowUp':
                case ' ':
                    this.rotate();
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
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
            this.drop();
            this.score += 1;
            this.updateScore();
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
            if (this.gameOver || this.paused) return;
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            if (this.gameOver || this.paused) return;
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
                    this.drop();
                    this.score += 1;
                    this.updateScore();
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
            if (this.gameOver || this.paused) return;
            mouseStartX = e.clientX;
            mouseStartY = e.clientY;
            mouseStartTime = Date.now();
            isMouseDown = true;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isMouseDown || this.gameOver || this.paused) return;
            
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
                this.drop();
                this.score += 1;
                this.updateScore();
                mouseStartY = e.clientY;
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (this.gameOver || this.paused) return;
            
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
    
    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        if (this.autoPlay && this.started && !this.gameOver && !this.paused) {
            this.runAutoPlay();
        } else if (!this.autoPlay && this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    runAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        let targetX = null;
        let targetRotations = null;
        let lastPieceId = null;
        
        this.autoPlayInterval = setInterval(() => {
            if (this.gameOver || this.paused || !this.autoPlay || !this.currentPiece) {
                return;
            }
            
            const pieceId = this.currentPiece.color + '-' + this.currentPiece.shape.flat().join('');
            
            if (pieceId !== lastPieceId) {
                const bestMove = this.findBestMove();
                if (bestMove) {
                    targetX = bestMove.x;
                    targetRotations = bestMove.rotations;
                    lastPieceId = pieceId;
                }
            }
            
            if (targetX !== null && this.currentPiece) {
                const diff = targetX - this.currentPiece.x;
                
                if (Math.abs(diff) > 0) {
                    const step = diff > 0 ? Math.min(diff, 3) : Math.max(diff, -3);
                    this.move(step);
                } else if (targetRotations > 0) {
                    this.rotate();
                    targetRotations--;
                } else {
                    this.drop();
                }
            }
        }, 8);
    }
    
    findBestMove() {
        if (!this.currentPiece) return null;
        
        let bestScore = -Infinity;
        let bestMove = null;
        
        const rotations = this.getRotationStates(this.currentPiece.shape);
        
        for (let r = 0; r < rotations.length; r++) {
            const shape = rotations[r];
            
            for (let x = -2; x < COLS + 2; x++) {
                const testPiece = {
                    shape: shape,
                    color: this.currentPiece.color,
                    x: x,
                    y: 0
                };
                
                const boardCopy = this.board.map(row => [...row]);
                this.simulateDrop(boardCopy, testPiece);
                
                if (testPiece.y < 0) continue;
                
                const score = this.evaluatePosition(boardCopy);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { x: x, rotations: r };
                }
            }
        }
        
        return bestMove;
    }
    
    getRotationStates(shape) {
        const states = [];
        let current = shape.map(row => [...row]);
        
        for (let i = 0; i < 4; i++) {
            states.push(current);
            current = current[0].map((_, idx) => 
                current.map(row => row[idx]).reverse()
            ).map(row => [...row]);
        }
        
        return states;
    }
    
    simulateDrop(board, piece) {
        while (!this.collide(board, { ...piece, y: piece.y + 1 })) {
            piece.y++;
        }
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const boardY = piece.y + y;
                    const boardX = piece.x + x;
                    if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                        board[boardY][boardX] = piece.color;
                    }
                }
            }
        }
    }
    
    evaluatePosition(board) {
        let score = 0;
        
        const linesCleared = this.countLines(board);
        score += linesCleared * 10000;
        
        const totalHeight = this.getTotalHeight(board);
        score -= totalHeight * 5;
        
        if (totalHeight > 15) {
            score -= (totalHeight - 15) * 20;
        }
        
        const holes = this.countHoles(board);
        score -= holes * 100;
        
        const bumpiness = this.getBumpiness(board);
        score -= bumpiness * 10;
        
        const wellBlocks = this.countWellBlocks(board);
        score += wellBlocks * 20;
        
        const rowTransitions = this.countRowTransitions(board);
        score -= rowTransitions * 3;
        
        const colTransitions = this.countColTransitions(board);
        score -= colTransitions * 3;
        
        return score;
    }
    
    countLines(board) {
        let lines = 0;
        for (let y = 0; y < ROWS; y++) {
            if (board[y].every(cell => cell !== 0)) {
                lines++;
            }
        }
        return lines;
    }
    
    getTotalHeight(board) {
        let height = 0;
        for (let x = 0; x < COLS; x++) {
            for (let y = 0; y < ROWS; y++) {
                if (board[y][x] !== 0) {
                    height += ROWS - y;
                    break;
                }
            }
        }
        return height;
    }
    
    countHoles(board) {
        let holes = 0;
        for (let x = 0; x < COLS; x++) {
            let foundBlock = false;
            for (let y = 0; y < ROWS; y++) {
                if (board[y][x] !== 0) {
                    foundBlock = true;
                } else if (foundBlock) {
                    holes++;
                }
            }
        }
        return holes;
    }
    
    getBumpiness(board) {
        let bumpiness = 0;
        const heights = [];
        
        for (let x = 0; x < COLS; x++) {
            let h = 0;
            for (let y = 0; y < ROWS; y++) {
                if (board[y][x] !== 0) {
                    h = ROWS - y;
                    break;
                }
            }
            heights.push(h);
        }
        
        for (let x = 0; x < COLS - 1; x++) {
            bumpiness += Math.abs(heights[x] - heights[x + 1]);
        }
        
        return bumpiness;
    }
    
    countWellBlocks(board) {
        let wells = 0;
        const heights = [];
        
        for (let x = 0; x < COLS; x++) {
            let h = 0;
            for (let y = 0; y < ROWS; y++) {
                if (board[y][x] !== 0) {
                    h = ROWS - y;
                    break;
                }
            }
            heights.push(h);
        }
        
        for (let x = 1; x < COLS - 1; x++) {
            if (heights[x] < heights[x - 1] && heights[x] < heights[x + 1]) {
                wells += Math.min(heights[x - 1], heights[x + 1]) - heights[x];
            }
        }
        
        return wells;
    }
    
    countRowTransitions(board) {
        let transitions = 0;
        
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS - 1; x++) {
                if ((board[y][x] === 0) !== (board[y][x + 1] === 0)) {
                    transitions++;
                }
            }
        }
        
        return transitions;
    }
    
    countColTransitions(board) {
        let transitions = 0;
        
        for (let x = 0; x < COLS; x++) {
            for (let y = 0; y < ROWS - 1; y++) {
                if ((board[y][x] === 0) !== (board[y + 1][x] === 0)) {
                    transitions++;
                }
            }
        }
        
        return transitions;
    }
}

window.addEventListener('load', () => {
    window.tetris = new Tetris();
});
