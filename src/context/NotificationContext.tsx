'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { 
  getNotifications, 
  getUnreadNotificationCount, 
  markAsRead as apiMarkAsRead, 
  markAllAsRead as apiMarkAllAsRead 
} from '@/api/notificationApi';

export interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body?: string;
  target_url?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  socket: Socket | null;
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refreshNotifications: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchInitialData = async () => {
    if (!user?.id) return;
    try {
      const [notiList, unreadData] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount()
      ]);
      setNotifications(notiList);
      setUnreadCount(unreadData.unreadCount || 0);
    } catch (err) {
      console.error('Lỗi lấy notifications:', err);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchInitialData();

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('joinUser', user.id);

    newSocket.on('newNotification', (newNoti: NotificationItem) => {
      setNotifications((prev) => [newNoti, ...prev]);
    });

    newSocket.on('unreadNotiCountUpdate', (count: number) => {
      setUnreadCount(count);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiMarkAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Lỗi mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Lỗi mark all as read:', error);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        socket, 
        notifications, 
        unreadCount, 
        markAsRead: handleMarkAsRead, 
        markAllAsRead: handleMarkAllAsRead,
        refreshNotifications: fetchInitialData
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);