const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createGame}=require('./helpers.cjs');
test('hidden page stops gameplay and AI until an explicit visible resume',()=>{
    const h=createGame();const g=h.start();g.toggleAutoPlay();
    h.document.hidden=true;h.document.dispatch('visibilitychange');
    assert.equal(g.paused,true);assert.equal(g.autoPlayInterval,null);assert.equal(h.frames.size,0);
    const before=JSON.stringify([g.currentPiece,g.board,g.score]);h.advance(60000);h.frame();
    g.togglePause();assert.equal(g.paused,true);
    assert.equal(JSON.stringify([g.currentPiece,g.board,g.score]),before);
    h.document.hidden=false;h.document.dispatch('visibilitychange');assert.equal(g.paused,true);
    g.togglePause();h.frame();assert.equal(g.paused,false);assert.equal(h.frames.size,1);
    assert.equal(JSON.stringify([g.currentPiece,g.board,g.score]),before);
});
test('visibility changes preserve manual pause, before start and game over',()=>{
    const h=createGame();const g=h.game;h.document.hidden=true;h.document.dispatch('visibilitychange');assert.equal(g.paused,false);
    h.document.hidden=false;h.start();g.togglePause();h.document.hidden=true;h.document.dispatch('visibilitychange');
    h.document.hidden=false;h.document.dispatch('visibilitychange');assert.equal(g.paused,true);
    g.gameOver=true;g.paused=false;h.document.hidden=true;h.document.dispatch('visibilitychange');assert.equal(g.paused,false);
});
