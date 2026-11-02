import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/maintenance.css';

const OfflineArt = () => (
  <svg className="maint-art" viewBox="0 0 1000 200" role="img" aria-label="A disconnected cable">
    <g fill="none" stroke="#2ec4c4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      {/* left cable */}
      <path d="M-20 122 C 50 72, 120 72, 180 116 C 236 158, 300 158, 356 128" />
      {/* left connector */}
      <rect x="356" y="92" width="88" height="64" rx="14" />
      <circle cx="430" cy="124" r="5" fill="#2ec4c4" stroke="none" />
      {/* sparks in the gap */}
      <path d="M474 98 l-13 -18" />
      <path d="M498 90 v-20" />
      <path d="M522 98 l13 -18" />
      <path d="M470 142 l-17 14" />
      <path d="M526 142 l17 14" />
      {/* right connector */}
      <path d="M556 110 h-34" />
      <path d="M556 140 h-34" />
      <rect x="556" y="92" width="88" height="64" rx="14" />
      {/* right cable */}
      <path d="M644 124 C 706 124, 720 152, 782 148 C 850 143, 812 70, 884 78 C 952 86, 936 148, 1008 138" />
    </g>
  </svg>
);

const MaintenanceScreen = () => (
  <div className="maint">
    <div className="maint-inner">
      <img className="maint-logo" src="/images/user/tmlogo 1.webp" alt="A Visa Experts" width={151} height={103} />

      <h1>We&rsquo;re offline!</h1>

      <OfflineArt />

      <p className="maint-text">
        Unfortunately the website is down for a bit of maintenance right now. We will be online as soon as possible.
        Please check again in a little while. Thank you!
      </p>

      <p className="maint-contact">
        Need urgent help? Call <a href="tel:+911204502750">+91 120-4502750</a> or email{' '}
        <a href="mailto:info@avisaexperts.com">info@avisaexperts.com</a>.
      </p>
    </div>
  </div>
);

/**
 * When maintenance mode is enabled the whole website shows only the maintenance
 * page. The staff/admin area (/agent/*) is deliberately left accessible so the
 * team can still sign in.
 */
const MaintenanceGate = ({ children }) => {
  const { pathname } = useLocation();
  const isStaffArea = pathname.startsWith('/agent');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isStaffArea) return undefined;
    let cancelled = false;
    api
      .get('/settings/maintenance')
      .then((res) => {
        if (!cancelled) setEnabled(!!res.data?.data?.enabled);
      })
      .catch(() => {
        // fail open - never take the site down because the API hiccuped
      });
    return () => {
      cancelled = true;
    };
  }, [isStaffArea]);

  if (!isStaffArea && enabled) return <MaintenanceScreen />;
  return children;
};

export default MaintenanceGate;
