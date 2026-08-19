import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export const getNotifications = async () => {
  const res = await axios.get(`${API_URL}/api/notifications`, getAuthHeaders());
  return res.data;
};

export const getUnreadNotificationCount = async () => {
  const res = await axios.get(`${API_URL}/api/notifications/unread-count`, getAuthHeaders());
  return res.data;
};

export const markAsRead = async (id: number) => {
  const res = await axios.post(`${API_URL}/api/notifications/read/${id}`, {}, getAuthHeaders());
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await axios.post(`${API_URL}/api/notifications/read-all`, {}, getAuthHeaders());
  return res.data;
};