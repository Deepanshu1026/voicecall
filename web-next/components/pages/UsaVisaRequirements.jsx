import Link from 'next/link';
import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const eligibility = [
  'A genuine temporary purpose of travel',
  'A clear reason for visiting the USA',
  'The ability to support your planned trip',
  'Strong personal, professional, or financial circumstances in India',
  'An intention to follow the conditions of your visa',
  'Accurate information throughout your application',
];

const passport = [
  'Your passport is valid',
  'Your personal information is accurate',
  'Your passport details match the information entered in your application',
  'You have sufficient blank pages where required',
  'You carry the required passport and application documents to your appointment',
];

const documents = [
  'Valid passport',
  'DS-160 confirmation page',
  'Visa appointment confirmation',
  'Visa fee payment information',
  'Previous US visas, if applicable',
  'Previous passports, where relevant',
  'Employment or business documents',
  'Financial documents',
  'Supporting documents related to your purpose of travel',
];

const financial = [
  'Recent bank statements',
  'Salary slips',
  'Income-tax documents',
  'Employment records',
  'Business financial records',
  'Other relevant evidence of income or funds',
];

const employment = [
  'Employment letter',
  'Recent salary slips',
  'Approved leave information',
  'Bank statements showing salary',
  'Income-tax documents',
  'Company identification or employment records',
];

const selfEmployed = [
  'Business registration documents',
  'Business bank statements',
  'Income-tax records',
  'Business financial statements',
  'Proof of ongoing business activities',
];

const b1b2 = [
  'Purpose of travel',
  'Intended length of stay',
  'Travel plans',
  'Financial arrangements',
  'Employment or business situation',
  'Circumstances in India',
];

const tourist = [
  'Why you want to visit the USA',
  'Where you plan to travel',
  'How long you expect to stay',
  'How the trip will be funded',
  'Your circumstances in India',
];

const ds160 = [
  'Personal details',
  'Passport information',
  'Travel plans',
  'Employment',
  'Education',
  'Family information',
  'Previous US travel or visa information, where applicable',
];

const interview = [
  'Your reason for travelling',
  'Your employment',
  'Your family',
  'Your finances',
  'Your travel plans',
  'Your previous international travel',
  'Your intended stay in the USA',
];

const mistakes = [
  'Providing incorrect information',
  'Giving inconsistent information across documents',
  'Submitting irrelevant documents',
  'Failing to check passport details',
  'Making mistakes in the DS-160',
  'Giving unclear answers during the interview',
  'Providing false or misleading information',
];

const checklist = [
  { group: 'Basic documents', items: ['Valid passport', 'DS-160 confirmation', 'Appointment confirmation', 'Visa fee payment information'] },
  { group: 'Supporting documents', items: ['Employment documents', 'Financial documents', 'Business documents, if applicable', 'Travel-related information', 'Previous visa documents, if applicable'] },
  { group: 'Application preparation', items: ['Check your visa category', 'Review your DS-160 information', 'Prepare for the interview', 'Keep documents organized'] },
];

