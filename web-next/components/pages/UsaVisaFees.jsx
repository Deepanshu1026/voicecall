import Link from 'next/link';
import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const feeCovers = [
  'Travel expenses',
  'Document preparation costs',
  'Photograph costs',
  'Translation or other professional services',
  'Travel to the visa appointment location',
  'Other applicable charges',
];

const visaCategories = [
  'B1/B2 Visitor Visa',
  'B1 Business Visa',
  'B2 Tourist Visa',
  'Student and exchange visitor visas',
  'Work-related visa categories',
  'Other nonimmigrant visa categories',
];

const paymentMistakes = [
  'Select the correct visa category',
  'Enter your personal information accurately',
  'Use the correct passport details',
  'Follow the current payment instructions',
  'Keep your payment confirmation',
  'Avoid making duplicate payments unless instructed',
  'Check the latest official fee information',
];

const faqs = [
  {
    q: 'How much is the USA visa fee?',
    a: 'The applicable fee depends on the visa category. Applicants should check the latest official fee schedule before making a payment.',
  },
  {
    q: 'Is the USA visa fee refundable?',
    a: 'Visa application fees are generally non-refundable. Applicants should verify the current rules before making a payment.',
  },
  {
    q: 'Do I have to pay the USA visa fee before the appointment?',
    a: 'Applicants generally need to complete the applicable fee payment before proceeding with appointment scheduling.',
  },
  {
    q: 'Does the visa fee guarantee approval?',
    a: 'No. Payment of the visa fee does not guarantee visa approval.',
  },
  {
    q: 'Can the USA visa fee change?',
    a: 'Yes. Visa fees and payment procedures can change. Always verify the latest applicable information before payment.',
  },
  {
    q: 'Is the USA visa fee the same for every visa?',
    a: 'No. Different visa categories can have different fee structures.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'USA Visa Fees for Indian Applicants',
  description:
    'Understanding USA visa fees for Indian applicants — the visa application (MRV) fee, what the fee covers, refund rules, payment steps and fee categories.',
  author: { '@type': 'Organization', name: 'A Visa Experts', url: 'https://avisaexperts.com' },
  publisher: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    logo: { '@type': 'ImageObject', url: 'https://avisaexperts.com/images/user/tmlogo%201.webp' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://avisaexperts.com/usa-visa/fees' },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avisaexperts.com/' },
    { '@type': 'ListItem', position: 2, name: 'USA Visa', item: 'https://avisaexperts.com/usa-visa' },
    { '@type': 'ListItem', position: 3, name: 'USA Visa Fees', item: 'https://avisaexperts.com/usa-visa/fees' },
  ],
};

const UsaVisaFees = () => (
  <LandingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

    <div className="spage">
      <section className="spage-hero hero-usa">
        <div className="spage-hero-inner">
          <h1>USA Visa Fees for Indian Applicants</h1>
          <p>
            Understanding the USA visa fees is an important part of planning your US visa application from India. The fee
            you need to pay depends on the visa category you are applying for and the type of service or application
            involved.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book an Appointment
            </a>
            <a className="spage-btn dark" href="/consultants">
              Talk to a Consultant
            </a>
          </div>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <p>
            The visa application fee is generally required before proceeding with the applicable appointment process.
            Applicants should always check the latest official fee information before making a payment because fees and
            payment rules can change.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Application Fee</h2>
          <p>
            The US visa application fee is also known as the <strong>Machine Readable Visa (MRV) fee</strong> for many
            nonimmigrant visa categories.
          </p>
          <p>
            For common visitor visa categories such as B1, B2 and B1/B2, applicants need to pay the applicable visa
            application fee before completing the appointment process.
          </p>
          <p>
            The amount can vary depending on the visa category. Make sure you select the correct visa category before
            making your payment.
          </p>
          <p>
            For information about which visa category may apply to your trip, see our{' '}
            <Link className="spage-link" href="/usa-visa">
              USA Visitor Visa page
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA B1/B2 Visa Fees</h2>
          <p>
            The B1/B2 visa is commonly used for temporary business and tourism-related travel to the United States.
          </p>
          <p>
            The applicable visa fee must be paid according to the current fee schedule for the visa category.
          </p>
          <p>
            For more information about the B1/B2 category, visit our{' '}
            <Link className="spage-link" href="/usa-visa/usa-b1b2-visa">
              USA B1/B2 Visa Guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Tourist Visa Fees</h2>
          <p>
            Applicants travelling to the USA for tourism, vacation, sightseeing, or visiting family and friends
            generally apply under the appropriate visitor visa category.
          </p>
          <p>
            The applicable visa fee depends on the visa category and the current US government fee schedule.
          </p>
          <p>
            You can learn more about the visa category through our{' '}
            <Link className="spage-link" href="/blog/usa-tourist-visa">
              USA Tourist Visa Guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What Does the USA Visa Fee Cover?</h2>
          <p>
            The visa application fee is associated with processing your visa application. However, paying the visa
            application fee does not mean that your visa is guaranteed to be approved.
          </p>
          <p>The fee also does not necessarily cover other expenses you may have during the application process, such as:</p>
          <ul className="spage-list">
            {feeCovers.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Is the USA Visa Fee Refundable?</h2>
          <p>
            Visa application fees are generally non-refundable, even if your application is refused or you decide not to
            continue with the application.
          </p>
          <p>Before making the payment, carefully check your visa category and the applicable fee requirements.</p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Fee Payment</h2>
          <p>
            Applicants should follow the current payment instructions provided through the official US visa application
            process in India.
          </p>
          <p>
            After completing the payment, keep your payment receipt or confirmation information safely. You may need the
            payment information while scheduling or managing your visa appointment.
          </p>
          <p>
            For more information about the appointment process, read our{' '}
            <Link className="spage-link" href="/usa-visa/appointment">
              USA Visa Appointment Guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Fee and Exchange Rate</h2>
          <p>
            US visa fees are set according to the applicable US government fee schedule, while the amount payable in
            India may be affected by the applicable exchange-rate or payment arrangements.
          </p>
          <p>
            Because exchange rates and official fee schedules can change, applicants should verify the current amount
            before making a payment.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Are There Any Additional USA Visa Fees?</h2>
          <p>
            Depending on your visa category, nationality, circumstances, or applicable US government rules, additional
            fees may apply in some cases.
          </p>
          <p>
            Applicants should check the latest official information for their specific visa category before making
            travel or payment arrangements.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Fee for Different Visa Categories</h2>
          <p>The applicable fee depends on the visa category. Common categories include:</p>
          <ul className="spage-list">
            {visaCategories.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="spage-mt-16">The fee structure is not the same for every US visa category.</p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Fee Payment Mistakes to Avoid</h2>
          <p>Before paying your visa fee, make sure you:</p>
          <ul className="spage-list">
            {paymentMistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="spage-mt-16">Incorrect information or payment issues may create unnecessary delays.</p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Fee and Appointment</h2>
          <p>
            After paying the applicable visa fee, applicants may need to proceed with the appointment scheduling process
            according to the current US visa procedure in India.
          </p>
          <p>Keep your payment confirmation available when managing your appointment.</p>
          <p>
            For a detailed explanation, visit our{' '}
            <Link className="spage-link" href="/usa-visa/appointment">
              USA Visa Appointment Guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Fee and Required Documents</h2>
          <p>
            Paying the visa fee is only one part of the application process. Applicants should also prepare the documents
            relevant to their visa category and circumstances.
          </p>
          <p>
            For a detailed list of supporting documents, see our{' '}
            <Link className="spage-link" href="/blog/usa-visa-document-checklist">
              USA Visa Document Checklist
            </Link>
            .
          </p>
          <p>
            You should also complete the required DS-160 accurately. Read our{' '}
            <Link className="spage-link" href="/blog/ds-160-guide-a-simple-guide-for-usa-visa-applicants">
              DS-160 Guide
            </Link>{' '}
            for more information.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Does Paying the USA Visa Fee Guarantee Approval?</h2>
          <p>No. Paying the visa application fee does not guarantee visa approval.</p>
          <p>
            The fee is paid for processing the visa application. The final decision depends on the applicant&rsquo;s
            circumstances and applicable US immigration requirements.
          </p>
          <p>Make sure the information in your application and supporting documents is accurate and consistent.</p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Fees and Processing Time</h2>
          <p>
            The visa fee and processing time are separate aspects of the application process. Paying the fee does not
            guarantee a specific processing timeline.
          </p>
          <p>
            Processing time can depend on factors such as visa category, appointment availability, administrative
            processing, and individual circumstances.
          </p>
          <p>
            For more information, read our{' '}
            <Link className="spage-link" href="/usa-visa/processing-time">
              USA Visa Processing Time guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Important Terms and Conditions</h2>
          <p>
            Before using visa assistance or related services, applicants should understand the applicable service terms,
            payment conditions, cancellation rules, refund policy, and other conditions.
          </p>
          <p>
            Read the <strong>Terms &amp; Conditions</strong> before purchasing or using any A Visa Experts service. The
            Terms &amp; Conditions explain the conditions applicable to services provided by A Visa Experts and should
            be reviewed before making a service payment.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Frequently Asked Questions About USA Visa Fees</h2>
          <div className="spage-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="spage-cta">
        <div className="spage-wrap">
          <h2>Need Help With Your USA Visa Application?</h2>
          <p>
            Understanding the applicable fees and payment requirements can help you prepare for your visa application.
            If you need assistance with your USA visa application, contact A Visa Experts for guidance.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book an Appointment
            </a>
            <a className="spage-btn dark" href="/usa-visa">
              Back to USA Visa
            </a>
          </div>
        </div>
      </section>
    </div>
  </LandingLayout>
);

export default UsaVisaFees;
