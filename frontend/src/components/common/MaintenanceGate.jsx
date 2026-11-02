import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/maintenance.css';

const MaintenanceScreen = () => (
  <div className="maint">
    <div className="maint-card">
      <img className="maint-logo" src="/images/user/tmlogo 1.webp" alt="A Visa Experts" width={151} height={103} />
      <h1>We&rsquo;ll be back shortly</h1>
      <p>
        Our website is temporarily down for scheduled maintenance. We are working to bring it back as quickly as
        possible.
      </p>
      <p className="maint-contact">
        Need help right now? Call <a href="tel:+911204502750">+91 120-4502750</a> or email{' '}
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
