'use client';

import React from 'react';
import Link from 'next/link';
import { Room } from '@/types/room';
import { useSavedPosts } from '@/context/SavedPostsContext';
import './RoomCard.css';

interface RoomCardProps {
  room: Room;
  cityName?: string;
  districtName?: string;
}

const NEW_ROOM_WINDOW_MS = 72 * 60 * 60 * 1000;

const parseRoomCreatedDate = (value?: string | Date) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const trimmedValue = String(value).trim();
  const hasTimezone = /(Z|[+-]\d{2}:?\d{2})$/.test(trimmedValue);

  if (hasTimezone) {
    const date = new Date(trimmedValue);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const match = trimmedValue.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/
  );

  if (match) {
    const [, year, month, day, hour, minute, second = '0'] = match;
    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      )
    );
  }

  const date = new Date(trimmedValue);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isNewRoom = (room: Room) => {
  const createdDate = parseRoomCreatedDate(room.created_at || room.createdAt);
  if (!createdDate) return false;

  const ageMs = Date.now() - createdDate.getTime();

  return ageMs >= 0 && ageMs <= NEW_ROOM_WINDOW_MS;
};

const RoomCard: React.FC<RoomCardProps> = ({ room, cityName, districtName }) => {
  const { isSaved, toggleSavePost } = useSavedPosts();

  const detailUrl = room.id ? `/rooms/${room.id}` : '#';
  // Lấy ảnh từ mảng images (vì API đăng tin ở trên ta lưu vào `images`), nếu không có thì fallback
  const imageUrl = room.images?.[0] || room.image || room.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image';
  const contentText = room.description || room.content || '';
  const formattedPrice = Number(room.price || 0).toLocaleString('vi-VN');
  
  const locationText = [
    districtName !== 'Không xác định' ? districtName : '',
    cityName !== 'Không xác định' ? cityName : room.address || 'Toàn quốc'
  ].filter(Boolean).join(', ');

  const currentlySaved = room.id ? isSaved(Number(room.id)) : false;
  const showNewBadge = isNewRoom(room);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!room.id) return;
    await toggleSavePost(room);
  };

  // Giả định backend trả về thông tin người đăng trong object user hoặc author
  // Ví dụ: room.user.full_name hoặc room.author_name
  const authorName =
    room.user?.full_name || (room as any).author?.full_name || (room as any).author_name || 'Chủ bài đăng';
  const authorInitial = authorName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <article className="room-card surface-card">
      <div className="room-image-wrapper">
        <Link href={detailUrl}>
          <img src={imageUrl} alt={room.title} className="room-image" loading="lazy" />
        </Link>
        {showNewBadge && <span className="room-tag-badge">Mới</span>}
        <button 
          className={`save-btn ${currentlySaved ? 'saved' : ''}`}
          onClick={handleToggleSave}
          title={currentlySaved ? "Đã lưu tin" : "Lưu tin này"}
          type="button"
        >
          ♥
        </button>
      </div>

      <div className="room-info">
        <h3 className="room-title">
          <Link href={detailUrl}>{room.title}</Link>
        </h3>

        <div className="room-meta-row">
          <div className="room-price">
            {formattedPrice} <span className="price-unit">đ/tháng</span>
          </div>
          <div className="room-area-badge">
            📐 {room.area} m²
          </div>
        </div>

        <div className="room-location">
          <span className="loc-icon">📍</span>
          <span>{locationText || 'Chưa cập nhật địa chỉ'}</span>
        </div>

        {contentText && <p className="room-content">{contentText}</p>}

        <div className="room-card-footer">
          {/* HIỂN THỊ NGƯỜI ĐĂNG TẠI ĐÂY */}
          <div className="room-author">
            {room.user?.avatar ? (
              <img src={room.user.avatar} alt={authorName} className="author-avatar-img" />
            ) : (
              <span className="author-avatar">{authorInitial}</span>
            )}
            <span className="author-name">{authorName}</span>
          </div>
          
          <Link href={detailUrl} className="view-detail-link">
            Xem chi tiết →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default RoomCard;
