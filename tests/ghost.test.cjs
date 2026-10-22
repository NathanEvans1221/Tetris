const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createGame}=require('./helpers.cjs');
for(const x of [0,8])test(`ghost predicts hard drop at wall x=${x} without side effects`,()=>{
    const h=createGame();const g=h.start();
    g.currentPiece={shape:[[2,2],[2,2]],color:2,x,y:2};g.board[19][x]=6;
    const before=JSON.stringify([g.board,g.currentPiece,g.score]);const tones=h.tones.length;
    const ghost=g.getGhostPiece();assert.equal(ghost.y,17);g.draw();
    assert.equal(JSON.stringify([g.board,g.currentPiece,g.score]),before);assert.equal(h.tones.length,tones);
    g.hardDrop();assert.equal(g.board[17][x],2);assert.equal(g.board[18][x+1],2);
});
test('ghost recomputes after move and rotation and hides outside active play',()=>{
    const h=createGame();const g=h.game;assert.equal(g.getGhostPiece(),null);h.start();
    g.currentPiece={shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],color:1,x:3,y:0};
    assert.equal(g.getGhostPiece().y,18);g.rotate();assert.equal(g.getGhostPiece().y,16);
    g.move(1);assert.equal(g.getGhostPiece().x,4);
    g.togglePause();assert.equal(g.getGhostPiece(),null);g.togglePause();g.gameOver=true;assert.equal(g.getGhostPiece(),null);
});
test('drawing uses an outline for all ghost blocks',()=>{
    const h=createGame();const g=h.start();h.draws.length=0;g.draw();
    assert.equal(h.draws.filter(d=>d.key==='game-canvas'&&d.stroke).length,4);
});
