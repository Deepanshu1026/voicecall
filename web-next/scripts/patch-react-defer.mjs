// Patch Next.js vendored server bundles so SSR emits <script defer> instead of
// <script async> for chunk scripts. Covers build-time prerender AND runtime
// (ISR revalidation) rendering, on every runtime (node/edge/bun/turbo).
// Usage: node scripts/patch-react-defer.mjs [--check]
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';

const checkOnly = process.argv.includes('--check');
const NEEDLE = ' async=""';

// Server-side render bundles only (never touch client react-dom bundles).
const isServerRenderBundle = (p) =>
  /react-dom(-experimental)?[\\/]cjs[\\/]react-dom-server.*\.js$/.test(p) ||
  (/next-server[\\/].*app-page.*\.js$/.test(p) && /\.runtime\..*\.js$/.test(p));

const roots = ['node_modules/next/dist/compiled', 'node_modules/react-dom/cjs'];
let total = 0;
const report = [];

function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) { walk(p); continue; }
    if (!p.endsWith('.js') || !isServerRenderBundle(p)) continue;
    let c;
    try { c = readFileSync(p, 'utf8'); } catch { continue; }
    let n = 0;
    // 1) bootstrap-script suffix chunk: '" async=""></script>' -> '" defer=""></script>'
    if (c.includes(NEEDLE)) {
      n += c.split(NEEDLE).length - 1;
      if (!checkOnly) c = c.split(NEEDLE).join(' defer=""');
    }
    // 2) preinit script props: {src:x,async:!0} -> {src:x,defer:!0}  (chunk preload scripts)
    const preinitRe = /\{src:([A-Za-z_$][\w$]*),async:!0\}/g;
    const preinitHits = [...c.matchAll(preinitRe)].length;
    if (preinitHits > 0) {
      n += preinitHits;
      if (!checkOnly) c = c.replace(preinitRe, '{src:$1,defer:!0}');
    }
    if (n === 0) continue;
    report.push(`  ${n}x ${p.split('node_modules')[1] || p}`);
    if (!checkOnly) writeFileSync(p, c, 'utf8');
    total += n;
  }
}
roots.forEach((r) => statSync(r, { throwIfNoEntry: false }) && walk(r));
report.forEach((r) => console.log(r));
console.log(`${checkOnly ? 'CHECK' : 'PATCH'}: ${total} script emissions ${checkOnly ? 'still async' : 'converted to defer'}`);
