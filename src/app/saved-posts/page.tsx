'use client';

import Link from 'next/link';
import { Heart, Trash2, MapPin, ExternalLink, ArrowLeft } from 'lucide-react';
import { useSavedPosts } from '@/context/SavedPostsContext'; // 1. Import Global State
import './page.css';

export default function SavedPostsPage() {
  // 2. Lấy dữ liệu và hàm xóa từ Context thay vì tự tạo local state
  const { savedPosts, isLoading, removeSavedPost } = useSavedPosts();

  if (isLoading) {
    return (
      <div className="saved-posts-page" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: '#64748b' }}>Đang tải danh sách tin đã lưu...</p>
      </div>
    );
  }

  return (
    <div className="saved-posts-page">
      <div className="saved-posts-header">
        <div className="saved-posts-title-wrap">
          <Heart className="saved-posts-icon" size={28} fill="currentColor" />
          {/* Tự động lấy độ dài từ Global State */}
          <h1>Tin đã lưu ({savedPosts.length})</h1>
        </div>

        <Link href="/" className="back-link">
          <ArrowLeft size={16} />
          Về trang chủ
        </Link>
      </div>

      {savedPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Heart size={42} />
          </div>
          <h3>Chưa có tin đăng nào được lưu</h3>
          <p>
            Hãy nhấn vào biểu tượng trái tim ở các phòng trọ bạn quan tâm để xem lại sau.
          </p>
          <Link href="/" className="primary-btn">
            Khám phá phòng trọ
          </Link>
        </div>
      ) : (
        <div className="saved-posts-grid">
          {savedPosts.map((item) => {
            // Lấy dữ liệu room (trường hợp item bọc trong item.room hoặc trực tiếp item)
            const room = item.room || item;
            const roomId = room.id || item.room_id;
            const formattedPrice = Number(room.price || 0).toLocaleString('vi-VN');
            const locationText = [room.district, room.city].filter(Boolean).join(', ') || room.address || 'Toàn quốc';

            return (
              <article key={item.id || roomId} className="saved-post-card">
                <div className="saved-post-thumb-wrap">
                  <img
                    src={room.thumbnail || room.image || 'https://via.placeholder.com/400x250?text=No+Image'}
                    alt={room.title}
                    className="saved-post-thumb"
                  />
                  <span className="saved-post-badge">Đã lưu</span>
                </div>

                <div className="saved-post-body">
                  <h3 className="saved-post-title">{room.title}</h3>

                  <div className="saved-post-price">{formattedPrice} đ/tháng</div>

                  <div className="saved-post-meta">
                    <span>
                      <MapPin size={14} />
                      {locationText}
                    </span>
                    <span>{room.area} m²</span>
                  </div>

                  <div className="saved-post-actions">
                    <Link href={`/rooms/${roomId}`} className="view-btn">
                      <ExternalLink size={14} />
                      Xem ngay
                    </Link>

                    <button
                      type="button"
                      className="remove-btn"
                      // 3. Gọi hàm remove từ Context, UI sẽ tự động được cập nhật ở CẢ trang này và Navbar
                      onClick={() => removeSavedPost(roomId)}
                      title="Bỏ lưu"
                      aria-label="Bỏ lưu tin đăng"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}