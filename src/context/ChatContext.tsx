'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getUnreadCount } from '@/api/chatApi';

interface ChatContextType {
  socket: Socket | null;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  refreshUnread: () => void;
}

const ChatContext = createContext<ChatContextType>({
  socket: null,
  unreadCount: 0,
  setUnreadCount: () => {},
  refreshUnread: () => {},
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnread = async () => {
    if (!user?.id) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Lỗi lấy unread count:', err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchUnread();

    // Chuẩn hóa URL Socket và ưu tiên chuyển từ HTTPS/API URL về root URL
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
      'http://localhost:5000';

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.emit('joinUser', user.id);

    newSocket.on('unreadCountUpdate', (count: number) => {
      setUnreadCount(count);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  return (
    <ChatContext.Provider value={{ socket, unreadCount, setUnreadCount, refreshUnread: fetchUnread }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);