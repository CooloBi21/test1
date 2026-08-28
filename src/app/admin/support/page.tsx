'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import '../rooms/page.css';

// Tự động chuyển đổi giữa Environment Variable và Localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [replyModal, setReplyModal] = useState<{ open: boolean; ticket: any; reply: string }>({
    open: false,
    ticket: null,
    reply: '',
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/api/support-tickets/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách ticket hỗ trợ:', err);
      setError(err.response?.data?.message || 'Không thể kết nối đến máy chủ API hỗ trợ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${API_URL}/api/support-tickets/admin/${replyModal.ticket.id}`,
        {
          admin_reply: replyModal.reply,
          status: 'resolved',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setReplyModal({ open: false, ticket: null, reply: '' });
      fetchTickets();
    } catch (err: any) {
      console.error('Lỗi khi gửi phản hồi:', err);
      alert(err.response?.data?.message || 'Gửi phản hồi thất bại');
    }
  };

  return (
    <div>
      <h1 className="admin-title">Quản lý Yêu cầu & Khiếu nại</h1>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người gửi</th>
              <th>Phân loại</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>
                  Đang tải danh sách yêu cầu...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>
                  Chưa có yêu cầu hỗ trợ nào trong hệ thống
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td>
                    {t.user?.full_name || 'N/A'} ({t.user?.email || 'N/A'})
                  </td>
                  <td>
                    <b>{t.category}</b>
                  </td>
                  <td style={{ maxWidth: '300px' }}>{t.message}</td>
                  <td>{t.status}</td>
                  <td className="text-center">
                    <button
                      onClick={() =>
                        setReplyModal({ open: true, ticket: t, reply: t.admin_reply || '' })
                      }
                      className="btn btn-approve"
                    >
                      Phản hồi
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {replyModal.open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '450px' }}>
            <h3>Trả lời Ticket #{replyModal.ticket?.id}</h3>
            <textarea
              rows={5}
              style={{ width: '100%', padding: '8px', marginBottom: '12px', marginTop: '12px' }}
              value={replyModal.reply}
              onChange={(e) => setReplyModal({ ...replyModal, reply: e.target.value })}
              placeholder="Nhập phản hồi gửi cho user..."
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setReplyModal({ open: false, ticket: null, reply: '' })}
                className="btn"
                style={{ background: '#6b7280', color: '#fff' }}
              >
                Hủy
              </button>
              <button onClick={handleSendReply} className="btn btn-approve">
                Gửi & Đóng Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}