import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getNotifications = async () => {
  const res = await axios.get(`${API_URL}/api/notifications`, {
    withCredentials: true,
  });
  return res.data;
};

export const getUnreadNotificationCount = async () => {
  const res = await axios.get(`${API_URL}/api/notifications/unread-count`, {
    withCredentials: true,
  });
  return res.data;
};

export const markAsRead = async (id: number) => {
  const res = await axios.post(
    `${API_URL}/api/notifications/read/${id}`,
    {},
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await axios.post(
    `${API_URL}/api/notifications/read-all`,
    {},
    {
      withCredentials: true,
    }
  );
  return res.data;
};
