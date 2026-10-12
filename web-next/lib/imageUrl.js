const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://voicecall-6ylg.onrender.com/api';

// Origin where the backend (and its /images, /img, /uploads static files) lives.
export const SERVER_ORIGIN = /^https?:\/\//i.test(API_BASE_URL)
  ? API_BASE_URL.replace(/\/api\/?$/, '')
  : '';

/**
 * Turns a stored image value into a browser-loadable URL.
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
 * Review photos: same as resolveImageUrl, but Google-Drive hosted images are
 * requested as a small thumbnail (=w320) since they render as tiny avatars.
 */
export const resolveReviewImage = (value) => {
  const url = resolveImageUrl(value);
  if (/^https?:\/\/lh3\.googleusercontent\.com\/d\//i.test(url) && !url.includes('=')) {
    return `${url}=w320`;
  }
  return url;
};

export default resolveImageUrl;
