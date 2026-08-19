'use client';

import { Star, MessageSquare } from 'lucide-react';

export default function MyReviewsPage() {
  const reviews = [
    { id: 1, roomName: 'Phòng trọ cao cấp Quận 7', rating: 5, date: '12/08/2026', comment: 'Phòng sạch sẽ, chủ nhà vui vẻ thân thiện đúng như mô tả.' },
    { id: 2, roomName: 'Chung cư mini Cầu Giấy', rating: 4, date: '01/08/2026', comment: 'An ninh tốt, có chỗ để xe rộng rãi.' }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '32px auto', padding: '0 16px 60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star color="#eab308" fill="#eab308" /> Đánh Giá Từ Tôi
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Quản lý các nhận xét và đánh giá bạn đã để lại cho các chủ trọ.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reviews.map(item => (
          <div key={item.id} style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{item.roomName}</h3>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.date}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              {[...Array(item.rating)].map((_, i) => (
                <Star key={i} size={16} color="#eab308" fill="#eab308" />
              ))}
            </div>
            <p style={{ color: '#475569', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>{item.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}