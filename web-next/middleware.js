import { NextResponse } from 'next/server';

// Strip junk tracking parameters (e.g. ?c=123...) so they never get indexed
// as duplicate homepage/content URLs. Redirects permanently to the clean URL.
const JUNK_PARAMS = ['c'];

export function middleware(request) {
  const { nextUrl } = request;
  const hasJunk = JUNK_PARAMS.some((p) => nextUrl.searchParams.has(p));

  if (hasJunk) {
    const url = nextUrl.clone();
    JUNK_PARAMS.forEach((p) => url.searchParams.delete(p));
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/|api/|.*\\..*).*)',
};
