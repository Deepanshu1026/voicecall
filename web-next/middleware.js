import { NextResponse } from 'next/server';

// Strip junk/tracking query parameters (e.g. ?c=123..., ?utm_source=...) so they
// never get indexed as duplicate pages. Permanently redirects to the clean URL.
const JUNK_EXACT = new Set([
  'o',
  'u',
  's',
  'c',
  'l',
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

export function middleware(request) {
  const { nextUrl } = request;
  const params = nextUrl.searchParams;

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
