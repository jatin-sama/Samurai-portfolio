// Zero-dependency build.
//   node scripts/build.mjs           -> dist/         (external hashed CSS/JS, inlined data payloads)
//   node scripts/build.mjs --single  -> dist-single/  (everything inlined into one index.html)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const single = process.argv.includes('--single');
const outDir = path.join(root, single ? 'dist-single' : 'dist');

// Kept inline in the normal build: critical first-paint CSS for the loader.
const INLINE_CSS = new Set(['css/01-loader.css']);

const read = (rel) => fs.readFileSync(path.join(src, rel), 'utf8');
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

function emitAsset(rel) {
  const body = read(rel);
  const { dir, name, ext } = path.parse(rel);
  const file = `assets/${dir}/${name}.${hash(body)}${ext}`;
  fs.mkdirSync(path.join(outDir, path.dirname(file)), { recursive: true });
  fs.writeFileSync(path.join(outDir, file), body);
  return '/' + file;
}

const html = read('index.html').replace(/<!--@(css|js|data) (\S+?)((?:\s[^]*?)?)-->/g, (_, kind, rel, attrs) => {
  if (kind === 'data') return `<script type="text/plain"${attrs}>${read(rel)}</script>`;
  if (kind === 'css') {
    return single || INLINE_CSS.has(rel)
      ? `<style${attrs}>${read(rel)}</style>`
      : `<link rel="stylesheet"${attrs} href="${emitAsset(rel)}">`;
  }
  return single ? `<script${attrs}>${read(rel)}</script>` : `<script${attrs} src="${emitAsset(rel)}"></script>`;
});

fs.writeFileSync(path.join(outDir, 'index.html'), html);
fs.cpSync(path.join(src, 'public'), outDir, { recursive: true });
console.log(`built ${path.relative(root, outDir)}/ (index.html ${(Buffer.byteLength(html) / 1e6).toFixed(2)} MB)`);
