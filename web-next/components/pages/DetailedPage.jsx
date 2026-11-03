import LandingLayout from '../LandingLayout';
import '../../styles/detailedPage.css';

const REPO = 'https://github.com/Deepanshu1026/voicecall';
const LIVE = 'https://avisaexperts.com';
const API = 'https://voicecall-6ylg.onrender.com/api';

const facts = [
  { label: 'Repository', value: 'Deepanshu1026/voicecall', meta: 'branch: main' },
  { label: 'Live site', value: 'avisaexperts.com', meta: 'Vercel · voicecall (Vite)' },
  { label: 'Marketing site', value: 'avisaexperts-next', meta: 'Next.js 14' },
  { label: 'API + database', value: 'voicecall-api', meta: 'Render · MongoDB Atlas' },
];

const toc = [
  ['glance', 'At a glance'],
  ['apps', 'Applications'],
  ['flow', 'Request flow'],
  ['routing', 'Routing rules'],
  ['api', 'Backend & API'],
  ['seo', 'SEO infrastructure'],
  ['maintenance', 'Maintenance mode'],
  ['local', 'Run it locally'],
  ['deploy', 'Deploy a change'],
  ['conventions', 'Conventions'],
  ['contact', 'Questions'],
];

const glance = [
  ['Project', 'A Visa Experts — marketing site, web app, admin portal, chat and mobile app'],
  ['Repository', 'github.com/Deepanshu1026/voicecall'],
  ['Default branch', 'main'],
  ['Live domain', 'avisaexperts.com — served by the Vercel project voicecall'],
  ['Marketing site', 'avisaexperts-next.vercel.app — Vercel project avisaexperts-next'],
  ['Backend API', 'voicecall-6ylg.onrender.com — Render service voicecall-api'],
  ['Database', 'MongoDB Atlas — connection string in backend/.env (never committed)'],
];

const apps = [
  {
    name: 'frontend/',
    tag: 'Owns the domain',
    tone: 'blue',
    what: 'Main web app (SPA) — chat, agent & admin dashboards, auth, booking flow.',
    tech: 'React 18 + Vite, React Router, Tailwind, Socket.IO client',
    host: 'Vercel — project voicecall (avisaexperts.com)',
    deploy: 'Auto on git push',
  },
  {
    name: 'web-next/',
    tag: 'Manual deploy',
    tone: 'amber',
    what: 'Marketing & SEO pages — home, services, visa guides, blogs, contact.',
    tech: 'Next.js 14 App Router, server components, ISR, middleware',
    host: 'Vercel — project avisaexperts-next',
    deploy: 'Manual Vercel CLI from web-next/',
  },
  {
    name: 'backend/',
    tag: 'Auto deploy',
    tone: 'green',
    what: 'REST API + Socket.IO realtime server, all business logic.',
    tech: 'Node.js, Express, Mongoose (MongoDB), JWT, Socket.IO',
    host: 'Render — web service voicecall-api (rootDir: backend)',
    deploy: 'Auto on git push',
  },
  {
    name: 'avisaexperts/',
    tag: 'Manual release',
    tone: 'violet',
    what: 'Android / Flutter mobile app.',
    tech: 'Flutter',
    host: 'Google Play',
    deploy: 'Build & upload the AAB by hand',
  },
  {
    name: 'avisaexperts17july/',
    tag: 'Not deployed',
    tone: 'grey',
    what: 'Legacy PHP site — kept for reference only.',
    tech: 'PHP',
    host: '—',
    deploy: '—',
  },
];

const flow = [
  ['Browser hits avisaexperts.com', 'The Vercel project voicecall serves it (Vite SPA + vercel.json routes).'],
  ['Marketing path — /, /services, /blog/…, /uk-visa/…', 'Rewritten to avisaexperts-next.vercel.app (Next.js).'],
  ['App path — /login, /agent/…, /chat, /book-appointment', 'Serves the SPA index.html; React Router takes over.'],
  ['Unknown path', 'Returns 404 — there is an explicit allowlist, not a catch-all fallback.'],
  ['Legacy .php URLs', '301-redirected to their modern equivalents.'],
  ['API calls', 'The frontend calls the Render API at /api/* over HTTPS (CORS allow-listed).'],
];

const routing = [
  ['Marketing routes', 'Rewritten to the Next deployment (Option B: routes + dest in frontend/vercel.json).'],
  ['SPA routes', 'Explicit allowlist (/login, /agent/dashboard/…, /chat, /user/…, /book-appointment) → index.html.'],
  ['Junk query params', 'Next middleware 301s ?utm_*, ?fbclid, ?o=, ?c=, ?l= … to the clean URL.'],
  ['Homepage params', 'Any query string on / is 301-redirected to /.'],
  ['Legacy .php', 'index.php, service.php, transitvsa.php, blog_pages/* … 301 to current pages.'],
  ['Sensitive files', '.env, .git, *.sql, wp-config.*, config.php … return 404 via vercel.json.'],
  ['Maintenance mode', 'When on, Next middleware rewrites every page to /maintenance.'],
];

