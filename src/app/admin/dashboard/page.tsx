'use client';

import '../rooms/page.css';

export default function AdminDashboardOverview() {
  return (
    <div>
      <h1 className="admin-title" style={{ marginBottom: '20px' }}>Thống kê tổng quan hệ thống</h1>
      
      {/* Thẻ Thống Kê Nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Tổng bài đăng</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0', color: '#2563eb' }}>124</p>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Chờ duyệt</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0', color: '#d97706' }}>12</p>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Báo cáo vi phạm</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0', color: '#dc2626' }}>3</p>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Người dùng</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0', color: '#16a34a' }}>58</p>
        </div>
      </div>
    </div>
  );
}