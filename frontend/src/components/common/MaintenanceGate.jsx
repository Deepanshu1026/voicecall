import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/maintenance.css';

const PHONE = '+91 120-4502750';
const WHATSAPP_LINK = 'https://wa.me/919711000022';
const EMAIL = 'info@avisaexperts.com';

const MaintenanceScreen = () => (
  <div className="maint">
    <div className="maint-card">
      <p className="maint-brand">A Visa Experts</p>

      <div className="maint-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </div>

      <h1>We&rsquo;re upgrading our website</h1>
      <p className="maint-text">
        We&rsquo;re making a few improvements behind the scenes and will be back very soon. Thank you for your
        patience.
      </p>

      <div className="maint-progress" aria-hidden="true">
        <span />
      </div>

      <div className="maint-actions">
        <a className="maint-btn primary" href="tel:+911204502750">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Call {PHONE}
        </a>

        <a className="maint-btn ghost" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.5-5.9c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.5.1-.6.7-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.3-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c2 .8 2.4.7 2.9.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.5-.4Z" />
          </svg>
          WhatsApp
        </a>

        <a className="maint-btn ghost" href={`mailto:${EMAIL}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
            <path d="m3.5 7.5 8.5 6 8.5-6" />
          </svg>
          Email us
        </a>
      </div>

      <p className="maint-hours">
        Mon&ndash;Sat, 10:00&ndash;18:00 IST &middot; Noida &middot; Ahmedabad &middot; New York &middot; Florida
        &middot; Seattle &middot; London
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
