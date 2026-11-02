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
        <img
          className="maint-logo"
          src="/images/user/godaddy-logo.svg"
          alt="GoDaddy"
          width={166}
          height={34}
        />
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
