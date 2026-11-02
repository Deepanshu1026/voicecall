import '../../styles/maintenance.css';

export const metadata = {
  title: 'A Visa Experts — Temporarily Unavailable',
  description: 'This site is temporarily unavailable while we carry out scheduled maintenance.',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="maint">
      <header className="maint-header">
        <span className="maint-logo">
          <span className="go">Go</span>
          <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 21s-7.5-4.7-9.3-9A5.3 5.3 0 0 1 12 6.4 5.3 5.3 0 0 1 21.3 12c-1.8 4.3-9.3 9-9.3 9z"
            />
          </svg>
          <span className="daddy">Daddy</span>
        </span>
      </header>

      <section className="maint-body">
        <h1>This site is temporarily unavailable</h1>
        <p className="maint-text">
          A Visa Experts is carrying out scheduled maintenance and will be back shortly. Thank you for your patience.
        </p>
        <p className="maint-help">
          Need urgent help? Call <a href="tel:+911204502750">+91 120-4502750</a> or email{' '}
          <a href="mailto:info@avisaexperts.com">info@avisaexperts.com</a>.
        </p>
      </section>

      <footer className="maint-footer">
        Mon&ndash;Sat, 10:00&ndash;18:00 IST &middot; Noida &middot; Ahmedabad &middot; New York &middot; Florida
        &middot; Seattle &middot; London
      </footer>
    </main>
  );
}
