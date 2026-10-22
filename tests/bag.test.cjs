const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createGame}=require('./helpers.cjs');
test('each bag delivers all seven types once and preview predicts the next piece',()=>{
    const h=createGame({random:()=>0.5});const g=h.start();const seen=[];
    for(let i=0;i<21;i++){
        seen.push(g.currentPiece.color);const next=g.nextPiece.color;g.spawnPiece();assert.equal(g.currentPiece.color,next);
    }
    for(let i=0;i<21;i+=7)assert.deepEqual(seen.slice(i,i+7).sort(),[1,2,3,4,5,6,7]);
});
test('restart discards a partially used bag and resets the preview sequence',()=>{
    const h=createGame({random:()=>0.25});const g=h.start();const initial=[g.currentPiece.color,g.nextPiece.color];
    g.spawnPiece();g.spawnPiece();g.init();g.start();
    assert.deepEqual([g.currentPiece.color,g.nextPiece.color],initial);
});
