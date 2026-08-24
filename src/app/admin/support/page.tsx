'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import '../rooms/page.css';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [replyModal, setReplyModal] = useState<{ open: boolean; ticket: any; reply: string }>({
    open: false, ticket: null, reply: '',
  });

  const fetchTickets = async () => {
    const token = localStorage.getItem('access_token');
    const res = await axios.get('http://localhost:5000/api/support-tickets/admin', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTickets(res.data);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSendReply = async () => {
    const token = localStorage.getItem('access_token');
    await axios.patch(`http://localhost:5000/api/support-tickets/admin/${replyModal.ticket.id}`, {
      admin_reply: replyModal.reply,
      status: 'resolved',
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReplyModal({ open: false, ticket: null, reply: '' });
    fetchTickets();
  };

  return (
    <div>
      <h1 className="admin-title">Quản lý Yêu cầu & Khiếu nại</h1>
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
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>{t.user?.full_name} ({t.user?.email})</td>
                <td><b>{t.category}</b></td>
                <td style={{ maxWidth: '300px' }}>{t.message}</td>
                <td>{t.status}</td>
                <td className="text-center">
                  <button onClick={() => setReplyModal({ open: true, ticket: t, reply: t.admin_reply || '' })} className="btn btn-approve">
                    Phản hồi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {replyModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '450px' }}>
            <h3>Trả lời Ticket #{replyModal.ticket?.id}</h3>
            <textarea
              rows={5}
              style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
              value={replyModal.reply}
              onChange={(e) => setReplyModal({ ...replyModal, reply: e.target.value })}
              placeholder="Nhập phản hồi gửi cho user..."
            />
            <button onClick={handleSendReply} className="btn btn-approve">Gửi & Đóng Ticket</button>
          </div>
        </div>
      )}
    </div>
  );
}