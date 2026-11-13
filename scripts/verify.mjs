// Guarantees the split source still reassembles into the exact original single-file site.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs'), '--no-analytics'], { stdio: 'inherit' });
const got = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'dist-verify/index.html'))).digest('hex');
const want = fs.readFileSync(path.join(root, 'tests/baseline.sha256'), 'utf8').trim();
if (got !== want) { console.error('MISMATCH\n got ', got, '\n want', want, '\n(If you changed the source on purpose, update tests/baseline.sha256.)'); process.exit(1); }
console.log('OK: single-file build is byte-identical to the baseline');
