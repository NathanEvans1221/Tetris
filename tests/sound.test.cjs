const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createGame}=require('./helpers.cjs');
for(const bgm of [false,true]) for(const sfx of [false,true]) {
    test(`audio routes independently: bgm=${bgm}, sfx=${sfx}`,()=>{
        const h=createGame();const sound=h.game.sounds;sound.init();
        if(!sfx)sound.toggle();if(bgm)sound.toggleBgm();
        const before=h.tones.length;sound.move();assert.equal(h.tones.length-before,sfx?1:0);
        const after=h.tones.length;h.advance(400);assert.equal(h.tones.length-after,bgm?1:0);
    });
}
test('BGM toggles keep one timer and stop future notes',()=>{
    const h=createGame();const sound=h.game.sounds;sound.init();
    for(let i=0;i<4;i++){sound.toggleBgm();sound.startBgm();assert.equal([...h.timers.values()].filter(t=>t.repeat).length,1);sound.toggleBgm();}
    const count=h.tones.length;h.advance(1200);assert.equal(h.tones.length,count);
    assert.equal(h.timers.size,0);
});