const backendAreas = [
  ['Auth', '/api/auth (users), /api/employees (staff & admin) — JWT access + refresh tokens'],
  ['Blog / posts', '/api/app/posts (+ /view click tracking), /api/admin/blogs (CRUD)'],
  ['Chat & calls', '/api/chat, /api/calls — Socket.IO for realtime'],
  ['Agents & applications', '/api/agent-portal, /api/applications'],
  ['Settings', '/api/settings — contact details, chat limits, maintenance switch'],
  ['Admin', '/api/admin/* — employee role "admin" required'],
];

const seo = [
  ['Sitemap', '/sitemap.xml — a Next route generating static pages + all published blog posts + images'],
  ['Robots', '/robots.txt — allows crawling, disallows app routes, points at the sitemap'],
  ['Canonicals', 'Every page sets a canonical; blog posts self-canonicalise'],
  ['Structured data', 'Organization, WebSite, LocalBusiness, BreadcrumbList, FAQPage, BlogPosting JSON-LD'],
  ['Verification', 'Bing msvalidate.01 in the Next layout and the Vite index.html'],
  ['Analytics', 'GA4 (G-TDW4SCLJRV) with manual page_view on both apps'],
];

const maintenance = [
  ['Flag', 'A single Setting document (key: maintenance) in MongoDB'],
  ['Toggle', 'Admin sidebar → Maintenance Mode (on/off, admin only)'],
  ['Enforcement', 'Next middleware for all marketing pages + a React gate in the SPA'],
  ['Exemption', 'The staff area /agent/* stays reachable so the team can sign in'],
  ['Fail-safe', 'If the API is unreachable the site stays UP (fails open)'],
];

const devSteps = [
  ['backend/', 'npm install → npm run dev   (needs backend/.env)'],
  ['frontend/', 'npm install → npm run dev   (Vite dev server)'],
  ['web-next/', 'npm install → npm run build → npm start'],
  ['avisaexperts/', 'flutter pub get → flutter run'],
];

const deploySteps = [
  ['frontend/', 'git push to main — Vercel builds the voicecall project automatically.', 'auto'],
  ['backend/', 'git push to main — Render redeploys voicecall-api automatically.', 'auto'],
  ['web-next/', 'From web-next/: vercel --prod (the project is not git-connected).', 'manual'],
  ['Database', 'MongoDB Atlas — schema is managed by the Mongoose models in backend/src/models.', 'manual'],
];

const conventions = [
  ['Never commit secrets', 'backend/.env, tokens and API keys stay out of the repo.', 'warn'],
  ['Brand rules', 'No "study" or "work" visa content; the brand is written "A Visa Experts".', 'info'],
  ['Slug changes', 'If a blog slug changes, add a 301 for the old slug in frontend/vercel.json.', 'warn'],
  ['Two Vercel projects', 'Deploy Next only from web-next/ — the root project is the Vite app.', 'warn'],
  ['Public vs internal', 'Marketing pages are indexed; /detailed-page itself is noindex.', 'info'],
];

