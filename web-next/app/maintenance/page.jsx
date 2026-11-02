import '../../styles/maintenance.css';

export const metadata = {
  title: 'A Visa Experts — Back Shortly',
  description: 'Our website is temporarily down for scheduled maintenance.',
  robots: { index: false, follow: false },
};

const PHONE = '+91 120-4502750';
const PHONE_TEL = '+911204502750';
const WHATSAPP = '+91 9711000022';
const WHATSAPP_LINK = 'https://wa.me/919711000022';
const EMAIL = 'info@avisaexperts.com';

export default function MaintenancePage() {
  return (
    <main className="maint">
      <span className="maint-glow maint-glow-a" aria-hidden="true" />
      <span className="maint-glow maint-glow-b" aria-hidden="true" />

      <div className="maint-card">
        <img
          className="maint-logo"
          src="/images/user/tmlogo%201.webp"
          alt="A Visa Experts"
          width={151}
          height={103}
        />

        <span className="maint-pill">Scheduled maintenance</span>

        <h1>We&rsquo;ll be back shortly</h1>
        <p className="maint-lead">
          Our website is temporarily unavailable while we carry out scheduled maintenance. We are working to bring it
          back as quickly as possible &mdash; thank you for your patience.
        </p>

        <div className="maint-actions">
          <a className="maint-btn primary" href={`tel:${PHONE_TEL}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
              />
            </svg>
            Call {PHONE}
          </a>

          <a className="maint-btn ghost" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.5-5.9c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.5.1-.6.7-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.3-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c2 .8 2.4.7 2.9.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.5-.4Z"
              />
            </svg>
            WhatsApp
          </a>

          <a className="maint-btn ghost" href={`mailto:${EMAIL}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="m3.5 7.5 8.5 6 8.5-6" />
            </svg>
            Email us
          </a>
        </div>

        <p className="maint-hours">
          Mon&ndash;Sat, 10:00&ndash;18:00 IST &middot; Noida &middot; Ahmedabad &middot; New York &middot; Florida
          &middot; Seattle &middot; London
        </p>
      </div>
    </main>
  );
}
