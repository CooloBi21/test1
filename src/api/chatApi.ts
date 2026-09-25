import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getConversations = async () => {
  const res = await axios.get(`${API_URL}/api/chat/conversations`, {
    withCredentials: true,
  });
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await axios.get(`${API_URL}/api/chat/unread-count`, {
    withCredentials: true,
  });
  return res.data;
};

export const getMessages = async (conversationId: number) => {
  const res = await axios.get(`${API_URL}/api/chat/messages/${conversationId}`, {
    withCredentials: true,
  });
  return res.data;
};

export const createOrGetConversation = async (targetUserId: number, roomId?: number) => {
  const res = await axios.post(
    `${API_URL}/api/chat/conversations`,
    { targetUserId, roomId },
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const markAsRead = async (conversationId: number) => {
  const res = await axios.post(
    `${API_URL}/api/chat/read/${conversationId}`,
    {},
    {
      withCredentials: true,
    }
  );
  return res.data;
};
