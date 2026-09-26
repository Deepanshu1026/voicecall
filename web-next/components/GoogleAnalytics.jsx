'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const GA_ID = 'G-TDW4SCLJR';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef(null);

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    const path = pathname + (window.location.search || '');
    if (lastPath.current === path) return;
    lastPath.current = path;
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_ID,
    });
  }, [pathname]);

  return null;
}
