'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRoomById, recordRoomView } from '@/api/roomApi';
import { createOrGetConversation } from '@/api/chatApi';
import { createReportApi } from '@/api/reportApi';
import { useAuth } from '@/context/AuthContext';
import { useSavedPosts } from '@/context/SavedPostsContext';
import { Heart, MessageCircle, MapPin, ShieldCheck, Edit3, Flag } from 'lucide-react';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isSaved, toggleSavePost } = useSavedPosts();

  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingChat, setSubmittingChat] = useState(false);

  // State quản lý Modal Báo cáo
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const numericRoomId = Number(params?.id);

  // Cờ đánh dấu để chống ghi nhận lượt xem 2 lần trong React Strict Mode
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    if (!numericRoomId) return;

    getRoomById(numericRoomId)
      .then((data) => {
        setRoom(data);

        // Ghi nhận lượt xem 1 lần duy nhất
        if (data && !hasRecordedRef.current) {
          hasRecordedRef.current = true;
          recordRoomView(numericRoomId);
        }
      })
      .catch((err) => console.error('Lỗi lấy thông tin phòng:', err))
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

  const handleSendReport = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để gửi báo cáo vi phạm!');
      router.push('/login');
      return;
    }
    if (!reportReason.trim()) {
      alert('Vui lòng nhập lý do báo cáo');
      return;
    }

    try {
      setSubmittingReport(true);
      await createReportApi(numericRoomId, reportReason);
      alert('Báo cáo của bạn đã được gửi thành công!');
      setShowReportModal(false);
      setReportReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
  if (!room) return <div style={{ padding: '40px', textAlign: 'center' }}>Phòng trọ không tồn tại.</div>;

  const isRoomSaved = isSaved(numericRoomId);
  const isOwner = user?.id === room.user_id;

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
      {/* CỘT TRÁI: CHI TIẾT */}
      <div>
        <img
          src={room.thumbnail || 'https://via.placeholder.com/800x450'}
          alt={room.title}
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
        />
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '16px 0 8px' }}>{room.title}</h1>
        <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} /> {room.district_name || room.district || 'N/A'}, {room.city_name || room.city || 'N/A'}
        </p>
        <div style={{ display: 'flex', gap: '20px', margin: '16px 0', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '12px' }}>Giá thuê</span>
            <p style={{ color: '#ea580c', fontWeight: 800, fontSize: '18px', margin: 0 }}>
              {Number(room.price).toLocaleString('vi-VN')} đ/tháng
            </p>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '12px' }}>Diện tích</span>
            <p style={{ fontWeight: 700, fontSize: '18px', margin: 0 }}>{room.area} m²</p>
          </div>
        </div>
        <h3>Mô tả chi tiết</h3>
        <p style={{ lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line' }}>{room.content || 'Chưa có mô tả chi tiết.'}</p>
      </div>

      {/* CỘT PHẢI: THÔNG TIN CHỦ NHÀ & THAO TÁC */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: 'fit-content' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
            {room.user?.full_name?.charAt(0).toUpperCase() || 'CN'}
          </div>
          <div>
            <h4 style={{ margin: 0, fontWeight: 700 }}>{room.user?.full_name || 'Chủ bài đăng'}</h4>
            <span style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Chính chủ đã xác thực
            </span>
          </div>
        </div>

        {/* Nếu người xem chính là chủ sở hữu, hiện nút sửa nhanh */}
        {isOwner ? (
          <Link
            href={`/rooms/${room.id}/edit`}
            style={{
              width: '100%',
              background: '#fef3c7',
              color: '#b45309',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              marginBottom: '10px'
            }}
          >
            <Edit3 size={18} /> Chỉnh sửa tin đăng này
          </Link>
        ) : (
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
            <MessageCircle size={18} /> {submittingChat ? 'Đang kết nối...' : 'Chat với chủ nhà'}
          </button>
        )}

        <button
          onClick={() => toggleSavePost(room)}
          style={{
            width: '100%',
            background: isRoomSaved ? '#fee2e2' : '#f1f5f9',
            color: isRoomSaved ? '#dc2626' : '#475569',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <Heart size={18} fill={isRoomSaved ? '#dc2626' : 'none'} color={isRoomSaved ? '#dc2626' : '#475569'} />
          {isRoomSaved ? 'Đã lưu tin' : 'Lưu tin đăng'}
        </button>

        {/* Nút Báo cáo bài viết (Chỉ hiển thị với người xem không phải chủ nhà) */}
        {!isOwner && (
          <button
            onClick={() => setShowReportModal(true)}
            style={{
              width: '100%',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#ef4444',
              background: 'transparent',
              border: '1px solid #fca5a5',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            <Flag size={16} /> Báo cáo bài viết
          </button>
        )}
      </div>

      {/* MODAL BÁO CÁO VI PHẠM */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 'bold' }}>Báo cáo bài đăng vi phạm</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
              Hãy mô tả rõ lý do (Thông tin sai sự thật, lừa đảo, hình ảnh không đúng...):
            </p>

            <textarea
              rows={4}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Nhập chi tiết lý do..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginBottom: '16px',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowReportModal(false)}
                disabled={submittingReport}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  background: '#f3f4f6',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSendReport}
                disabled={submittingReport}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                {submittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}