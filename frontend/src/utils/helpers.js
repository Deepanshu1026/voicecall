import { format, isToday, isYesterday, formatDistanceToNowStrict } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const formatMessageTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'h:mm a');
};

export const formatMessageDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE');
};

export const formatLastSeen = (date) => {
  if (!date) return '';
  const d = new Date(date);
  try {
    return formatDistanceToNowStrict(d, { addSuffix: true, locale: enUS });
  } catch {
    return '';
  }
};

export const formatCallDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const DEFAULT_AVATAR = '/images/user/avatar.webp';

export const getAvatarUrl = (user) => {
  if (!user) return DEFAULT_AVATAR;
  let avatar = null;
  if (user.avatar?.url) {
    avatar = user.avatar.url;
  } else if (typeof user.avatar === 'string' && user.avatar.trim()) {
    avatar = user.avatar.trim();
  }
  if (!avatar) return DEFAULT_AVATAR;

  // Map old/default placeholder paths to the bundled default avatar
  const lower = avatar.toLowerCase();
  if (lower === 'img/userdemo.webp' || lower === '/img/userdemo.webp' || lower === '/images/user/userdemo.webp') {
    return DEFAULT_AVATAR;
  }

  if (avatar.startsWith('http')) return avatar;
  return avatar.startsWith('/') ? avatar : '/' + avatar;
};

export const getDisplayName = (user) => {
  if (!user) return 'Unknown';
  return user.displayName || user.username || 'Unknown';
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
};
