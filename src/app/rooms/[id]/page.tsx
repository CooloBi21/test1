'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRoomById, recordRoomView } from '@/api/roomApi';
import { createOrGetConversation } from '@/api/chatApi';
import { useAuth } from '@/context/AuthContext';
import { useSavedPosts } from '@/context/SavedPostsContext';
import { Heart, MessageCircle, MapPin, Square, ShieldCheck } from 'lucide-react';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isSaved, toggleSavePost } = useSavedPosts();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingChat, setSubmittingChat] = useState(false);
  const numericRoomId = Number(params?.id);

  // Cờ đánh dấu để chống ghi nhận 2 lần trong Strict Mode
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    if (!numericRoomId) return;

    getRoomById(numericRoomId)
      .then((data) => {
        setRoom(data);

        // Chỉ ghi nhận lượt xem 1 lần duy nhất cho mỗi lượt render trang
        if (data && !hasRecordedRef.current) {
          hasRecordedRef.current = true;
          recordRoomView(numericRoomId);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [numericRoomId]);

  const handleContactLandlord = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để trao đổi với chủ nhà!');
      router.push('/login');
      return;
    }
    if (user.id === room?.user_id) {
      alert('Đây là tin đăng của chính bạn!');
      return;
    }

    try {
      setSubmittingChat(true);
      await createOrGetConversation(room.user_id, room.id);
      router.push('/chat');
    } catch (err) {
      console.error('Lỗi khi tạo cuộc trò chuyện:', err);
      alert('Không thể tạo cuộc trò chuyện với chủ nhà');
    } finally {
      setSubmittingChat(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
  if (!room) return <div style={{ padding: '40px', textAlign: 'center' }}>Phòng trọ không tồn tại.</div>;

  const isRoomSaved = isSaved(numericRoomId);

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
      {/* CỘT TRÁI: CHI TIẾT */}
      <div>
        <img src={room.thumbnail || 'https://via.placeholder.com/800x450'} alt={room.title} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }} />
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '16px 0 8px' }}>{room.title}</h1>
        <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} /> {room.district_name}, {room.city_name}
        </p>
        <div style={{ display: 'flex', gap: '20px', margin: '16px 0', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
          <div><span style={{ color: '#64748b', fontSize: '12px' }}>Giá thuê</span><p style={{ color: '#ea580c', fontWeight: 800, fontSize: '18px', margin: 0 }}>{Number(room.price).toLocaleString('vi-VN')} đ/tháng</p></div>
          <div><span style={{ color: '#64748b', fontSize: '12px' }}>Diện tích</span><p style={{ fontWeight: 700, fontSize: '18px', margin: 0 }}>{room.area} m²</p></div>
        </div>
        <h3>Mô tả chi tiết</h3>
        <p style={{ lineHeight: '1.6', color: '#334155' }}>{room.content || 'Chưa có mô tả chi tiết.'}</p>
      </div>

      {/* CỘT PHẢI: THÔNG TIN CHỦ NHÀ & LIÊN HỆ */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: 'fit-content' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            {room.user?.full_name?.charAt(0) || 'CN'}
          </div>
          <div>
            <h4 style={{ margin: 0, fontWeight: 700 }}>{room.user?.full_name || 'Chủ bài đăng'}</h4>
            <span style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> Chính chủ đã xác thực</span>
          </div>
        </div>

        <button
          onClick={handleContactLandlord}
          disabled={submittingChat}
          style={{
            width: '100%',
            background: submittingChat ? '#93c5fd' : '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: submittingChat ? 'not-allowed' : 'pointer',
            marginBottom: '10px'
          }}
        >
          <MessageCircle size={18} /> {submittingChat ? 'Đang kết nối...' : '💬 Chat với chủ nhà'}
        </button>

        <button
          onClick={() => toggleSavePost(room)}
          style={{ width: '100%', background: isRoomSaved ? '#fee2e2' : '#f1f5f9', color: isRoomSaved ? '#dc2626' : '#475569', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <Heart size={18} fill={isRoomSaved ? '#dc2626' : 'none'} color={isRoomSaved ? '#dc2626' : '#475569'} />
          {isRoomSaved ? 'Đã lưu tin' : 'Lưu tin đăng'}
        </button>
      </div>
    </div>
  );
}