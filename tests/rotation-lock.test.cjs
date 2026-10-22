const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createGame}=require('./helpers.cjs');
function grounded(h,x=3){const g=h.start();g.currentPiece={shape:[[2,2],[2,2]],color:2,x,y:18};g.drop();return g;}
test('grounded piece waits 500ms and then locks without another gravity tick',()=>{
    const h=createGame();const g=grounded(h);const piece=g.currentPiece;
    assert.equal(g.board[18][3],0);h.advance(499);h.frame();assert.equal(g.currentPiece,piece);
    h.advance(1);h.frame();assert.notEqual(g.currentPiece,piece);assert.equal(g.board[18][3],2);
});
test('only fifteen successful grounded moves can reset the lock timer',()=>{
    const h=createGame();const g=grounded(h);const piece=g.currentPiece;
    for(let i=0;i<15;i++){h.advance(100);g.move(i%2?1:-1);h.frame();assert.equal(g.currentPiece,piece);}
    h.advance(400);g.move(1);h.frame();assert.equal(g.currentPiece,piece);
    h.advance(100);h.frame();assert.notEqual(g.currentPiece,piece);
});
test('blocked movement and square rotation do not prolong the lock timer',()=>{
    const h=createGame();const g=grounded(h,0);const piece=g.currentPiece;
    for(let i=0;i<5;i++){h.advance(100);g.move(-1);g.rotate();h.frame();}
    assert.notEqual(g.currentPiece,piece);
});
test('pause preserves the remaining lock delay and restart discards it',()=>{
    const h=createGame();const g=grounded(h);const piece=g.currentPiece;
    h.advance(200);g.togglePause();h.advance(60000);g.togglePause();h.frame();assert.equal(g.currentPiece,piece);
    h.advance(299);h.frame();assert.equal(g.currentPiece,piece);h.advance(1);h.frame();assert.notEqual(g.currentPiece,piece);
    g.init();g.start();assert.equal(g.lockStartedAt,null);assert.equal(g.lockResets,0);
});
test('hard drop bypasses the lock delay',()=>{
    const h=createGame();const g=h.start();const piece=g.currentPiece;g.hardDrop();assert.notEqual(g.currentPiece,piece);assert.ok(g.board.some(row=>row.some(Boolean)));
});
test('clockwise wall kick moves a vertical I into the board',()=>{
    const h=createGame();const g=h.start();
    g.currentPiece={shape:[[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],color:1,x:-2,y:3};
    assert.equal(g.rotate(),true);assert.equal(g.currentPiece.x,0);assert.equal(g.collide(g.board,g.currentPiece),false);
});
test('floor kick raises T by one cell and preserves a legal placement',()=>{
    const h=createGame();const g=h.start();
    g.currentPiece={shape:[[0,3,0],[3,3,3],[0,0,0]],color:3,x:3,y:18};
    assert.equal(g.rotate(),true);assert.equal(g.currentPiece.y,17);assert.equal(g.collide(g.board,g.currentPiece),false);
});
test('obstructed kick leaves shape and coordinates unchanged',()=>{
    const h=createGame();const g=h.start();g.board=g.board.map(row=>row.map(()=>7));
    const before=JSON.stringify(g.currentPiece);assert.equal(g.rotate(),false);assert.equal(JSON.stringify(g.currentPiece),before);
});
test('locking a piece above the top ends the game without writing partial cells',()=>{
    const h=createGame();const g=h.start();g.currentPiece={shape:[[1],[1],[1],[1]],color:1,x:3,y:-1};g.board[3][3]=7;
    g.drop();h.advance(500);h.frame();assert.equal(g.gameOver,true);assert.equal(g.board[0][3],0);
});
test('successful grounded rotation resets the delay within its budget',()=>{
    const h=createGame();const g=h.start();
    g.currentPiece={shape:[[0,3,0],[3,3,3],[0,0,0]],color:3,x:3,y:18};g.drop();
    const piece=g.currentPiece;h.advance(400);assert.equal(g.rotate(),true);
    h.advance(499);h.frame();assert.equal(g.currentPiece,piece);
    h.advance(1);h.frame();assert.notEqual(g.currentPiece,piece);
});
test('I floor kick can raise a horizontal piece by two cells',()=>{
    const h=createGame();const g=h.start();
    g.currentPiece={shape:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],color:1,x:3,y:18};
    assert.equal(g.rotate(),true);assert.equal(g.currentPiece.y,16);assert.equal(g.collide(g.board,g.currentPiece),false);
});
test('airborne piece is not locked but retains its spent reset budget',()=>{
    const h=createGame();const g=h.start();
    g.currentPiece={shape:[[2,2],[2,2]],color:2,x:3,y:17};g.board[19][3]=7;g.drop();
    const piece=g.currentPiece;g.move(1);h.advance(600);h.frame();assert.equal(g.currentPiece,piece);
    g.drop();h.frame();assert.notEqual(g.currentPiece,piece);
});
test('mixed inputs, gravity, restart and AI preserve board and scheduler invariants',()=>{
    let seed=12345;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const h=createGame({random});const g=h.start();
    for(let i=0;i<1000;i++){
        if(g.gameOver){g.init();g.start();}
        const action=Math.floor(random()*7);
        if(action===0)g.move(-1);else if(action===1)g.move(1);else if(action===2)g.rotate();
        else if(action===3)g.softDrop();else if(action===4)g.hardDrop();else if(action===5)g.toggleAutoPlay();
        else {g.togglePause();h.advance(200);g.togglePause();}
        h.advance(100);h.frame();
        assert.equal(g.board.length,20);assert.ok(g.board.every(row=>row.length===10&&row.every(v=>Number.isInteger(v)&&v>=0&&v<=7)));
        if(!g.gameOver)assert.equal(g.collide(g.board,g.currentPiece),false);
        assert.ok(h.frames.size<=1);assert.ok([...h.timers.values()].filter(t=>t.repeat).length<=1);
        assert.ok(Number.isFinite(g.score));
    }
});
