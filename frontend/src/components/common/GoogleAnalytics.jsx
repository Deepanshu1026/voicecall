import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = 'G-TDW4SCLJRV';

const GoogleAnalytics = () => {
  const location = useLocation();
  const lastPath = useRef(null);

  useEffect(() => {
    const path = location.pathname + location.search;
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
  }, [location]);

  return null;
};

export default GoogleAnalytics;
