import { useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Keeps the authenticated user's wallet balance in sync with real-time
 * backend events (e.g., call billing deductions, money added).
 */
const WalletSync = () => {
  const { on } = useSocket();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (!user) return;

    const cleanup = on('wallet:updated', (data) => {
      if (data && typeof data.balance === 'number') {
        updateUser({ ...user, walletBalance: data.balance });
      }
    });

    return cleanup;
  }, [on, user, updateUser]);

  return null;
};

export default WalletSync;
