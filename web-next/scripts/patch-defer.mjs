// Post-build: convert Next.js chunk script tags from async to defer in the
// prerendered HTML. defer keeps execution in document order (a subset of the
// arbitrary order async already allows, since all Next chunks self-register
// via the order-independent webpackChunk push pattern), while removing the
// "render-blocking script" flag raised by some SEO auditors. noModule
// polyfills are skipped entirely by modern browsers either way.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(process.cwd(), '.next', 'server', 'app');
if (!statSync(ROOT, { throwIfNoEntry: false })) {
  console.log('patch-defer: no .next/server/app directory, skipping');
  process.exit(0);
}

const htmlFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith('.html')) htmlFiles.push(p);
  }
})(ROOT);

let total = 0;
for (const f of htmlFiles) {
  const before = readFileSync(f, 'utf8');
  let after = before.replace(
    /(<script src="\/_next\/static\/chunks\/[^"]+"[^>]*?) async=""/g,
    '$1 defer=""'
  );
  after = after.replace(
    /(<script src="\/_next\/static\/chunks\/polyfills-[^"]+"[^>]*?) noModule=""/g,
    '$1 noModule="" defer=""'
  );
  if (after !== before) {
    const n = (before.match(/ async=""/g) || []).length;
    writeFileSync(f, after, 'utf8');
    total += n;
    console.log(`patch-defer: ${f.replace(process.cwd(), '')} (${n} scripts)`);
  }
}
console.log(`patch-defer: done, ${total} script tags converted to defer across ${htmlFiles.length} html files`);
