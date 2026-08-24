import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const createReportApi = async (roomId: number, reason: string) => {
  const res = await axios.post(
    `${API_URL}/api/reports`,
    { room_id: roomId, reason },
    getAuthHeader()
  );
  return res.data;
};

export const getAdminReportsApi = async () => {
  const res = await axios.get(`${API_URL}/api/reports/admin`, getAuthHeader());
  return res.data;
};

export const updateReportStatusApi = async (
  reportId: number,
  status: 'resolved' | 'dismissed'
) => {
  const res = await axios.patch(
    `${API_URL}/api/reports/admin/${reportId}/status`,
    { status },
    getAuthHeader()
  );
  return res.data;
};