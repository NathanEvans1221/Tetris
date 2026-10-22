const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createGame } = require('./helpers.cjs');

test('collision rejects walls, floor and occupied cells', () => {
    const { game: g } = createGame(); const p = { shape: [[1]], x: 0, y: 0 };
    assert.equal(g.collide(g.board, p), false);
    for (const [x, y] of [[-1, 0], [10, 0], [0, 20]]) assert.equal(g.collide(g.board, { ...p, x, y }), true);
    g.board[0][0] = 2; assert.equal(g.collide(g.board, p), true);
});
test('hard drop locks piece, clears a line and scores distance', () => {
    const h = createGame(); const g = h.start();
    g.currentPiece = { shape: [[4, 4], [4, 4]], color: 4, x: 3, y: 0 };
    g.board[19].fill(1); g.board[19][3] = 0; g.board[19][4] = 0; g.hardDrop();
    assert.equal(g.score, 136); assert.equal(g.lines, 1); assert.equal(g.board.length, 20); assert.equal(g.board[19][3], 4);
});
test('adjacent full rows are all removed', () => {
    const h = createGame(); const g = h.start(); g.board[18].fill(1); g.board[19].fill(1); g.clearLines();
    assert.equal(g.lines, 2); assert.equal(g.score, 300); assert.ok(g.board.every(row => row.every(cell => cell === 0)));
});
test('combo bonus applies to consecutive clears and resets on a miss', () => {
    const h = createGame(); const g = h.start();
    g.board[19].fill(1); g.clearLines(); g.board[19].fill(1); g.clearLines();
    assert.equal(g.score, 300); assert.equal(g.combo, 2); g.clearLines(); assert.equal(g.combo, 0);
});
test('ten cleared lines advance level and gravity', () => {
    const h = createGame(); const g = h.start(); g.lines = 9; g.board[19].fill(1); g.clearLines();
    assert.equal(g.level, 2); assert.equal(g.dropInterval, 900);
});
test('rotation preserves four blocks and rolls back an obstructed turn', () => {
    const h = createGame(); const g = h.start();
    g.currentPiece = { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: 1, x: -1, y: 3 };
    g.rotate(); assert.equal(g.currentPiece.shape.flat().filter(Boolean).length, 4);
    const before = JSON.stringify(g.currentPiece.shape); g.board = g.board.map(row => row.map(() => 7));
    g.rotate(); assert.equal(JSON.stringify(g.currentPiece.shape), before);
});
test('pause and restart reset gameplay state', () => {
    const h = createGame(); const g = h.start(); g.togglePause(); assert.equal(g.paused, true); g.togglePause(); assert.equal(g.paused, false);
    g.score = 500; g.board[19][0] = 1; g.init(); g.start();
    assert.equal(g.score, 0); assert.equal(g.level, 1); assert.equal(g.lines, 0); assert.ok(g.board.every(row => row.every(cell => cell === 0)));
});
test('spawn collision ends the game and reports final score', () => {
    const h = createGame(); const g = h.start(); g.score = 123; g.board[1].fill(2); g.spawnPiece();
    assert.equal(g.gameOver, true); assert.equal(h.element('final-score').textContent, 123);
});
