'use client';

import { useEffect, useState } from 'react';
import { userAPI } from '../lib/api';

const initials = (name) =>
  (name || 'AV')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/**
 * Small "talk to a consultant" card shown on blog pages. Pulls a real consultant
 * from the API and links straight through to the consultants page.
 */
const BlogConsultantCard = ({ variant = 'sidebar' }) => {
  const [consultant, setConsultant] = useState(null);
  const [imageOk, setImageOk] = useState(true);

  useEffect(() => {
    let cancelled = false;
    userAPI
      .getConsultants()
      .then((res) => {
        const list = res.data?.data || [];
        const active = list.filter((c) => (c.workStatus || 'active') === 'active');
        const pick = (active.length ? active : list)[0];
        if (!cancelled && pick) setConsultant(pick);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const name = consultant?.displayName || consultant?.username || 'A Visa Experts';
  const avatar = consultant?.avatar || '';
  // The old Cloudinary avatars no longer resolve — fall back to initials.
  const showImage = imageOk && avatar && !/cloudinary\.com/i.test(avatar);

  const facts = [];
  if (consultant?.expertise) facts.push(consultant.expertise);
  if (consultant?.languages) facts.push(consultant.languages);
  if (consultant?.experience) facts.push(`${consultant.experience}+ yrs experience`);
  if (consultant?.clients) facts.push(`${consultant.clients}+ clients helped`);

  return (
    <aside className={`blog-consultant ${variant}`}>
      <div className="blog-consultant-top">
        <span className="blog-consultant-avatar">
          {showImage ? (
            <img src={avatar} alt={name} width={56} height={56} onError={() => setImageOk(false)} />
          ) : (
            <span className="blog-consultant-initials">{initials(name)}</span>
          )}
        </span>
        <div>
          <span className="blog-consultant-tag">Talk to a consultant</span>
          <h3>{name}</h3>
          {consultant && <p className="blog-consultant-role">Visa consultant</p>}
        </div>
      </div>

      {facts.length > 0 && (
        <ul className="blog-consultant-facts">
          {facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}

      <p className="blog-consultant-text">
        Not sure which visa or document you need? Our advisors will review your case and guide you step by step.
      </p>

      <a className="blog-consultant-btn" href="/consultants">
        See all consultants
      </a>
    </aside>
  );
};

export default BlogConsultantCard;
