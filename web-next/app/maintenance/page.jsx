import '../../styles/maintenance.css';

export const metadata = {
  title: 'A Visa Experts — Back Shortly',
  description: 'Our website is temporarily down for scheduled maintenance.',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="maint">
      <div className="maint-card">
        <img
          className="maint-logo"
          src="/images/user/tmlogo%201.webp"
          alt="A Visa Experts"
          width={151}
          height={103}
        />
        <h1>We&rsquo;ll be back shortly</h1>
        <p>
          Our website is temporarily down for scheduled maintenance. We are working to bring it back as quickly as
          possible.
        </p>
        <p className="maint-contact">
          Need help right now? Call{' '}
          <a href="tel:+911204502750">+91 120-4502750</a> or email{' '}
          <a href="mailto:info@avisaexperts.com">info@avisaexperts.com</a>.
        </p>
      </div>
    </main>
  );
}
