'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const CATEGORY_MAP: Record<string, string> = {
  account_issue: 'Vấn đề tài khoản (Khóa/Thông tin)',
  room_issue: 'Bài đăng bị xóa/từ chối',
  payment_issue: 'Thanh toán & Chi phí',
  report_dispute: 'Khiếu nại/Thanh minh vi phạm',
  other: 'Khác',
};

export default function SupportPage() {
  const [category, setCategory] = useState('account_issue');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchMyTickets = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const res = await axios.get('http://localhost:5000/api/support-tickets/my-tickets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTickets(res.data);
  };

  useEffect(() => { fetchMyTickets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return alert('Vui lòng nhập nội dung hỗ trợ');
    const token = localStorage.getItem('access_token');
    await axios.post('http://localhost:5000/api/support-tickets', { category, message }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Đã gửi yêu cầu trợ giúp thành công!');
    setMessage('');
    fetchMyTickets();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Center Hỗ trợ & Khiếu nại</h1>

      {/* Form Tạo Ticket */}
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Danh mục cần trợ giúp:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          >
            {Object.entries(CATEGORY_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Nội dung trình bày/khiếu nại:</label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mô tả chi tiết thắc mắc hoặc thông tin thanh minh của bạn..."
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Gửi yêu cầu
        </button>
      </form>

      {/* Lịch sử Ticket */}
      <h2>Lịch sử khiếu nại & hỗ trợ</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tickets.map((t) => (
          <div key={t.id} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: '#2563eb' }}>{CATEGORY_MAP[t.category]}</span>
              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: t.status === 'resolved' ? '#dcfce7' : '#fef9c3', color: t.status === 'resolved' ? '#166534' : '#854d0e' }}>
                {t.status === 'resolved' ? 'Đã xử lý' : 'Đang tiếp nhận'}
              </span>
            </div>
            <p style={{ margin: '0 0 8px 0', color: '#334155' }}>{t.message}</p>
            {t.admin_reply && (
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #2563eb', marginTop: '8px' }}>
                <strong>Phản hồi từ Admin:</strong> {t.admin_reply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}