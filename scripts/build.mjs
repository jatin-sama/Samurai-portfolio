// Zero-dependency build.
//   node scripts/build.mjs                 -> dist/         one self-contained index.html (CSS, JS and model data inlined, CDN libraries), exactly how the site always loaded
//   node scripts/build.mjs --split         -> dist-split/   experimental: external hashed CSS/JS/data files + self-hosted libraries
//   node scripts/build.mjs --no-analytics  -> dist-verify/  default layout without the analytics tag (used by `npm run verify`)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const args = new Set(process.argv.slice(2));
const split = args.has('--split');
const noAnalytics = args.has('--no-analytics');
const outDir = path.join(root, split ? 'dist-split' : noAnalytics ? 'dist-verify' : 'dist');

const INLINE_CSS = new Set(['css/01-loader.css']); // split build only: critical first-paint CSS stays inline
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

// Analytics config: analytics.config.json, overridable by ANALYTICS_PROVIDER / ANALYTICS_ID / ANALYTICS_SRC env vars (e.g. in Vercel).
let A = { provider: 'none', id: '', src: '' };
try { A = { ...A, ...JSON.parse(fs.readFileSync(path.join(root, 'analytics.config.json'), 'utf8')) }; } catch {}
if (process.env.ANALYTICS_PROVIDER) A.provider = process.env.ANALYTICS_PROVIDER;
if (process.env.ANALYTICS_ID) A.id = process.env.ANALYTICS_ID;
if (process.env.ANALYTICS_SRC) A.src = process.env.ANALYTICS_SRC;
const analyticsTag = !noAnalytics && A.provider !== 'none' && A.id
  ? `<script>window.__JT_ANALYTICS=${JSON.stringify(A).replace(/</g, '\\u003c')}</script>` : '';
if (!noAnalytics) console.log(analyticsTag ? `analytics: ${A.provider}` : 'analytics: off (set analytics.config.json or ANALYTICS_* env vars)');

const html = read('index.html').replace('<!--@analytics-->', () => analyticsTag).replace(/<!--@(css|js|data) (\S+?)((?:\s[^]*?)?)-->/g, (_, kind, rel, attrs) => {
  if (kind === 'data') {
    if (!split) return `<script type="text/plain"${attrs}>${read(rel)}</script>`;
    const id = /id="(\w+)"/.exec(attrs)[1];
    const code = `document.getElementById(${JSON.stringify(id)}).textContent=${JSON.stringify(read(rel))};`;
    const { name } = path.parse(rel);
    const file = `assets/data/${name}.${hash(code)}.js`;
    fs.mkdirSync(path.join(outDir, 'assets/data'), { recursive: true });
    fs.writeFileSync(path.join(outDir, file), code);
    return `<script type="text/plain"${attrs}></script><script src="/${file}"></script>`;
  }
  if (kind === 'css') {
    return !split || INLINE_CSS.has(rel)
      ? `<style${attrs}>${read(rel)}</style>`
      : `<link rel="stylesheet"${attrs} href="${emitAsset(rel)}">`;
  }
  return split ? `<script${attrs} src="${emitAsset(rel)}"></script>` : `<script${attrs}>${read(rel)}</script>`;
});

// Split build only: self-host Three.js / GSAP (falls back to the CDN link if a download fails).
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
const finalHtml = split ? await vendorize(html) : html;

fs.writeFileSync(path.join(outDir, 'index.html'), finalHtml);
fs.cpSync(path.join(src, 'public'), outDir, { recursive: true });
console.log(`built ${path.relative(root, outDir)}/ (index.html ${(Buffer.byteLength(finalHtml) / 1e6).toFixed(2)} MB)`);
