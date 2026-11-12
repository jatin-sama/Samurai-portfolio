# JAMTIN portfolio

Cinematic WebGL portfolio (Three.js + GSAP from CDN). Plain HTML/CSS/JS, no framework, no dependencies.

## Structure
    src/
      index.html        page template (markers like <!--@js js/05-scene-main.js--> mark where files are placed)
      css/              stylesheets, numbered in load order
      js/               scripts, numbered in load order (order matters: models and audio load before scenes)
      data/*.b64        embedded 3D models, textures (gzip/base64), read at runtime via their element ids
      public/           copied as-is to the site root (favicon, og-image, robots, sitemap, 404)
    scripts/
      build.mjs         assembles dist/ (hashed CSS/JS, data inlined); --single makes one self-contained file
      verify.mjs        proves the split source rebuilds the original single-file site byte for byte
      dev.mjs           build + local server on :3000
    tests/baseline.sha256   hash of the original v24 single file
    vercel.json         build, headers, caching

## Commands
    npm run dev           build and serve at http://localhost:3000 (visit /__rebuild after edits)
    npm run build         production build -> dist/
    npm run build:single  one-file build -> dist-single/index.html
    npm run verify        check the source still equals the baseline

`verify` will fail after you intentionally edit anything under src/. That is expected: run
`npm run build:single` and copy the new hash of dist-single/index.html into tests/baseline.sha256.

## Deploy (Vercel)
Import the repo. Framework Preset: Other (vercel.json already sets the build command and the dist/ output). Add the jamtin.me domain.

## Self-hosted libraries
The normal build downloads Three.js and GSAP from cdnjs into dist/vendor/ and rewrites the script tags (cached for a year).
If a download fails, the build prints a WARN line and keeps the CDN link, so a deploy never breaks. `--single` always keeps the CDN links.

## Sound guide behaviour
First visit: full intro. Returning visitors (stored in localStorage `jamtin_kg_seen`): a shorter, different line, lighter dim, auto-hides after 11 s.
After 3 visits she no longer appears. Clear the key to test again.

## Editing guide
- Project cards, links and copy: src/js/06-content-projects.js
- Sound guide (fox): src/css/07-sound-guide.css and src/js/22-sound-guide.js, markup is in src/index.html (#kg)
- Hero scythe size: the `s=1.25*...` line in src/js/05-scene-main.js
- Keep script order in src/index.html; do not reorder markers.
- Replay the sound guide: clear localStorage key `jamtin_kg_seen`.

## Known follow-ups
Large base64 blobs still live inside src/js/07-audio-engine.js (sound samples) and src/js/06-content-projects.js (project images).
Moving them to real files would shrink the JS considerably but means changing how they are loaded, so it was left alone.
