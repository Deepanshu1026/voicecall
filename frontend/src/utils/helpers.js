import { format, isToday, isYesterday, formatDistanceToNowStrict } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const formatMessageTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
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

export const getAvatarUrl = (user) => {
  if (user?.avatar?.url) {
    if (user.avatar.url.startsWith('http')) return user.avatar.url;
    return user.avatar.url;
  }
  return null;
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
