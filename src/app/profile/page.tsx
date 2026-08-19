'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMyRooms, deleteRoomPost } from '@/api/roomApi';
import { Room } from '@/types/room';
import Link from 'next/link';
import { Phone, Mail, PlusCircle, Eye, Edit3, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMyRooms = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách bài đăng của tôi
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

  // Hàm xử lý xóa bài đăng
  const handleDeleteRoom = async (roomId: number | string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return;

    try {
      await deleteRoomPost(roomId);
      alert('Xóa phòng thành công!');
      // Cập nhật lại UI bằng cách lọc bỏ phòng đã xóa khỏi state
      setMyRooms((prevRooms) => prevRooms.filter((room) => String(room.id) !== String(roomId)));
    } catch (error: any) {
      console.error('Lỗi khi xóa bài đăng:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa phòng');
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Vui lòng đăng nhập để xem trang cá nhân.</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 16px' }}>
      {/* THÔNG TIN CÁ NHÂN */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', overflow: 'hidden' }}>
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.full_name?.charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{user.full_name}</h2>
            <p style={{ color: '#64748b', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> {user.email}
            </p>
            <p style={{ color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} /> {user.phone || 'Chưa cập nhật SĐT'}
            </p>
          </div>
        </div>
      </div>

      {/* DANH SÁCH BÀI ĐĂNG CỦA TÔI */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Quản lý tin đăng của tôi ({myRooms.length})</h3>
          <Link
            href="/post-room"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ea580c',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            <PlusCircle size={16} /> Đăng tin mới
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Đang tải bài đăng...</div>
        ) : myRooms.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {myRooms.map((room) => (
              <div
                key={room.id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div>
                  <img
                    src={room.thumbnail || 'https://via.placeholder.com/300x200'}
                    alt={room.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '15px', height: '40px', overflow: 'hidden', margin: '0 0 8px', lineHeight: '1.3' }}>
                      {room.title}
                    </h4>
                    <p style={{ color: '#ea580c', fontWeight: 800, margin: '0 0 8px' }}>
                      {Number(room.price).toLocaleString('vi-VN')} đ/tháng
                    </p>
                  </div>
                </div>

                {/* THANH HÀNH ĐỘNG: XEM / SỬA / XÓA */}
                <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                  <Link
                    href={`/rooms/${room.id}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '7px 0',
                      background: '#dbeafe',
                      color: '#2563eb',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <Eye size={14} /> Xem
                  </Link>

                  <Link
                    href={`/rooms/${room.id}/edit`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '7px 0',
                      background: '#fef3c7',
                      color: '#b45309',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <Edit3 size={14} /> Sửa
                  </Link>

                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '7px 0',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} /> Xóa
                  </button>
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