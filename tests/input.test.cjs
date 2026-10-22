const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createGame } = require('./helpers.cjs');

for (const state of ['before', 'paused', 'over', 'empty']) {
    test(`all gameplay inputs are inert when ${state}`, () => {
        const h = createGame(); const g = h.game;
        if (state !== 'before') h.start();
        if (state === 'paused') g.togglePause();
        if (state === 'over') g.gameOver = true;
        if (state === 'empty') g.currentPiece = null;
        const before = JSON.stringify([g.currentPiece, g.board, g.score]);
        assert.doesNotThrow(() => {
            g.move(1); g.rotate(); g.drop(); g.hardDrop();
            for (const id of ['btn-left','btn-right','btn-down','btn-rotate','btn-drop']) h.element(id).dispatch('click');
            for (const key of ['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ']) h.document.dispatch('keydown', { key });
            h.element('game-canvas').dispatch('mousedown', {clientX: 0, clientY: 0});
            h.element('game-canvas').dispatch('mousemove', {clientX: 100, clientY: 100});
            h.element('game-canvas').dispatch('mouseup', {clientX: 100, clientY: 100});
            h.element('game-canvas').dispatch('touchstart', {touches:[{clientX:0,clientY:0}]});
            h.element('game-canvas').dispatch('touchend', {changedTouches:[{clientX:0,clientY:100}]});
        });
        assert.equal(JSON.stringify([g.currentPiece, g.board, g.score]), before);
    });
}
test('manual soft drop scores only an actual downward move', () => {
    const h = createGame(); const g = h.start();
    g.currentPiece = {shape:[[2,2],[2,2]],color:2,x:3,y:17};
    h.element('btn-down').dispatch('click'); assert.equal(g.currentPiece.y,18); assert.equal(g.score,1);
    h.element('btn-down').dispatch('click'); assert.equal(g.score,1);
});
test('P and pause overlay can resume without applying movement', () => {
    const h = createGame(); const g = h.start();
    h.document.dispatch('keydown',{key:'p'}); assert.equal(g.paused,true);
    h.document.dispatch('keydown',{key:'P'}); assert.equal(g.paused,false);
    g.togglePause(); h.element('pause-overlay').dispatch('click'); assert.equal(g.paused,false);
});
