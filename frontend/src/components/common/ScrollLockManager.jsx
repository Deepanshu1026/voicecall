import { useEffect } from 'react';

// Any element whose class contains "overlay" and that is a fixed, near full-screen
// layer counts as an open popup/modal.
const OVERLAY_SELECTOR = '[class*="overlay"]';

const hasOpenOverlay = () => {
  const els = document.querySelectorAll(OVERLAY_SELECTOR);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  for (let i = 0; i < els.length; i += 1) {
    const el = els[i];
    const cs = window.getComputedStyle(el);
    if (cs.position !== 'fixed') continue;
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    const rect = el.getBoundingClientRect();
    if (rect.width >= vw * 0.85 && rect.height >= vh * 0.85) return true;
  }
  return false;
};

// Locks the page behind any open popup so scrolling the popup does not scroll the site.
const ScrollLockManager = () => {
  useEffect(() => {
    let locked = false;
    let timer = 0;

    const apply = () => {
      const shouldLock = hasOpenOverlay();
      if (shouldLock === locked) return;
      locked = shouldLock;
      if (shouldLock) {
        const scrollbar = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
      } else {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    };

    const schedule = () => {
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        apply();
      }, 120);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    apply();
    window.addEventListener('resize', schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      if (timer) window.clearTimeout(timer);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  return null;
};

export default ScrollLockManager;
