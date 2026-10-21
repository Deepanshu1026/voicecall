'use client';

import { useEffect, useRef } from 'react';
import { blogAPI } from '../lib/api';

export default function BlogViewTracker({ id }) {
  const fired = useRef(false);

  useEffect(() => {
    if (!id || fired.current) return;
    fired.current = true;
    blogAPI.recordPostView(id).catch(() => {});
  }, [id]);

  return null;
}
