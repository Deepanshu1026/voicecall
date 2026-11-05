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
// This runs on every HTML navigation and has to reach the API, so keep the
// cache generous (the flag only changes when an admin toggles it) and cap the
// wait so a slow backend can never stall a page.
const MAINTENANCE_API = 'https://voicecall-6ylg.onrender.com/api/settings/maintenance';
const MAINTENANCE_TTL_MS = 120000;
const MAINTENANCE_TIMEOUT_MS = 1500;
let maintenanceCache = { at: 0, enabled: false };

async function isMaintenanceOn() {
  const now = Date.now();
  if (now - maintenanceCache.at < MAINTENANCE_TTL_MS) return maintenanceCache.enabled;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), MAINTENANCE_TIMEOUT_MS);
    const res = await fetch(MAINTENANCE_API, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    const json = await res.json();
    maintenanceCache = { at: now, enabled: !!json?.data?.enabled };
  } catch (e) {
    maintenanceCache = { at: now, enabled: false };
  }
  return maintenanceCache.enabled;
}

export async function middleware(request) {
  const { nextUrl } = request;

  // Maintenance mode: show only the maintenance page for the whole website.
  if (nextUrl.pathname !== '/maintenance' && (await isMaintenanceOn())) {
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
