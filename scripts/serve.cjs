const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png' };
http.createServer((req,res) => {
    const name = new URL(req.url, 'http://localhost').pathname;
    const relative = name === '/' ? 'index.html' : name.slice(1);
    if (!['index.html','game.js','style.css','images/Tetris.png'].includes(relative)) { res.writeHead(404); res.end(); return; }
    fs.readFile(path.join(root, relative), (error,data) => {
        res.writeHead(error ? 404 : 200, { 'Content-Type':types[path.extname(relative)], 'Cache-Control':'no-store' });
        res.end(error ? '' : data);
    });
}).listen(8000,'127.0.0.1', () => console.log('Tetris: http://127.0.0.1:8000'));
