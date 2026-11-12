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

// Self-host Three.js / GSAP in the normal build (falls back to the CDN link if a download fails).
const VENDOR_ORIGIN = process.env.VENDOR_ORIGIN || 'https://cdnjs.cloudflare.com';
async function vendorize(input) {
  const re = /(<script[^>]*\ssrc=")(https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/[^"]+)(")/g;
  const found = [...new Set([...input.matchAll(re)].map((m) => m[2]))];
  let out = input;
  for (const url of found) {
    const name = new URL(url).pathname.split('/').slice(3).join('-');
    try {
      const res = await fetch(url.replace('https://cdnjs.cloudflare.com', VENDOR_ORIGIN), { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const code = await res.text();
      if (code.length < 20000 || code.trimStart().startsWith('<')) throw new Error('unexpected content');
      fs.mkdirSync(path.join(outDir, 'vendor'), { recursive: true });
      fs.writeFileSync(path.join(outDir, 'vendor', name), code);
      out = out.split(url).join('/vendor/' + name);
      console.log('vendored ' + name);
    } catch (e) {
      console.warn(`WARN could not self-host ${url} (${e.message}); keeping the CDN link`);
    }
  }
  return out;
}
const finalHtml = single ? html : await vendorize(html);

fs.writeFileSync(path.join(outDir, 'index.html'), finalHtml);
fs.cpSync(path.join(src, 'public'), outDir, { recursive: true });
console.log(`built ${path.relative(root, outDir)}/ (index.html ${(Buffer.byteLength(finalHtml) / 1e6).toFixed(2)} MB)`);
