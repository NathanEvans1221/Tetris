const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createGame} = require('./helpers.cjs');
test('pause resume and restart retain a single frame chain', () => {
    const h = createGame(); const g = h.start();
    for(let i=0;i<10;i++) {
        g.togglePause(); assert.equal(h.frames.size,0);
        g.togglePause(); assert.equal(h.frames.size,1);
        g.gameLoop(); assert.equal(h.frames.size,1);
        h.frame(); assert.equal(h.frames.size,1);
        g.init(); g.start(); assert.equal(h.frames.size,1);
    }
    g.gameOver=true; g.showGameOver(); assert.equal(h.frames.size,0);
});
test('resume does not consume time spent paused', () => {
    const h=createGame(); const g=h.start(); const y=g.currentPiece.y;
    g.togglePause(); h.advance(60000); g.togglePause(); h.frame();
    assert.equal(g.currentPiece.y,y);
    h.advance(1001); h.frame(); assert.equal(g.currentPiece.y,y+1);
});
