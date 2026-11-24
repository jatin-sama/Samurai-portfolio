// Zero-dependency build.
//   node scripts/build.mjs                 -> dist/         DEFAULT (lean): small index.html + model data as separate cached files (assets/data/*.txt) that download in parallel
//                                                           with a real progress bar; heavy scene scripts run once the home-page models (samurai, scythe, torii, lantern) arrived;
//                                                           oni gate + blood moon load in the background afterwards
//   node scripts/build.mjs --inline        -> dist-single/  the old single 26 MB index.html (CSS, JS and model data inlined). Used by `npm run verify`
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
const inline = args.has('--inline');
const lean = !split && !inline;
const outDir = path.join(root, split ? 'dist-split' : noAnalytics ? 'dist-verify' : inline ? 'dist-single' : 'dist');
const LAZY = new Set(['data/oni.b64', 'data/oni-tex.b64', 'data/blood-moon.b64', 'data/castle.b64', 'data/castle-tex.b64']); // not needed on the home page

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
const analyticsTag = !noAnalytics && A.provider !== 'none' && (A.id || A.provider === 'vercel')
  ? `<script>window.__JT_ANALYTICS=${JSON.stringify(A).replace(/</g, '\\u003c')}</script>` : '';
if (!noAnalytics) console.log(analyticsTag ? `analytics: ${A.provider}` : 'analytics: off (set analytics.config.json or ANALYTICS_* env vars)');

// Lean build: write every data payload as a hashed .txt file (text/plain is compressed by the host) and describe it in a manifest.
const template = read('index.html');
const manifest = [];
if (lean) {
  for (const m of template.matchAll(/<!--@data (\S+?) id="(\w+)"-->/g)) {
    const body = read(m[1]);
    const file = `assets/data/${path.parse(m[1]).name}.${hash(body)}.txt`;
    fs.mkdirSync(path.join(outDir, 'assets/data'), { recursive: true });
    fs.writeFileSync(path.join(outDir, file), body);
    manifest.push({ id: m[2], url: '/' + file, size: Buffer.byteLength(body), eager: !LAZY.has(m[1]) });
  }
}
let deferring = false; // lean build: every script from the torii model onward waits until the eager data has arrived

const html = template.replace('<!--@datamanifest-->', () => lean ? `<script>window.__JT_DATA=${JSON.stringify(manifest)}</script>` : '').replace('<!--@boot-->', () => lean ? '<script>window.__jtBoot&&window.__jtBoot()</script>' : '').replace('<!--@analytics-->', () => analyticsTag).replace(/<!--@(css|js|data) (\S+?)((?:\s[^]*?)?)-->/g, (_, kind, rel, attrs) => {
  if (kind === 'data') {
    if (lean) return `<script type="text/plain"${attrs}></script>`;
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
  if (lean && rel === 'js/02-model-torii.js') deferring = true;
  if (lean && deferring) return `<script type="text/plain" data-jt-run${attrs}>${read(rel)}</script>`;
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

// Normal build: best-effort copies of the two libraries, used only if both CDNs fail for a visitor (/vendor/three.min.js, /vendor/gsap.min.js).
if (!split && !noAnalytics) {
  const libs = [['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'three.min.js'], ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', 'gsap.min.js']];
  for (const [url, name] of libs) {
    try {
      const res = await fetch(url.replace('https://cdnjs.cloudflare.com', VENDOR_ORIGIN), { signal: AbortSignal.timeout(20000) });
      const code = res.ok ? await res.text() : '';
      if (code.length < 20000 || code.trimStart().startsWith('<')) throw new Error(res.ok ? 'unexpected content' : 'HTTP ' + res.status);
      fs.mkdirSync(path.join(outDir, 'vendor'), { recursive: true });
      fs.writeFileSync(path.join(outDir, 'vendor', name), code);
      console.log('fallback copy: vendor/' + name);
    } catch (e) {
      console.warn(`WARN no local fallback copy of ${name} (${e.message}); the CDN links still work`);
    }
  }
}
fs.cpSync(path.join(src, 'public'), outDir, { recursive: true });
console.log(`built ${path.relative(root, outDir)}/ (index.html ${(Buffer.byteLength(finalHtml) / 1e6).toFixed(2)} MB)`);
