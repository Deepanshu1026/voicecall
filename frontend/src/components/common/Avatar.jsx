import { getAvatarUrl, getInitials, getDisplayName } from '../../utils/helpers';
import { useSocket } from '../../context/SocketContext';

const Avatar = ({ user, size = 'md', showStatus = false, className = '' }) => {
  const { isUserOnline } = useSocket();
  const avatarUrl = getAvatarUrl(user);
  const online = showStatus && user && isUserOnline(user._id || user);
  const status = user?.status;

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  };

  const getStatusColor = () => {
    // Only the real-time socket list should drive the online dot; the DB
    // user.status/workStatus can be stale, so don't use it as a fallback.
    if (online) return 'bg-green-500';
    if (status === 'away') return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={getDisplayName(user)}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-primary-600 flex items-center justify-center`}>
          <span className="text-white font-semibold">{getInitials(getDisplayName(user))}</span>
        </div>
      )}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 ${statusDotSizes[size]} rounded-full border-2 border-white dark:border-surface-dark ${getStatusColor()}`}
        />
      )}
    </div>
  );
};

export default Avatar;
