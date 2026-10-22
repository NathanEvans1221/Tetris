const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createGame } = require('./helpers.cjs');

function canonical(shape) {
    const forms = [];
    for (let r = 0; r < 4; r++) {
        const points = shape.flatMap((row, y) => row.flatMap((v, x) => v ? [[x, y]] : []));
        const left = Math.min(...points.map(p => p[0])), top = Math.min(...points.map(p => p[1]));
        forms.push(points.map(([x, y]) => `${x-left},${y-top}`).sort().join(';'));
        shape = shape[0].map((_, x) => shape.map(row => row[x]).reverse());
    }
    return forms.sort()[0];
}
test('seven tetrominoes remain distinct under rotations', () => {
    const { SHAPES } = createGame();
    assert.equal(new Set(SHAPES.slice(1).map(canonical)).size, 7);
    for (const s of SHAPES.slice(1)) assert.equal(s.flat().filter(Boolean).length, 4);
});
test('shape identities match documented color mapping', () => {
    const { SHAPES, COLORS } = createGame();
    const fixtures = [null, [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]]];
    const colors = [null, '#00f0f0','#f0f000','#a000f0','#00f000','#f00000','#0000f0','#f0a000'];
    for (let i = 1; i <= 7; i++) {
        assert.equal(canonical(SHAPES[i]), canonical(fixtures[i]), `shape ${i}`);
        assert.equal(COLORS[i], colors[i]);
    }
});
