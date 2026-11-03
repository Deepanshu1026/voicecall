'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { userAPI, API_BASE_URL } from '../lib/api';

const GREETING = 'Hello! How may I help you? If you want to know anything, I am happy to help.';

const initials = (name) =>
  (name || 'AV')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/**
 * Small chat popup shown on blog pages. An online advisor's avatar appears and
 * types a greeting; the visitor can reply and is taken to the live chat.
 */
const BlogChatPopup = () => {
  const [advisor, setAdvisor] = useState(null);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [message, setMessage] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [imageOk, setImageOk] = useState(true);
  const inputRef = useRef(null);

  // Load an advisor, then pop the chat open shortly after the page settles.
  useEffect(() => {
    let cancelled = false;
    userAPI
      .getConsultants()
      .then((res) => {
        const list = res.data?.data || [];
        const active = list.filter((c) => (c.workStatus || 'active') === 'active');
        const pick = (active.length ? active : list)[0];
        if (!cancelled && pick) setAdvisor(pick);
      })
      .catch(() => {});
    const timer = setTimeout(() => setOpen(true), 1200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Type the greeting out
  useEffect(() => {
    if (!open) return undefined;
    let i = 0;
    setTyped('');
    const timer = setInterval(() => {
      i += 1;
      setTyped(GREETING.slice(0, i));
      if (i >= GREETING.length) clearInterval(timer);
    }, 26);
    return () => clearInterval(timer);
  }, [open]);

  const name = advisor?.displayName || advisor?.username || 'A Visa Experts';
  const avatar = advisor?.avatar || '';
  // The old Cloudinary avatars no longer resolve — fall back to initials.
  const showImage = imageOk && avatar && !/cloudinary\.com/i.test(avatar);

  const send = async () => {
    if (connecting) return;
    setConnecting(true);
    const targetId = advisor?.id || advisor?._id;

    // Not signed in? Create a guest session first so the chat works straight away.
    try {
      const hasToken =
        typeof window !== 'undefined' &&
        (localStorage.getItem('accessToken') || localStorage.getItem('employeeAccessToken'));
      if (!hasToken) {
        const res = await fetch(`${API_BASE_URL}/app/guest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginFrom: 'web' }),
        });
        const data = await res.json();
        if (data && data.token) {
          localStorage.setItem('accessToken', data.token);
          localStorage.setItem('refreshToken', data.refreshToken || '');
          localStorage.removeItem('employeeAccessToken');
          localStorage.removeItem('employeeRefreshToken');
        }
      }
    } catch (e) {
      // Even if the guest session fails we still send them to the consultants page,
      // where they can sign in and chat.
    }

    window.location.assign(targetId ? `/consultants?userId=${targetId}` : '/consultants');
  };

  const avatarNode = useMemo(
    () =>
      showImage ? (
        <img src={avatar} alt={name} width={40} height={40} onError={() => setImageOk(false)} />
      ) : (
        <span className="blog-chat-initials">{initials(name)}</span>
      ),
    [showImage, avatar, name]
  );

  if (!open) {
    return (
      <button type="button" className="blog-chat-fab" onClick={() => setOpen(true)} aria-label="Chat with a consultant">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-2.9-.4L3 21l1.6-4.6A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="blog-chat" role="dialog" aria-label="Chat with a consultant">
      <div className="blog-chat-head">
        <span className="blog-chat-avatar">{avatarNode}</span>
        <span className="blog-chat-who">
          <strong>{name}</strong>
          <em>
            <i className="blog-chat-dot" /> Online now
          </em>
        </span>
        <button type="button" className="blog-chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
          &times;
        </button>
      </div>

      <div className="blog-chat-body">
        {connecting ? (
          <div className="blog-chat-bubble blog-chat-connecting">
            Connecting you to {name}
            <span className="blog-chat-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        ) : (
          <div className="blog-chat-bubble">
            {typed}
            {typed.length < GREETING.length && <span className="blog-chat-caret" />}
          </div>
        )}
      </div>

      <form
        className="blog-chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-label="Your message"
        />
        <button type="submit" disabled={connecting} aria-label="Send">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M3.4 20.4 21 12 3.4 3.6 3 10l12 2-12 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default BlogChatPopup;
