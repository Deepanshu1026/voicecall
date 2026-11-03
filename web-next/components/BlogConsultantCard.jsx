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

const Avatar = ({ consultant }) => {
  const [imageOk, setImageOk] = useState(true);
  const name = consultant?.displayName || consultant?.username || 'A Visa Experts';
  const avatar = consultant?.avatar || '';
  // The old Cloudinary avatars no longer resolve — fall back to initials.
  const showImage = imageOk && avatar && !/cloudinary\.com/i.test(avatar);

  return (
    <span className="blog-consultant-avatar" title={name}>
      {showImage ? (
        <img src={avatar} alt={name} width={44} height={44} onError={() => setImageOk(false)} />
      ) : (
        <span className="blog-consultant-initials">{initials(name)}</span>
      )}
    </span>
  );
};

/**
 * Compact "talk to a consultant" card for blog pages: a stack of consultant
 * avatars on the left and a "Talk Now" button on the right, linking through to
 * the consultants page. Matches the advisor-page card styling.
 */
const BlogConsultantCard = ({ variant = 'sidebar' }) => {
  const [consultants, setConsultants] = useState([]);

  useEffect(() => {
    let cancelled = false;
    userAPI
      .getConsultants()
      .then((res) => {
        const list = res.data?.data || [];
        const active = list.filter((c) => (c.workStatus || 'active') === 'active');
        const picks = (active.length ? active : list).slice(0, 3);
        if (!cancelled) setConsultants(picks);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className={`blog-consultant ${variant}`}>
      <div className="blog-consultant-avatars" aria-hidden={consultants.length === 0}>
        {consultants.map((c) => (
          <Avatar key={c.id || c._id} consultant={c} />
        ))}
      </div>

      <div className="blog-consultant-copy">
        <h3>Talk to a visa consultant</h3>
        <p>Get your documents and eligibility checked by an expert.</p>
      </div>

      <a className="blog-consultant-btn" href="/consultants">
        Talk Now
      </a>
    </aside>
  );
};

export default BlogConsultantCard;
