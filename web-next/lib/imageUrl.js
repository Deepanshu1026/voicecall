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
 * Review photos: same as resolveImageUrl, but:
 * - photos hosted on the backend are served from our own fast origin, and
 * - Google-Drive hosted images map to local copies when we have them
 *   (otherwise a small =w200 thumbnail is requested).
 */
const LOCAL_GDRIVE_IMAGES = {
  '1k-ZCbaCtGmhs6Rro_HHjWLukba6eYjI6': '/images/user/review-hongkong.webp',
  '18gP17Xgf6WYRRrI5rZTLUoWLHuf1l2Wm': '/images/user/review-london.webp',
  '1xql2auy4lupWRV9gD93p-MaVqQkOl_NL': '/images/user/review-uk-1.webp',
  '1iEckH-9FEuAJiUoVGtdOi5Rx3jJsFVPh': '/images/user/review-uk-2.webp',
};

export const resolveReviewImage = (value) => {
  let url = resolveImageUrl(value);
  // Dead Cloudinary account (401s): skip straight to the letter fallback.
  if (/^https?:\/\/res\.cloudinary\.com\/fniv4k20\//i.test(url)) return '';
  if (/^https?:\/\/[^/]*onrender\.com\/img\//i.test(url)) {
    url = url.replace(/^https?:\/\/[^/]*onrender\.com\/img\//i, 'https://avisaexperts.com/images/user/');
  }
  const gdrive = /^https?:\/\/lh3\.googleusercontent\.com\/d\/([^/=?]+)/i.exec(url);
  if (gdrive) {
    const local = LOCAL_GDRIVE_IMAGES[gdrive[1]];
    if (local) return `https://avisaexperts.com${local}`;
    return `${url}=w200`;
  }
  return url;
};

export default resolveImageUrl;
