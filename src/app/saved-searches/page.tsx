'use client';

import { useState } from 'react';
import { Bookmark, Bell, Trash2, Search } from 'lucide-react';

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState([
    { id: 1, title: 'Phòng trọ Quận 10 dưới 5 triệu', criteria: 'Tỉnh/Thành: TP.HCM • Quận/Huyện: Quận 10 • Giá: Dưới 5 triệu' },
    { id: 2, title: 'Căn hộ Cầu Giấy trên 30m²', criteria: 'Tỉnh/Thành: Hà Nội • Quận/Huyện: Cầu Giấy • Diện tích: Trên 30m²' }
  ]);

  return (
    <div style={{ maxWidth: '900px', margin: '32px auto', padding: '0 16px 60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bookmark color="#f97316" /> Tìm Kiếm Đã Lưu
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Nhận thông báo khi có phòng trọ mới phù hợp với tiêu chí của bạn.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {searches.map(item => (
          <div key={item.id} style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{item.criteria}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ background: '#fff7ed', border: '1px solid #ffedd5', color: '#ea580c', padding: '8px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={15} /> Áp dụng bộ lọc
              </button>
              <button onClick={() => setSearches(searches.filter(s => s.id !== item.id))} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}