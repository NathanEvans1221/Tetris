const fs = require('node:fs');
const vm = require('node:vm');

function createGame({ random = () => 0, width = 1280, height = 1000 } = {}) {
    let now = 1000, id = 0;
    const frames = new Map(), timers = new Map(), elements = new Map(), tones = [], draws = [];
    function target() {
        const listeners = new Map();
        return {
            addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); },
            dispatch(type, event = {}) {
                event.target ??= this; event.preventDefault ??= () => {};
                for (const fn of listeners.get(type) || []) fn(event);
            }
        };
    }
    function element(key) {
        if (!elements.has(key)) {
            const classes = new Set();
            const context = {
                fillRect(...args) { draws.push({ key, args, alpha: this.globalAlpha ?? 1 }); },
                strokeRect(...args) { draws.push({ key, args, stroke: true }); },
                save() {}, restore() {}, globalAlpha: 1
            };
            elements.set(key, Object.assign(target(), {
                textContent: '', style: { setProperty() {} }, offsetHeight: key === '.game-header' ? 180 : 0,
                classList: { add: n => classes.add(n), remove: n => classes.delete(n), contains: n => classes.has(n) },
                getContext: () => context,
                getBoundingClientRect: () => ({ width: key === '.game-container' ? window.innerWidth : 0, height: key === '.game-header' ? 180 : key === '.mobile-controls' && window.innerWidth <= 600 ? 140 : 0 }),
                appendChild() {}, contains: () => false, removeChild() {}
            }));
        }
        return elements.get(key);
    }
    class AudioContext {
        state = 'running'; currentTime = 0; destination = {};
        resume() { this.state = 'running'; return Promise.resolve(); }
        createOscillator() {
            const tone = {};
            return { frequency: { setValueAtTime: value => { tone.freq = value; } }, connect() {}, start() { tones.push(tone); }, stop() {} };
        }
        createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
    }
    const window = Object.assign(target(), { innerWidth: width, innerHeight: height, AudioContext });
    const document = Object.assign(target(), {
        hidden: false, documentElement: element('root'), getElementById: element,
        querySelector: element, querySelectorAll: () => [], createElement: () => element('effect')
    });
    const setTimer = (fn, delay, repeat) => { const key = ++id; timers.set(key, { fn, delay, repeat, at: now + delay }); return key; };
    const math = Object.create(Math); math.random = random;
    const sandbox = {
        window, document, Math: math, Date: { now: () => now }, console,
        getComputedStyle: () => ({ getPropertyValue: () => '28px' }),
        requestAnimationFrame: fn => { const key = ++id; frames.set(key, fn); return key; }, cancelAnimationFrame: key => frames.delete(key),
        setInterval: (fn, delay) => setTimer(fn, delay, true), clearInterval: key => timers.delete(key),
        setTimeout: (fn, delay) => setTimer(fn, delay, false), clearTimeout: key => timers.delete(key)
    };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(require.resolve('../game.js'), 'utf8') + '\nglobalThis.classes = { Tetris, SoundManager, SHAPES, COLORS };', sandbox);
    const game = new sandbox.classes.Tetris();
    return {
        game, ...sandbox.classes, window, document, element, frames, timers, tones, draws,
        start() { game.init(); game.start(); return game; },
        frame() { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now)); },
        advance(ms) {
            const end = now + ms;
            while (true) {
                const next = [...timers.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
                if (!next) break;
                const [key, timer] = next; now = timer.at;
                if (timer.repeat) timer.at += timer.delay; else timers.delete(key);
                timer.fn();
            }
            now = end;
        }
    };
}
module.exports = { createGame };
