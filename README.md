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
      build.mjs         assembles dist/ as one self-contained index.html (the original loading behaviour); --split is an opt-in experiment
      verify.mjs        proves the source still rebuilds the original single-file site byte for byte
      dev.mjs           build + local server on :3000
    tests/baseline.sha256   hash of the original v24 single file
    vercel.json         build, headers, caching

## Commands
    npm run dev           build and serve at http://localhost:3000 (visit /__rebuild after edits)
    npm run build         production build -> dist/ (single self-contained index.html, CDN libraries)
    npm run build:split   experimental build -> dist-split/ (external hashed files, self-hosted libraries)
    npm run verify        check the source still equals the baseline

`verify` will fail after you intentionally edit anything under src/. That is expected: run
`npm run verify` and copy the hash it prints for dist-verify/index.html into tests/baseline.sha256 (the analytics tag is not part of that hash).

## Deploy (Vercel)
Import the repo. Framework Preset: Other (vercel.json already sets the build command and the dist/ output). Add the jamtin.me domain.

## Split build (experimental, NOT used for production)
The production build keeps CSS, JS and model data inline, exactly like the original site, because the split version did not give a better loading experience.
`npm run build:split` is kept only for future experiments. Details of what it does:

### Model payloads
In the normal build each `src/data/*.b64` payload becomes `assets/data/<name>.<hash>.js`. The placeholder `<script type="text/plain" id="...">` stays where it was and a
parser-blocking script right after it fills in the identical text, so every consumer sees the same content at the same moment. index.html is ~0.4 MB instead of 23.5 MB.
Files download in parallel and are cached for a year. 

### Self-hosted libraries
The split build downloads Three.js and GSAP from cdnjs into dist/vendor/ and rewrites the script tags (cached for a year).
If a download fails, the build prints a WARN line and keeps the CDN link.

## Sound guide behaviour
First visit: full intro. Returning visitors (stored in localStorage `jamtin_kg_seen`): a shorter, different line, lighter dim, auto-hides after 11 s.
After 3 visits she no longer appears. Clear the key to test again.

## Polish layer
`src/css/08-polish.css` + `src/js/23-polish.js`: custom cursor (fine pointers only; states link, hold, drag, text; touch gets a tap ripple), magnetic buttons,
press and focus feedback, hover/click sounds through JSND (only while sound is on), and a slow-breathing ember/moon glow (`#kglow`). Vignette and grain already existed (`.vig`, `#fx`).
Remove the `08`/`23` markers in `src/index.html` (and the `#kglow`/`#kc` elements) to switch it all off.

## Analytics
Cookieless, no personal data, provider-agnostic (`src/js/00-analytics.js`). Off until configured. Set it in `analytics.config.json` or with Vercel env vars
`ANALYTICS_PROVIDER` (`umami` | `goatcounter` | `plausible` | `ga4`), `ANALYTICS_ID`, optional `ANALYTICS_SRC` (self-hosted script URL). Env vars win over the file.
- umami: ID = Website ID. goatcounter: ID = your code (the `xxx` in xxx.goatcounter.com). plausible: ID = domain. ga4: ID = `G-XXXXXXXXXX` (sets cookies, needs a consent banner).
- Check it: open the site with `?jtdebug` to log events to the console. Visit `?notrack=1` once to exclude your own browser (`?notrack=0` undoes it). Do Not Track is respected.
- Events: `session_start` (device, network, referrer), `loader_slow`, `loader_done` (time bucket, `failopen`=1 when the 16 s limit hit), `loader_exit` (progress when they left), `scene_ready`, `fallback_mode` (no 3D),
  `fox_shown/accept/decline`, `sound` on/off, `begin_hold_start`, `journey_begin`, `chapter` (about, projects, skills, experience, contact), `project_open`, `final_gate_open`,
  `contact_start/submit/sent/fail`, `link` (mailto, resume, external host), `email_copy`, `engaged` (30 s, 2 min), `session_end` (where they stopped), `js_error`, `webgl_lost`.

## Editing guide
- Project cards, links and copy: src/js/06-content-projects.js
- Sound guide (fox): src/css/07-sound-guide.css and src/js/22-sound-guide.js, markup is in src/index.html (#kg)
- Hero scythe size: the `s=1.25*...` line in src/js/05-scene-main.js
- Keep script order in src/index.html; do not reorder markers.
- Replay the sound guide: clear localStorage key `jamtin_kg_seen`.

## Known follow-ups
Large base64 blobs still live inside src/js/07-audio-engine.js (sound samples) and src/js/06-content-projects.js (project images).
Moving them to real files would shrink the JS considerably but means changing how they are loaded, so it was left alone.