const Table = ({ head, rows }) => (
  <div className="dpage-table-wrap">
    <table className="dpage-table">
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]}>
            {row.map((cell, i) => (
              <td key={`${row[0]}-${i}`} className={i === 0 ? 'dpage-mono' : undefined}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Section = ({ id, num, title, children }) => (
  <section className="dpage-section" id={id}>
    <h2>
      {num && <span className="dpage-num">{num}</span>}
      {title}
    </h2>
    {children}
  </section>
);

const DetailedPage = () => (
  <LandingLayout>
    <div className="dpage">
      <section className="dpage-hero">
        <div className="dpage-wrap">
          <span className="dpage-badge">Developer &amp; DevOps reference</span>
          <h1>Detailed Page</h1>
          <p>
            Everything a new developer or DevOps engineer needs for the A Visa Experts platform — what each app is,
            where it is deployed, how requests are routed, how the API and database fit together, and how to ship a
            change.
          </p>
          <div className="dpage-hero-links">
            <a className="dpage-link solid" href={REPO} target="_blank" rel="noopener noreferrer">
              GitHub repository
            </a>
            <a className="dpage-link" href={LIVE} target="_blank" rel="noopener noreferrer">
              Live site
            </a>
            <a className="dpage-link" href={`${API}/settings/maintenance`} target="_blank" rel="noopener noreferrer">
              API health
            </a>
          </div>
        </div>
      </section>

      {/* Key facts strip */}
      <div className="dpage-wrap dpage-facts-wrap">
        <div className="dpage-facts">
          {facts.map((f) => (
            <div className="dpage-fact" key={f.label}>
              <span className="dpage-fact-label">{f.label}</span>
              <span className="dpage-fact-value">{f.value}</span>
              <span className="dpage-fact-meta">{f.meta}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dpage-wrap dpage-layout">
        {/* Sticky navigation */}
        <aside className="dpage-toc">
          <p className="dpage-toc-title">On this page</p>
          <nav>
            {toc.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="dpage-content">
          {/* TL;DR */}
          <div className="dpage-callout tldr">
            <h3>Read this first — the 5 things that matter</h3>
            <ol>
              <li>
                <strong>Marketing pages deploy manually.</strong> A <code>git push</code> alone does not update the
                Next site — run the Vercel CLI from <code>web-next/</code>.
              </li>
              <li>
                <strong>The Vite app is the front door.</strong> <code>frontend/vercel.json</code> decides which
                requests go to Next, to the SPA, or to a 404.
              </li>
              <li>
                <strong>Backend and web app auto-deploy</strong> on push to <code>main</code> (Render and Vercel).
              </li>
              <li>
                <strong>Never commit secrets.</strong> <code>backend/.env</code> stays local.
              </li>
              <li>
                <strong>Maintenance mode</strong> is an on/off toggle in the admin sidebar.
              </li>
            </ol>
          </div>

          <Section id="glance" num="1" title="At a glance">
            <Table head={['Item', 'Detail']} rows={glance} />
          </Section>

          <Section id="apps" num="2" title="Applications in the repository">
            <p className="dpage-lead">
              The repo is a monorepo. Each folder is an independent app with its own toolchain and host.
            </p>
            <div className="dpage-cards">
              {apps.map((app) => (
                <article className={`dpage-card tone-${app.tone}`} key={app.name}>
                  <div className="dpage-card-head">
                    <h3>{app.name}</h3>
                    <span className="dpage-chip">{app.tag}</span>
                  </div>
                  <p>{app.what}</p>
                  <dl>
                    <dt>Tech</dt>
                    <dd>{app.tech}</dd>
                    <dt>Hosted on</dt>
                    <dd>{app.host}</dd>
                    <dt>Deploy</dt>
                    <dd>{app.deploy}</dd>
                  </dl>
                </article>
              ))}
            </div>
          </Section>

          <Section id="flow" num="3" title="How a request flows">
            <div className="dpage-flow">
              <div className="dpage-flow-box">Browser</div>
              <span className="dpage-arrow" aria-hidden="true">
                →
              </span>
              <div className="dpage-flow-box accent">Vercel · voicecall (Vite + routes)</div>
              <span className="dpage-arrow" aria-hidden="true">
                →
              </span>
              <div className="dpage-flow-split">
                <div className="dpage-flow-box">Next.js marketing</div>
                <div className="dpage-flow-box">SPA · React Router</div>
                <div className="dpage-flow-box">Render API · /api</div>
              </div>
            </div>
            <Table head={['Step', 'What happens']} rows={flow} />
          </Section>

          <Section id="routing" num="4" title="Routing rules">
            <p className="dpage-lead">
              The Vite project owns the domain and acts as the front door. Its <code>routes</code> array decides where
              each request goes.
            </p>
            <Table head={['Rule', 'Behaviour']} rows={routing} />
          </Section>

          <Section id="api" num="5" title="Backend & API">
            <p className="dpage-lead">
              A single Express service exposes the REST API, owns the Socket.IO realtime layer and talks to MongoDB
              through Mongoose models.
            </p>
            <Table head={['Area', 'Endpoints']} rows={backendAreas} />
            <div className="dpage-callout info">
              <p>
                Two account types exist: <strong>User</strong> (clients, via <code>/api/auth</code>) and{' '}
                <strong>Employee</strong> (staff &amp; admin, via <code>/api/employees</code>). The admin area needs an
                employee with the <code>admin</code> role.
              </p>
            </div>
          </Section>

          <Section id="seo" num="6" title="SEO infrastructure">
            <Table head={['Area', 'Implementation']} rows={seo} />
          </Section>

          <Section id="maintenance" num="7" title="Maintenance mode">
            <Table head={['Part', 'Detail']} rows={maintenance} />
          </Section>

          <Section id="local" num="8" title="Run it locally">
            <Table head={['App', 'Command']} rows={devSteps} />
          </Section>

          <Section id="deploy" num="9" title="Deploy a change">
            <div className="dpage-steps">
              {deploySteps.map(([target, how, mode]) => (
                <div className={`dpage-step ${mode}`} key={target}>
                  <span className="dpage-step-dot" aria-hidden="true" />
                  <div>
                    <h4>
                      {target} <span className={`dpage-chip ${mode}`}>{mode === 'auto' ? 'auto' : 'manual'}</span>
                    </h4>
                    <p>{how}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="dpage-callout warn">
              <p>
                After any deploy, re-check the live URLs. Marketing changes need a manual Next deploy, so a plain{' '}
                <code>git push</code> is not always enough on its own.
              </p>
            </div>
          </Section>

          <Section id="conventions" num="10" title="Conventions &amp; gotchas">
            <div className="dpage-callouts">
              {conventions.map(([title, body, tone]) => (
                <div className={`dpage-callout ${tone}`} key={title}>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="contact" num="11" title="Questions?">
            <p className="dpage-lead">
              For access to the hosting dashboards (Vercel, Render, MongoDB Atlas, Play Console) or to the environment
              variables, contact the project owner.
            </p>
            <div className="dpage-hero-links">
              <a className="dpage-link solid" href="/contact">
                Contact the team
              </a>
              <a className="dpage-link" href="/consultants">
                Talk to a consultant
              </a>
            </div>
          </Section>
        </div>
      </div>
    </div>
  </LandingLayout>
);

export default DetailedPage;
