'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMyRooms } from '@/api/roomApi'; // Import getMyRooms thay vì getRooms
import { Room } from '@/types/room';
import Link from 'next/link';
import { Phone, Mail, PlusCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMyRooms = async () => {
      try {
        setLoading(true);
        // Gọi API /api/rooms/my-rooms lấy bài đăng theo token
        const roomsData = await getMyRooms();
        setMyRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch (err) {
        console.error('Lỗi khi tải bài đăng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRooms();
  }, [user]);

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Vui lòng đăng nhập để xem trang cá nhân.</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 16px' }}>
      {/* THÔNG TIN CÁ NHÂN */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
            {user.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : user.full_name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{user.full_name}</h2>
            <p style={{ color: '#64748b', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {user.email}</p>
            <p style={{ color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {user.phone || 'Chưa cập nhật SĐT'}</p>
          </div>
        </div>
      </div>

      {/* DANH SÁCH BÀI ĐĂNG CỦA TÔI */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Quản lý tin đăng của tôi ({myRooms.length})</h3>
          <Link href="/post-room" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ea580c', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            <PlusCircle size={16} /> Đăng tin mới
          </Link>
        </div>

        {loading ? (
          <div>Đang tải bài đăng...</div>
        ) : myRooms.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {myRooms.map((room) => (
              <div key={room.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <img src={room.thumbnail || 'https://via.placeholder.com/300x200'} alt={room.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                <div style={{ padding: '12px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '15px', height: '40px', overflow: 'hidden', margin: '0 0 8px' }}>{room.title}</h4>
                  <p style={{ color: '#ea580c', fontWeight: 800, margin: '0 0 8px' }}>{Number(room.price).toLocaleString('vi-VN')} đ/tháng</p>
                  <Link href={`/rooms/${room.id}`} style={{ color: '#2563eb', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Xem chi tiết →</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b' }}>Bạn chưa có bài đăng nào.</p>
        )}
      </div>
    </div>
  );
}