// Build, then serve dist/ locally: npm run dev  ->  http://localhost:3000
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
const rebuild = () => execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { stdio: 'inherit' });
rebuild();
http.createServer((req, res) => {
  if (req.url.startsWith('/__rebuild')) { rebuild(); res.end('ok'); return; }
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(dist, path.normalize(p));
  if (!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; res.end(fs.readFileSync(path.join(dist, '404.html'))); return; }
  res.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream');
  res.end(fs.readFileSync(f));
}).listen(3000, () => console.log('http://localhost:3000  (open /__rebuild after editing src/ to rebuild)'));
