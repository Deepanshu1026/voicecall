import { NextResponse } from 'next/server';

// Strip junk/tracking query parameters (e.g. ?c=123..., ?utm_source=...) so they
// never get indexed as duplicate pages. Permanently redirects to the clean URL.
const JUNK_EXACT = new Set([
  'o',
  'u',
  's',
  'c',
  'l',
  // Legacy blog_pages/post.php?id=…&title=… 301s land here as /blogs?id=…&title=…
  'id',
  'title',
  'fbclid',
  'gclid',
  'gclsrc',
  'dclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'igshid',
  'yclid',
  'twclid',
  'ttclid',
  'li_fat_id',
  'wbraid',
  'gbraid',
  's_kwcid',
  'epik',
  'scid',
  '_ga',
  '_gl',
]);

const JUNK_PREFIXES = ['utm_'];

// Site-wide maintenance switch. Checked here so every marketing/blog page is
// gated server-side before it renders. Cached briefly and fails open (a backend
// hiccup must never take the site down).
// Never block a request on this. A refresh is kicked off in the background and
// the last known value is used, so the maintenance check adds ~0ms to a page.
// It fails open (a backend hiccup can never take the site down).
const MAINTENANCE_API = 'https://voicecall-6ylg.onrender.com/api/settings/maintenance';
const MAINTENANCE_TTL_MS = 120000;
const MAINTENANCE_TIMEOUT_MS = 1500;
let maintenanceCache = { at: 0, enabled: false, pending: false };

function refreshMaintenance(event) {
  const now = Date.now();
  if (maintenanceCache.pending || now - maintenanceCache.at < MAINTENANCE_TTL_MS) return;

  maintenanceCache.pending = true;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MAINTENANCE_TIMEOUT_MS);

  const task = fetch(MAINTENANCE_API, { cache: 'no-store', signal: controller.signal })
    .then((res) => res.json())
    .then((json) => {
      maintenanceCache = { at: Date.now(), enabled: !!json?.data?.enabled, pending: false };
    })
    .catch(() => {
      maintenanceCache = { at: Date.now(), enabled: false, pending: false };
    })
    .finally(() => clearTimeout(timer));

  // Keep the edge function alive until the refresh settles.
  if (event && typeof event.waitUntil === 'function') event.waitUntil(task);
}

export async function middleware(request, event) {
  const { nextUrl } = request;

  refreshMaintenance(event);

  // Maintenance mode: show only the maintenance page for the whole website.
  if (nextUrl.pathname !== '/maintenance' && maintenanceCache.enabled) {
    const url = nextUrl.clone();
    url.pathname = '/maintenance';
    url.search = '';
    return NextResponse.rewrite(url);
  }

  const params = nextUrl.searchParams;

  // The homepage takes no parameters, so ANY query string there is a
  // tracking/duplicate variant (e.g. ?l=76135011277, ?o=…, ?c=…, ?u=…, or an
  // unknown key). Send them all to the clean canonical URL.
  if (nextUrl.pathname === '/' && params.toString()) {
    const url = nextUrl.clone();
    url.search = '';
    return NextResponse.redirect(url, 301);
  }

  const toDelete = [];
  for (const key of params.keys()) {
    const k = key.toLowerCase();
    if (JUNK_EXACT.has(k) || JUNK_PREFIXES.some((prefix) => k.startsWith(prefix))) {
      toDelete.push(key);
    }
  }

  if (toDelete.length > 0) {
    const url = nextUrl.clone();
    toDelete.forEach((k) => url.searchParams.delete(k));
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/|api/|.*\\..*).*)',
};
