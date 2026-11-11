'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { API_BASE_URL } from '../lib/api';

// Fires one page view per real navigation. Blog posts are tracked separately
// (BlogViewTracker + PostView), so they are skipped here.
export default function PageViewTracker() {
  const pathname = usePathname();
  const sent = useRef('');

  useEffect(() => {
    if (!pathname || sent.current === pathname) return;
    if (pathname.startsWith('/blog')) return;
    sent.current = pathname;

    try {
      fetch(`${API_BASE_URL}/app/page-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* never let tracking break the page */
    }
  }, [pathname]);

  return null;
}
