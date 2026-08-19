import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Hàm lấy token chuẩn hóa giống roomApi.ts
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('auth_token')
  );
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const getConversations = async () => {
  const res = await axios.get(`${API_URL}/api/chat/conversations`, getAuthHeaders());
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await axios.get(`${API_URL}/api/chat/unread-count`, getAuthHeaders());
  return res.data;
};

export const getMessages = async (conversationId: number) => {
  const res = await axios.get(`${API_URL}/api/chat/messages/${conversationId}`, getAuthHeaders());
  return res.data;
};

export const createOrGetConversation = async (targetUserId: number, roomId?: number) => {
  const res = await axios.post(
    `${API_URL}/api/chat/conversations`,
    { targetUserId, roomId },
    getAuthHeaders()
  );
  return res.data;
};

export const markAsRead = async (conversationId: number) => {
  const res = await axios.post(`${API_URL}/api/chat/read/${conversationId}`, {}, getAuthHeaders());
  return res.data;
};