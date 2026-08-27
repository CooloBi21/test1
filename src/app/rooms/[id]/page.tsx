'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  AirVent,
  Banknote,
  Bath,
  BatteryCharging,
  BedDouble,
  Building2,
  CalendarDays,
  Camera,
  Car,
  CircleCheck,
  Clock,
  DoorOpen,
  Edit3,
  Flag,
  Heart,
  Home,
  KeyRound,
  MapPin,
  MessageSquare,
  PawPrint,
  Phone,
  Refrigerator,
  Ruler,
  ShieldCheck,
  Shirt,
  Sparkles,
  Trash2,
  Utensils,
  WashingMachine,
  Wifi,
  Wind,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Room } from '@/types/room';
import { deleteRoomPost, getRoomById, recordRoomView } from '@/api/roomApi';
import { createOrGetConversation } from '@/api/chatApi';
import { createReportApi } from '@/api/reportApi';
import { useAuth } from '@/context/AuthContext';
import { useSavedPosts } from '@/context/SavedPostsContext';

import './page.css';

const PLACEHOLDER_IMAGE = '/placeholder-room.jpg';

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const parseStringList = (value: unknown): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => parseStringList(item))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [String(value)].filter(Boolean);
  }

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parseStringList(parsed);
  } catch {
    // Fall through to separator-based parsing.
  }

  return trimmed
    .split(/[,;\n|]+/)
    .map((item) => item.replace(/^["'\s]+|["'\s]+$/g, '').trim())
    .filter(Boolean);
};

const getImageList = (room: Room | any): string[] => {
  const images = parseStringList(room?.images);
  const fallback = room?.thumbnail || room?.image || PLACEHOLDER_IMAGE;
  return images.length ? images : [fallback];
};

const getAmenities = (room: Room | any): string[] => {
  const rawAmenities = [
    room?.amenities,
    room?.utilities,
    room?.facilities,
    room?.conveniences,
    room?.features,
  ];

  const unique = new Map<string, string>();
  rawAmenities.flatMap(parseStringList).forEach((item) => {
    const label = item.trim();
    if (!label) return;
    unique.set(normalizeText(label), label);
  });

  return Array.from(unique.values());
};

const getAmenityIcon = (label: string): LucideIcon => {
  const text = normalizeText(label);
  const iconRules: Array<[string[], LucideIcon]> = [
    [['wifi', 'internet', 'mang'], Wifi],
    [['dieu hoa', 'may lanh', 'air conditioner'], AirVent],
    [['nuoc nong', 'nong lanh'], Bath],
    [['quat', 'thong gio'], Wind],
    [['giu xe', 'de xe', 'parking', 'xe may', 'oto', 'o to'], Car],
    [['sac xe dien', 'o sac', 'xe dien'], BatteryCharging],
    [['gio giac', 'tu do', '24/7'], Clock],
    [['camera', 'an ninh'], Camera],
    [['bao ve', 'security'], ShieldCheck],
    [['khong chung chu'], DoorOpen],
    [['bep', 'nau an', 'kitchen'], Utensils],
    [['may giat', 'giat'], WashingMachine],
    [['tu lanh'], Refrigerator],
    [['tu quan ao'], Shirt],
    [['wc', 've sinh', 'phong tam', 'nha tam'], Bath],
    [['giuong', 'nem', 'noi that'], BedDouble],
    [['khoa', 'van tay', 'ra vao'], KeyRound],
    [['the tu'], KeyRound],
    [['thang may'], Building2],
    [['ban cong', 'cua so'], Wind],
    [['thu cung', 'pet'], PawPrint],
    [['san', 'tap', 'gym'], Sparkles],
  ];

  return iconRules.find(([keywords]) => keywords.some((keyword) => text.includes(keyword)))?.[1] || CircleCheck;
};

const formatPrice = (price: Room['price']) => {
  const numericPrice = Number(price || 0);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return 'Thỏa thuận';
  return `${numericPrice.toLocaleString('vi-VN')} đ/tháng`;
};

const formatArea = (area: Room['area']) => {
  const numericArea = Number(area || 0);
  if (!Number.isFinite(numericArea) || numericArea <= 0) return 'Chưa cập nhật';
  return `${numericArea.toLocaleString('vi-VN')} m²`;
};

const VIETNAM_TIME_OFFSET_MS = 7 * 60 * 60 * 1000;

const parseDatabaseDate = (value?: string | Date) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

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

const getRoomCreatedDate = (room?: Room | null) => parseDatabaseDate(room?.created_at || room?.createdAt);

const toVietnamDateParts = (date: Date | null) => {
  if (!date) return null;

  const vietnamDate = new Date(date.getTime() + VIETNAM_TIME_OFFSET_MS);
  const pad = (value: number) => String(value).padStart(2, '0');

  return {
    day: pad(vietnamDate.getUTCDate()),
    month: pad(vietnamDate.getUTCMonth() + 1),
    year: vietnamDate.getUTCFullYear(),
    hour: pad(vietnamDate.getUTCHours()),
    minute: pad(vietnamDate.getUTCMinutes()),
  };
};

const formatPostedDate = (date: Date | null) => {
  if (!date) return 'Chưa có ngày đăng';
  const parts = toVietnamDateParts(date);
  return parts ? `${parts.day}/${parts.month}/${parts.year}` : 'Chưa có ngày đăng';
};

const formatPostedTime = (date: Date | null) => {
  if (!date) return 'Bài đăng cũ chưa có dữ liệu thời gian';
  const parts = toVietnamDateParts(date);
  return parts ? `Lúc ${parts.hour}:${parts.minute}` : 'Bài đăng cũ chưa có dữ liệu thời gian';
};

const formatRelativePostedDate = (date: Date | null) => {
  if (!date) return '';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'Vừa đăng';

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Vừa đăng';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} tháng trước`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} năm trước`;
};

const getStatusText = (status?: string) => {
  switch (status) {
    case 'approved':
      return 'Đã duyệt';
    case 'pending':
      return 'Chờ duyệt';
    case 'rejected':
      return 'Từ chối';
    default:
      return 'Đang hiển thị';
  }
};

const maskPhone = (phone?: string | null) => {
  if (!phone) return 'Chưa cập nhật SĐT';
  const compact = phone.replace(/\s+/g, '');
  if (compact.length <= 4) return phone;
  return `${compact.slice(0, 4)}.xxx.xxx (Hiện số)`;
};

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);

  const numericRoomId = Number(params?.id);
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    if (!numericRoomId) return;

    getRoomById(numericRoomId)
      .then((data) => {
        if (!data) return;

        setRoom(data);
        setSelectedImage(getImageList(data)[0]);

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
    if (String(user.id) === String(ownerId)) {
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

  const handleDeleteRoom = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để xóa bài đăng!');
      router.push('/login');
      return;
    }

    const ownerId = getOwnerId();
    if (String(user.id) !== String(ownerId)) {
      alert('Bạn không có quyền xóa bài đăng này.');
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác.'
    );
    if (!confirmed) return;

    try {
      setDeletingRoom(true);
      await deleteRoomPost(room.id);
      alert('Đã xóa bài đăng thành công.');
      router.push('/profile');
    } catch (error: any) {
      console.error('Lỗi khi xóa bài đăng:', error);
      alert(error.message || 'Không thể xóa bài đăng. Vui lòng thử lại.');
    } finally {
      setDeletingRoom(false);
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

  const imageList = getImageList(room);
  const amenities = getAmenities(room);
  const ownerId = getOwnerId();
  const ownerName = room.user?.full_name || room.author_name || room.author?.full_name || 'Chủ bài đăng';
  const ownerPhone = room.user?.phone;
  const isRoomSaved = isSaved(numericRoomId);
  const isOwner = user?.id !== undefined && ownerId !== undefined && String(user.id) === String(ownerId);
  const postedDate = getRoomCreatedDate(room);
  const relativePostedDate = formatRelativePostedDate(postedDate);
  const locationText = [room.address, room.district_name || room.district, room.city_name || room.city]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="room-detail-container">
      <section className="detail-hero">
        <div className="gallery-section">
          <div className="main-image-wrapper">
            <img src={selectedImage} alt={room.title} className="main-image" />
          </div>
          {imageList.length > 1 && (
            <div className="thumbnail-list" aria-label="Danh sách ảnh phòng">
              {imageList.map((img: string, idx: number) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  className={`thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                  aria-label={`Xem ảnh ${idx + 1}`}
                >
                  <img src={img} alt={`Ảnh phòng ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hero-summary">
          <div className="summary-eyebrow">
            <Home size={16} />
            <span>Chi tiết phòng trọ</span>
          </div>
          <h1 className="room-title">{room.title}</h1>
          <p className="room-address">
            <MapPin size={18} />
            <span>{locationText || 'Chưa cập nhật địa chỉ'}</span>
          </p>

          <div className="stats-bar">
            <div className="stat-item">
              <Banknote size={18} />
              <span className="label">Giá thuê</span>
              <span className="value price">{formatPrice(room.price)}</span>
            </div>
            <div className="stat-item">
              <Ruler size={18} />
              <span className="label">Diện tích</span>
              <span className="value">{formatArea(room.area)}</span>
            </div>
            <div className="stat-item posted-date-card">
              <CalendarDays size={18} />
              <div className="posted-date-content">
                <span className="label">Ngày đăng</span>
                <span className="value">{formatPostedDate(postedDate)}</span>
                <span className="date-note">
                  {formatPostedTime(postedDate)}
                  {relativePostedDate ? ` · ${relativePostedDate}` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="detail-layout">
        <div className="left-content">
          <section className="detail-section amenities-section">
            <div className="section-heading">
              <Sparkles size={20} />
              <h2>Tiện ích phòng</h2>
            </div>

            {amenities.length > 0 ? (
              <div className="amenities-grid">
                {amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div className="amenity-item" key={amenity}>
                      <Icon size={20} />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="amenities-empty">
                <CircleCheck size={20} />
                Chủ bài đăng chưa cập nhật danh sách tiện ích cho phòng này.
              </div>
            )}
          </section>

          <section className="detail-section description-section">
            <div className="section-heading">
              <CircleCheck size={20} />
              <h2>Mô tả chi tiết</h2>
            </div>
            <div className="description-text">
              {room.content || room.description || 'Chưa có mô tả chi tiết.'}
            </div>
          </section>
        </div>

        <aside className="right-sidebar">
          <div className="host-card">
            <div className="status-pill">
              <CircleCheck size={16} />
              {getStatusText(room.status)}
            </div>

            <div className="host-header">
              <img
                src={room.user?.avatar || '/default-avatar.png'}
                alt={ownerName}
                className="host-avatar"
              />
              <div className="host-info">
                <div className="host-name">
                  {ownerName}
                  {room.user?.is_verified && (
                    <span className="verified-badge" title="Tài khoản đã xác thực">
                      <ShieldCheck size={15} /> Uy tín
                    </span>
                  )}
                </div>
                <span className="host-sub">Chủ bài đăng</span>
              </div>
            </div>

            <div className="action-buttons">
              {isOwner ? (
                <>
                  <Link href={`/rooms/${room.id}/edit`} className="btn-edit">
                    <Edit3 size={18} /> Chỉnh sửa tin đăng này
                  </Link>
                  <button
                    type="button"
                    className="btn-delete-room"
                    onClick={handleDeleteRoom}
                    disabled={deletingRoom}
                  >
                    <Trash2 size={18} />
                    {deletingRoom ? 'Đang xóa bài đăng...' : 'Xóa bài đăng này'}
                  </button>
                </>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleContactLandlord}
                  disabled={submittingChat}
                >
                  <MessageSquare size={18} />
                  {submittingChat ? 'Đang kết nối...' : 'Chat với chủ nhà'}
                </button>
              )}

              <button
                className="btn-phone"
                onClick={() => ownerPhone && setShowPhone(!showPhone)}
                disabled={!ownerPhone}
              >
                <Phone size={18} />
                {showPhone && ownerPhone ? ownerPhone : maskPhone(ownerPhone)}
              </button>
            </div>

            <div className="sub-actions">
              <button
                className={`btn-sub ${isRoomSaved ? 'saved' : ''}`}
                onClick={() => toggleSavePost(room)}
              >
                <Heart size={16} fill={isRoomSaved ? 'currentColor' : 'none'} />
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

      {showReportModal && (
        <div className="report-modal-backdrop" role="dialog" aria-modal="true">
          <div className="report-modal">
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowReportModal(false)}
              aria-label="Đóng báo cáo"
            >
              <X size={18} />
            </button>
            <div className="section-heading">
              <AlertTriangle size={20} />
              <h2>Báo cáo bài đăng vi phạm</h2>
            </div>
            <p className="modal-desc">
              Hãy mô tả rõ lý do như thông tin sai sự thật, dấu hiệu lừa đảo, hình ảnh không đúng hoặc nội dung không phù hợp.
            </p>

            <textarea
              rows={5}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Nhập chi tiết lý do..."
              className="report-textarea"
            />

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setShowReportModal(false)}
                disabled={submittingReport}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-modal-danger"
                onClick={handleSendReport}
                disabled={submittingReport}
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
