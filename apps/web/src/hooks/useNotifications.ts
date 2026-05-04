/**
 * RECOMMENDATION: Real-time Notifications Hook
 * WebSocket client for live updates
 */
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { BRAND } from '@/lib/brand';

interface Notification {
  id: string;
  type: 'load_update' | 'exception' | 'message' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

export function useNotifications(userId: string, companyId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Prefer an explicit socket origin so production does not fall back to the
    // web origin, which can be blocked by CSP during the WebSocket upgrade.
    const socketBase = (import.meta.env.VITE_API_URL ?? 'wss://api.infamousfreight.com').replace(/\/$/, '');
    const newSocket = io(`${socketBase}/notifications`, {
      query: { userId },
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join:company', companyId);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: BRAND.notificationIcon,
          });
        }
      }
    });

    newSocket.on('load:update', (update) => {
      console.log('Load update:', update);
    });

    newSocket.on('exception:alert', (alert) => {
      console.log('Exception alert:', alert);
    });

    setSocket(newSocket);

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, [userId, companyId]);

  const markAsRead = useCallback((notificationId: string) => {
    socket?.emit('notification:read', notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [socket]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const joinLoad = useCallback((loadId: string) => {
    socket?.emit('join:load', loadId);
  }, [socket]);

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    joinLoad,
  };
}
