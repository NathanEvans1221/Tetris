const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createGame}=require('./helpers.cjs');
test('AI gravity is derived from level across clear, pause and toggle',()=>{
    const h=createGame();const g=h.start();g.toggleAutoPlay();assert.equal(g.dropInterval,100);
    g.board[19].fill(1);g.clearLines();assert.equal(g.dropInterval,100);
    g.lines=29;g.board[19].fill(1);g.clearLines();assert.equal(g.level,4);assert.equal(g.dropInterval,70);
    g.togglePause();g.toggleAutoPlay();assert.equal(g.dropInterval,700);assert.equal(g.autoPlayInterval,null);
    g.toggleAutoPlay();assert.equal(g.dropInterval,70);assert.equal(g.autoPlayInterval,null);
    g.togglePause();assert.equal([...h.timers.values()].filter(t=>t.repeat).length,1);
    for(let i=0;i<5;i++){g.toggleAutoPlay();assert.equal(g.dropInterval,700);g.toggleAutoPlay();assert.equal(g.dropInterval,70);}
    assert.equal([...h.timers.values()].filter(t=>t.repeat).length,1);
    g.gameOver=true;g.showGameOver();assert.equal(g.dropInterval,700);assert.equal(g.autoPlayInterval,null);
});
test('AI recalculates when gravity replaces a piece with the same color',()=>{
    const h=createGame();const g=h.start();g.toggleAutoPlay();
    let searches=0;g.findBestMove=()=>{searches++;return {x:0,rotations:0};};
    h.advance(200);const color=g.currentPiece.color;g.spawnPiece();assert.equal(g.currentPiece.color,color);
    h.advance(200);assert.equal(searches,2);
});
test('AI callback from a previous session cannot move a new game',()=>{
    const h=createGame();const g=h.start();g.toggleAutoPlay();const old=h.timers.get(g.autoPlayInterval).fn;
    g.init();g.start();g.toggleAutoPlay();const before=JSON.stringify([g.currentPiece,g.board,g.score]);
    old();assert.equal(JSON.stringify([g.currentPiece,g.board,g.score]),before);
});