const faqs = [
  {
    q: 'What are the basic requirements for a USA visa from India?',
    a: 'Applicants generally need a valid passport, the appropriate visa application, required fee payment, and supporting information and documents relevant to their circumstances.',
  },
  {
    q: 'How much money is required for a USA tourist visa?',
    a: 'There is no universal fixed bank balance that guarantees approval. Your financial circumstances should be reasonable for your proposed trip.',
  },
  {
    q: 'Is a bank statement required for a USA visa?',
    a: 'Financial evidence may be relevant depending on your circumstances. Applicants should provide genuine documents that accurately represent their financial situation.',
  },
  {
    q: 'Is an invitation letter mandatory for a USA tourist visa?',
    a: 'An invitation letter is not universally required for every tourist visa applicant. Requirements depend on the applicant’s circumstances and purpose of travel.',
  },
  {
    q: 'Does having all required documents guarantee a USA visa?',
    a: 'No. Documents are only one part of the application. Approval depends on the overall circumstances and applicable visa requirements.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'USA Visa Requirements for Indians',
  description:
    'USA visa requirements for Indian applicants — eligibility, passport and documents, financial and employment proof, DS-160, photo, interview and appointment requirements.',
  author: { '@type': 'Organization', name: 'A Visa Experts', url: 'https://avisaexperts.com' },
  publisher: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    logo: { '@type': 'ImageObject', url: 'https://avisaexperts.com/images/user/tmlogo%201.webp' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://avisaexperts.com/usa-visa/requirements' },
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
    {
      '@type': 'ListItem',
      position: 3,
      name: 'USA Visa Requirements',
      item: 'https://avisaexperts.com/usa-visa/requirements',
    },
  ],
};

const UsaVisaRequirements = () => (
  <LandingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

    <div className="spage">
      <section className="spage-hero hero-usa">
        <div className="spage-hero-inner">
          <h1>USA Visa Requirements for Indians</h1>
          <p>
            Applying for a US visa from India requires you to meet certain eligibility conditions and provide information
            that supports your purpose of travel. The requirements can vary depending on the visa category, your reason
            for visiting the United States, and your individual circumstances.
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
            If you are planning to visit the USA temporarily for tourism, visiting family or friends, or certain
            business activities, understanding the required documents and eligibility conditions can help you prepare
            your application correctly.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Who Needs a Visa to Visit the USA?</h2>
          <p>
            Indian citizens generally need a valid US visa to travel to the United States unless they qualify for another
            applicable entry arrangement.
          </p>
          <p>
            The visa category you need depends on the purpose of your trip. For example, tourism and certain business
            visits generally fall under the visitor visa category. For a broader overview of visitor visas, see our{' '}
            <Link className="spage-link" href="/usa-visa">
              USA Visitor Visa page
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Eligibility Requirements</h2>
          <p>
            Before applying, applicants should be able to clearly establish the purpose of their intended trip and
            provide truthful and consistent information. Depending on the visa category, you may need to demonstrate:
          </p>
          <ul className="spage-list">
            {eligibility.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="spage-subnote">Meeting these basic requirements does not automatically guarantee visa approval.</p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Passport Requirements for a USA Visa</h2>
          <p>A valid passport is one of the most important documents required for a US visa application. Before applying, check that:</p>
          <ul className="spage-list">
            {passport.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            Always check the latest official requirements applicable to your particular visa category before travelling.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Documents Required for a USA Visa</h2>
          <p>The documents you need can depend on your visa category and personal circumstances. Common documents may include:</p>
          <ul className="spage-list">
            {documents.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            For a more detailed document-by-document list, visit our{' '}
            <Link className="spage-link" href="/blog/usa-visa-document-checklist">
              USA Visa Document Checklist
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Financial Requirements for a USA Visa</h2>
          <p>
            Applicants may need to demonstrate that their financial circumstances are consistent with their planned
            travel. Depending on your situation, you may provide:
          </p>
          <ul className="spage-list">
            {financial.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            There is no single fixed bank balance that guarantees a US visa. Your financial information is considered
            together with your travel plans and overall circumstances.
          </p>
          <p>
            For current application charges, see our{' '}
            <Link className="spage-link" href="/usa-visa/fees">
              USA Visa Fees page
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Employment Requirements for a USA Visa</h2>
          <p>
            If you are employed in India, documents showing your current employment may help explain your professional
            circumstances. Depending on your situation, these may include:
          </p>
          <ul className="spage-list">
            {employment.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            The documents should be genuine and consistent with the information provided in your visa application.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Requirements for Self-Employed Applicants</h2>
          <p>
            Self-employed applicants may need documents that demonstrate their ongoing business activities and financial
            circumstances. These may include:
          </p>
          <ul className="spage-list">
            {selfEmployed.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="spage-subnote">Only provide documents that are relevant to your actual circumstances.</p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>B1/B2 Visa Requirements</h2>
          <p>
            The B1/B2 visa covers temporary business and tourism-related visits to the United States. Applicants should
            be prepared to explain their:
          </p>
          <ul className="spage-list">
            {b1b2.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            For complete information about this visa category, visit our{' '}
            <Link className="spage-link" href="/usa-visa/usa-b1b2-visa">
              USA B1/B2 Visa Guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Tourist Visa Requirements</h2>
          <p>
            If your main purpose is tourism, sightseeing, vacation, or visiting family and friends, you should understand
            the requirements applicable to a visitor visa for tourism. Your application should clearly explain:
          </p>
          <ul className="spage-list">
            {tourist.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Read our dedicated{' '}
            <Link className="spage-link" href="/blog/usa-tourist-visa">
              USA Tourist Visa Guide
            </Link>{' '}
            for more information.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>DS-160 Requirements</h2>
          <p>
            The DS-160 is an important part of the nonimmigrant visa application process. Applicants need to provide
            accurate information about areas such as:
          </p>
          <ul className="spage-list">
            {ds160.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Errors or inconsistencies in the information submitted can create problems during the application process.
            Read our detailed{' '}
            <Link className="spage-link" href="/blog/ds-160-guide-a-simple-guide-for-usa-visa-applicants">
              DS-160 Guide
            </Link>{' '}
            before completing the form.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Photo Requirements</h2>
          <p>
            Applicants should follow the applicable US visa photograph requirements when a photograph is required as
            part of their application.
          </p>
          <p>
            The photograph must meet the specified requirements for size, appearance, background, and other technical
            conditions.
          </p>
          <p className="spage-subnote">
            Always check the current official photograph specifications before submitting your application.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Interview Requirements</h2>
          <p>
            Applicants may be required to attend a visa interview as part of the application process. During the
            interview, you may be asked about:
          </p>
          <ul className="spage-list">
            {interview.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Your answers should be truthful, clear, and consistent with your application. Prepare with our{' '}
            <Link
              className="spage-link"
              href="/blog/usa-visitor-visa-interview-questions-for-indians-complete-guide-2025"
            >
              USA Visa Interview Questions &amp; Answers guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Appointment Requirements</h2>
          <p>
            After completing the required application steps, applicants need to follow the applicable appointment
            process. Keep your relevant documents and confirmation details ready for your appointment.
          </p>
          <p>
            For a step-by-step explanation, visit our{' '}
            <Link className="spage-link" href="/usa-visa/appointment">
              USA Visa Appointment Guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Common USA Visa Requirement Mistakes</h2>
          <p>Applicants should avoid common mistakes such as:</p>
          <ul className="spage-list">
            {mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="spage-subnote">Carefully review your application before submission.</p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Requirements Checklist</h2>
          <p>Before proceeding with your application, review the following:</p>
          {checklist.map((section) => (
            <div key={section.group}>
              <h3>{section.group}</h3>
              <ul className="spage-checklist">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="spage-mt-16">
            For the detailed document list, visit our{' '}
            <Link className="spage-link" href="/blog/usa-visa-document-checklist">
              USA Visa Document Checklist
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How Long Does the USA Visa Process Take?</h2>
          <p>
            The time involved in getting a US visa can vary depending on the visa category, appointment availability,
            processing requirements, and individual circumstances.
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
          <h2>What Happens If a USA Visa Is Refused?</h2>
          <p>
            Having the required documents does not guarantee approval. A visa application can be refused depending on the
            applicant&rsquo;s circumstances and applicable US immigration rules.
          </p>
          <p>
            If your application has been refused, understanding the possible reasons can help you identify areas that may
            need attention. Read our guide to{' '}
            <Link className="spage-link" href="/usa-visa/rejection-reasons">
              USA Visa Rejection Reasons
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Frequently Asked Questions About USA Visa Requirements</h2>
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
          <h2>Get Help With Your USA Visa Application</h2>
          <p>
            Preparing the right information and supporting documents can make the application process easier to
            understand. If you need assistance with your USA visa application, contact A Visa Experts for guidance.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book an Appointment
            </a>
            <a className="spage-btn dark" href="/consultants">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  </LandingLayout>
);

export default UsaVisaRequirements;
