'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const GA_ID = 'G-TDW4SCLJRV';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef(null);

  useEffect(() => {
    const path = pathname + (window.location.search || '');
    if (lastPath.current === path) return;
    lastPath.current = path;

    let tries = 0;
    const send = () => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_path: path,
          page_location: window.location.href,
          page_title: document.title,
          send_to: GA_ID,
        });
        return;
      }
      if (tries++ < 20) setTimeout(send, 250);
    };
    send();
  }, [pathname]);

  return null;
}
