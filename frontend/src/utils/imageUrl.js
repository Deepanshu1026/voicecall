const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Origin where the backend (and its /images, /img, /uploads static files) lives.
export const SERVER_ORIGIN = /^https?:\/\//i.test(API_BASE_URL)
  ? API_BASE_URL.replace(/\/api\/?$/, '')
  : '';

/**
 * Turns a stored image value into a browser-loadable URL.
 * - Leaves absolute URLs (http/https, data:, blob:) untouched.
 * - Maps legacy PHP `/img/...` paths to the backend image folder.
 * - Resolves relative paths against the backend origin when the API is remote.
 */
export const resolveImageUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  const v = value.trim().replace(/\\/g, '/');
  if (!v) return '';

  if (/^(https?:)?\/\//i.test(v) || v.startsWith('data:') || v.startsWith('blob:')) {
    return encodeURI(v);
  }

  if (v.startsWith('img/') || v.startsWith('/img/')) {
    const fileName = v.replace(/^\/?img\//, '');
    return encodeURI(`${SERVER_ORIGIN}/images/user/${fileName}`);
  }

  const path = v.startsWith('/') ? v : `/${v}`;
  return encodeURI(`${SERVER_ORIGIN}${path}`);
};

/**
 * Review photos: same as resolveImageUrl, but:
 * - photos hosted on the backend are served from our own fast origin, and
 * - Google-Drive hosted images are requested as a small thumbnail (=w200).
 */
export const resolveReviewImage = (value) => {
  let url = resolveImageUrl(value);
  if (/^https?:\/\/[^/]*onrender\.com\/img\//i.test(url)) {
    url = url.replace(/^https?:\/\/[^/]*onrender\.com\/img\//i, 'https://avisaexperts.com/images/user/');
  }
  if (/^https?:\/\/lh3\.googleusercontent\.com\/d\//i.test(url) && !url.includes('=')) {
    return `${url}=w200`;
  }
  return url;
};

export default resolveImageUrl;
