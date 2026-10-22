const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createGame}=require('./helpers.cjs');
test('resize fits board and preview while preserving gameplay state',()=>{
    const h=createGame();const g=h.start();g.score=123;g.board[19][0]=7;
    const before=JSON.stringify([g.board,g.currentPiece,g.nextPiece,g.score]);
    for(const [width,height] of [[375,667],[390,844],[844,390],[1280,720]]){
        h.window.innerWidth=width;h.window.innerHeight=height;h.window.dispatch('resize');
        assert.equal(g.canvas.height/g.canvas.width,2);
        assert.ok(g.canvas.height+g.nextCanvas.height < height-24);
        assert.equal(g.nextCanvas.width/g.canvas.width,0.4);
        assert.equal(JSON.stringify([g.board,g.currentPiece,g.nextPiece,g.score]),before);
        if(width===375)assert.ok(g.canvas.height<=300,'small portrait must reserve room for controls');
    }
});
