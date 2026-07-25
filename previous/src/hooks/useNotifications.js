import { useCallback, useEffect } from 'react';

export const useNotifications = () => {
  const hasNotification = typeof window !== 'undefined' && 'Notification' in window;
  const permissionGranted = hasNotification && Notification.permission === 'granted';

  const requestPermission = useCallback(async () => {
    if (!hasNotification) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, [hasNotification]);

  const showNotification = useCallback(
    (title, options = {}) => {
      if (!permissionGranted) return;
      try {
        const notification = new Notification(title, {
          icon: '/vite.svg',
          badge: '/vite.svg',
          ...options,
        });
        notification.onclick = () => {
          window.focus();
          if (options.onClick) options.onClick();
          notification.close();
        };
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('Notification error:', error);
      }
    },
    [permissionGranted]
  );

  const notifyMessage = useCallback(
    (senderName, message, onClick) => {
      showNotification(`${senderName}`, {
        body: message?.type === 'file' ? `Sent a file: ${message.fileName}` : message?.content?.substring(0, 100),
        onClick,
      });
    },
    [showNotification]
  );

  const notifyCall = useCallback(
    (caller, type) => {
      showNotification(`${caller}`, {
        body: `Incoming ${type} call...`,
        requireInteraction: true,
        tag: 'incoming-call',
      });
    },
    [showNotification]
  );

  useEffect(() => {
    if (hasNotification && Notification.permission === 'default') {
      requestPermission();
    }
  }, [hasNotification, requestPermission]);

  return {
    requestPermission,
    showNotification,
    notifyMessage,
    notifyCall,
    permissionGranted,
  };
};
