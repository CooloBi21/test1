'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, ShieldCheck, Phone, MessageSquare, Heart, 
  Flag, Wifi, AirVent, Car, Clock, Edit3 
} from 'lucide-react';
import { Room } from '@/types/room';
import { getRoomById, recordRoomView } from '@/api/roomApi';
import { createOrGetConversation } from '@/api/chatApi';
import { createReportApi } from '@/api/reportApi';
import { useAuth } from '@/context/AuthContext';
import { useSavedPosts } from '@/context/SavedPostsContext';

import './page.css';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isSaved, toggleSavePost } = useSavedPosts();

  const [room, setRoom] = useState<Room | any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showPhone, setShowPhone] = useState(false);
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
        if (!data) return;

        setRoom(data);
        
        // 1. Xử lý an toàn mảng ảnh ngay từ API trả về để set ảnh đầu tiên
        let parsedImages: string[] = [];
        if (Array.isArray(data.images)) {
          parsedImages = data.images;
        } else if (typeof data.images === 'string') {
          try {
            parsedImages = JSON.parse(data.images);
          } catch {
            parsedImages = data.images.split(',').map((img: string) => img.trim());
          }
        }

        const firstImg = parsedImages[0] || data.thumbnail || data.image || '/placeholder-room.jpg';
        setSelectedImage(firstImg);

        // Ghi nhận lượt xem 1 lần duy nhất
        if (!hasRecordedRef.current) {
          hasRecordedRef.current = true;
          recordRoomView(numericRoomId);
        }
      })
      .catch((err) => console.error('Lỗi lấy thông tin phòng:', err))
      .finally(() => setLoading(false));
  }, [numericRoomId]);

  const getOwnerId = () => {
    return room?.user?.id || room?.userId || room?.user_id;
  };

  const handleContactLandlord = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để trao đổi với chủ nhà!');
      router.push('/login');
      return;
    }
    const ownerId = getOwnerId();
    if (user.id === ownerId) {
      alert('Đây là tin đăng của chính bạn!');
      return;
    }

    try {
      setSubmittingChat(true);
      await createOrGetConversation(ownerId, room.id);
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

  if (loading) return <div className="detail-loading">Đang tải thông tin phòng...</div>;
  if (!room) return <div className="detail-loading">Không tìm thấy phòng trọ này.</div>;

  // 2. Xử lý an toàn cho trường hợp images trả về là Array hoặc String trước khi render Gallery
  let imageList: string[] = [];
  if (Array.isArray(room.images)) {
    imageList = room.images;
  } else if (typeof room.images === 'string') {
    try {
      imageList = JSON.parse(room.images);
    } catch {
      imageList = (room.images as string).split(',').map((img) => img.trim());
    }
  }

  // Nếu vẫn rỗng thì mới fallback về thumbnail hoặc placeholder
  if (!imageList.length) {
    imageList = [room.thumbnail || room.image || '/placeholder-room.jpg'];
  }

  const isRoomSaved = isSaved(numericRoomId);
  const isOwner = user?.id === getOwnerId();

  return (
    <div className="room-detail-container">
      {/* 1. GALLERY HÌNH ẢNH */}
      <section className="gallery-section">
        <div className="main-image-wrapper">
          <img src={selectedImage} alt={room.title} className="main-image" />
        </div>
        <div className="thumbnail-list">
          {imageList.map((img: string, idx: number) => (
            <button 
              key={idx} 
              className={`thumb-btn ${selectedImage === img ? 'active' : ''}`}
              onClick={() => setSelectedImage(img)}
            >
              <img src={img} alt={`Ảnh ${idx + 1}`} />
            </button>
          ))}
        </div>
      </section>

      <div className="detail-layout">
        {/* LƯỚI BÊN TRÁI: THÔNG TIN PHÒNG */}
        <div className="left-content">
          <h1 className="room-title">{room.title}</h1>
          <p className="room-address" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={18} /> {room.address ? `${room.address}, ` : ''}{room.district_name || room.district}, {room.city_name || room.city}
          </p>

          <div className="stats-bar">
            <div className="stat-item">
              <span className="label">Giá thuê</span>
              <span className="value price">{Number(room.price).toLocaleString('vi-VN')} đ/tháng</span>
            </div>
            <div className="stat-item">
              <span className="label">Diện tích</span>
              <span className="value">{room.area} m²</span>
            </div>
            <div className="stat-item">
              <span className="label">Trạng thái</span>
              <span className="value status">Còn phòng</span>
            </div>
          </div>

          {/* 2. KHỐI TIỆN ÍCH */}
          <section className="amenities-section">
            <h3>Tiện ích phòng</h3>
            <div className="amenities-grid">
              <div className="amenity-item"><Wifi size={20} /> Wifi tốc độ cao</div>
              <div className="amenity-item"><AirVent size={20} /> Điều hòa</div>
              <div className="amenity-item"><Car size={20} /> Chỗ để xe rộng rãi</div>
              <div className="amenity-item"><Clock size={20} /> Giờ giấc tự do</div>
            </div>
          </section>

          {/* 3. MÔ TẢ CHI TIẾT */}
          <section className="description-section">
            <h3>Mô tả chi tiết</h3>
            <div className="description-text" style={{ whiteSpace: 'pre-line' }}>
              {room.content || room.description || 'Chưa có mô tả chi tiết.'}
            </div>
          </section>
        </div>

        {/* CỘT BÊN PHẢI: THÔNG TIN CHỦ NHÀ & ACTION */}
        <aside className="right-sidebar">
          <div className="host-card">
            <div className="host-header">
              <img 
                src={room.user?.avatar || '/default-avatar.png'} 
                alt={room.user?.full_name || 'Chủ nhà'} 
                className="host-avatar" 
              />
              <div className="host-info">
                <div className="host-name">
                  {room.user?.full_name || room.author_name || 'Chủ bài đăng'}
                  {room.user?.is_verified && (
                    <span className="verified-badge" title="Tài khoản đã xác thực">
                      <ShieldCheck size={16} /> Uy tín
                    </span>
                  )}
                </div>
                <span className="host-sub">Chủ bài đăng</span>
              </div>
            </div>

            <div className="action-buttons">
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
                    textDecoration: 'none'
                  }}
                >
                  <Edit3 size={18} /> Chỉnh sửa tin đăng này
                </Link>
              ) : (
                <button 
                  className="btn-primary"
                  onClick={handleContactLandlord}
                  disabled={submittingChat}
                  style={{ opacity: submittingChat ? 0.7 : 1, cursor: submittingChat ? 'not-allowed' : 'pointer' }}
                >
                  <MessageSquare size={18} /> {submittingChat ? 'Đang kết nối...' : 'Chat với chủ nhà'}
                </button>
              )}

              <button 
                className="btn-phone"
                onClick={() => setShowPhone(!showPhone)}
              >
                <Phone size={18} /> 
                {showPhone 
                  ? (room.user?.phone || '0987.654.321') 
                  : `${(room.user?.phone || '0987654321').slice(0, 4)}.xxx.xxx (Hiện số)`}
              </button>
            </div>

            <div className="sub-actions">
              <button 
                className="btn-sub" 
                onClick={() => toggleSavePost(room)}
                style={{ color: isRoomSaved ? '#dc2626' : 'inherit' }}
              >
                <Heart size={16} fill={isRoomSaved ? '#dc2626' : 'none'} /> 
                {isRoomSaved ? 'Đã lưu tin' : 'Lưu tin'}
              </button>
              
              {!isOwner && (
                <button className="btn-sub" onClick={() => setShowReportModal(true)}>
                  <Flag size={16} /> Báo cáo
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL BÁO CÁO VI PHẠM */}
      {showReportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', padding: '24px', borderRadius: '12px',
            width: '100%', maxWidth: '450px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
                width: '100%', padding: '10px', borderRadius: '6px',
                border: '1px solid #ccc', marginBottom: '16px', resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowReportModal(false)}
                disabled={submittingReport}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc',
                  background: '#f3f4f6', cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSendReport}
                disabled={submittingReport}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: 'none',
                  background: '#ef4444', color: '#fff', cursor: 'pointer'
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