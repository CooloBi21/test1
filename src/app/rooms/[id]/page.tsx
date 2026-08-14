'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

// ⚡ Khai báo API_URL từ biến môi trường (fallback về localhost:5000 khi dev local)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RoomDetail {
  id: number;
  title: string;
  thumbnail?: string;
  price: number;
  area: number;
  city: string;
  district: string;
  content?: string;
}

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${roomId}`);
        if (!res.ok) throw new Error('Không tìm thấy phòng');
        const data = await res.json();
        setRoom(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) fetchRoomDetail();
  }, [roomId]);

  if (loading) return <p style={{ padding: '40px', textAlign: 'center' }}>Đang tải thông tin phòng...</p>;
  if (!room) return <p style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy thông tin phòng trọ!</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Link href="/" style={{ textDecoration: 'none', color: '#0070f3' }}>
        ← Quay lại trang chủ
      </Link>
      
      <h1 style={{ marginTop: '16px' }}>{room.title}</h1>
      
      {room.thumbnail && (
        <img
          src={room.thumbnail}
          alt={room.title}
          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
        />
      )}

      <div style={{ display: 'flex', gap: '20px', margin: '16px 0', fontSize: '18px' }}>
        <p style={{ color: '#e53e3e', fontWeight: 'bold' }}>
          💰 Giá: {Number(room.price).toLocaleString('vi-VN')} VNĐ/tháng
        </p>
        <p>📐 Diện tích: {room.area} m²</p>
      </div>

      <div style={{ background: '#f7fafc', padding: '16px', borderRadius: '8px' }}>
        <h3>Mô tả chi tiết:</h3>
        <p>{room.content || 'Chưa có mô tả chi tiết cho phòng này.'}</p>
      </div>
    </div>
  );
}