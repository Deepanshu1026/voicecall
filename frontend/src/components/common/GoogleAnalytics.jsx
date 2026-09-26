import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = 'G-TDW4SCLJR';

const GoogleAnalytics = () => {
  const location = useLocation();
  const lastPath = useRef(null);

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    const path = location.pathname + location.search;
    if (lastPath.current === path) return;
    lastPath.current = path;
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_ID,
    });
  }, [location]);

  return null;
};

export default GoogleAnalytics;
