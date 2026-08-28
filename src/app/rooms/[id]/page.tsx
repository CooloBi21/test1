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
import {
  deleteRoomPost,
  getRoomById,
  getRoomReviews,
  recordRoomView,
  replyToReviewAsOwner,
  submitReview,
  toggleReviewReaction,
  uploadRoomImages,
  type ReviewReactionType,
  type RoomReviewFilter,
  type RoomReviewSort,
} from '@/api/roomApi';
import { createOrGetConversation } from '@/api/chatApi';
import { createReportApi } from '@/api/reportApi';
import { useAuth } from '@/context/AuthContext';
import { useSavedPosts } from '@/context/SavedPostsContext';

import './page.css';

const PLACEHOLDER_IMAGE = '/placeholder-room.jpg';

type RoomReview = {
  id: number;
  user_id: number;
  room_id: number;
  rating: number;
  comment?: string | null;
  owner_reply?: string | null;
  owner_reply_at?: string | null;
  created_at?: string | null;
  verified_interaction?: boolean;
  images?: string[] | string;
  reactions?: Record<string, number>;
  current_user_reactions?: ReviewReactionType[];
  user?: {
    id?: number;
    full_name?: string | null;
    avatar?: string | null;
  };
};

const REVIEW_REACTIONS: Array<{
  type: ReviewReactionType;
  icon: string;
  label: string;
}> = [
  { type: 'helpful', icon: 'ðŸ‘', label: 'Há»¯u Ã­ch' },
  { type: 'like', icon: 'â¤ï¸', label: 'ThÃ­ch' },
  { type: 'trusted', icon: 'ðŸŽ¯', label: 'Uy tÃ­n' },
];

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
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return 'Thá»a thuáº­n';
  return `${numericPrice.toLocaleString('vi-VN')} Ä‘/thÃ¡ng`;
};

const formatArea = (area: Room['area']) => {
  const numericArea = Number(area || 0);
  if (!Number.isFinite(numericArea) || numericArea <= 0) return 'ChÆ°a cáº­p nháº­t';
  return `${numericArea.toLocaleString('vi-VN')} mÂ²`;
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
  if (!date) return 'ChÆ°a cÃ³ ngÃ y Ä‘Äƒng';
  const parts = toVietnamDateParts(date);
  return parts ? `${parts.day}/${parts.month}/${parts.year}` : 'ChÆ°a cÃ³ ngÃ y Ä‘Äƒng';
};

const formatPostedTime = (date: Date | null) => {
  if (!date) return 'BÃ i Ä‘Äƒng cÅ© chÆ°a cÃ³ dá»¯ liá»‡u thá»i gian';
  const parts = toVietnamDateParts(date);
  return parts ? `LÃºc ${parts.hour}:${parts.minute}` : 'BÃ i Ä‘Äƒng cÅ© chÆ°a cÃ³ dá»¯ liá»‡u thá»i gian';
};

const formatRelativePostedDate = (date: Date | null) => {
  if (!date) return '';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'Vá»«a Ä‘Äƒng';

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Vá»«a Ä‘Äƒng';
  if (diffMinutes < 60) return `${diffMinutes} phÃºt trÆ°á»›c`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giá» trÆ°á»›c`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngÃ y trÆ°á»›c`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} thÃ¡ng trÆ°á»›c`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} nÄƒm trÆ°á»›c`;
};

const getStatusText = (status?: string) => {
  switch (status) {
    case 'approved':
      return 'ÄÃ£ duyá»‡t';
    case 'pending':
      return 'Chá» duyá»‡t';
    case 'rejected':
      return 'Tá»« chá»‘i';
    default:
      return 'Äang hiá»ƒn thá»‹';
  }
};

const maskPhone = (phone?: string | null) => {
  if (!phone) return 'ChÆ°a cáº­p nháº­t SÄT';
  const compact = phone.replace(/\s+/g, '');
  if (compact.length <= 4) return phone;
  return `${compact.slice(0, 4)}.xxx.xxx (Hiá»‡n sá»‘)`;
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
  const [roomReviews, setRoomReviews] = useState<RoomReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSort, setReviewSort] = useState<RoomReviewSort>('latest');
  const [reviewFilter, setReviewFilter] = useState<RoomReviewFilter>('all');
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<number | null>(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewImages, setNewReviewImages] = useState<File[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

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
      .catch((err) => console.error('Lá»—i láº¥y thÃ´ng tin phÃ²ng:', err))
      .finally(() => setLoading(false));
  }, [numericRoomId]);

  useEffect(() => {
    if (!numericRoomId) return;

    setReviewsLoading(true);
    getRoomReviews(numericRoomId, { sort: reviewSort, filter: reviewFilter, viewerId: user?.id })
      .then((reviews) => setRoomReviews(reviews))
      .catch((err) => console.error('Loi tai danh sach danh gia:', err))
      .finally(() => setReviewsLoading(false));
  }, [numericRoomId, reviewSort, reviewFilter, user?.id]);

  const getOwnerId = () => {
    return room?.user?.id || room?.userId || room?.user_id;
  };

  const handleContactLandlord = async () => {
    if (!user) {
      alert('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ trao Ä‘á»•i vá»›i chá»§ nhÃ !');
      router.push('/login');
      return;
    }

    const ownerId = getOwnerId();
    if (String(user.id) === String(ownerId)) {
      alert('ÄÃ¢y lÃ  tin Ä‘Äƒng cá»§a chÃ­nh báº¡n!');
      return;
    }

    try {
      setSubmittingChat(true);
      await createOrGetConversation(ownerId, room.id);
      router.push('/chat');
    } catch (err) {
      console.error('Lá»—i khi táº¡o cuá»™c trÃ² chuyá»‡n:', err);
      alert('KhÃ´ng thá»ƒ táº¡o cuá»™c trÃ² chuyá»‡n vá»›i chá»§ nhÃ ');
    } finally {
      setSubmittingChat(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!user) {
      alert('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ xÃ³a bÃ i Ä‘Äƒng!');
      router.push('/login');
      return;
    }

    const ownerId = getOwnerId();
    if (String(user.id) !== String(ownerId)) {
      alert('Báº¡n khÃ´ng cÃ³ quyá»n xÃ³a bÃ i Ä‘Äƒng nÃ y.');
      return;
    }

    const confirmed = window.confirm(
      'Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a bÃ i Ä‘Äƒng nÃ y khÃ´ng? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c.'
    );
    if (!confirmed) return;

    try {
      setDeletingRoom(true);
      await deleteRoomPost(room.id);
      alert('ÄÃ£ xÃ³a bÃ i Ä‘Äƒng thÃ nh cÃ´ng.');
      router.push('/profile');
    } catch (error: any) {
      console.error('Lá»—i khi xÃ³a bÃ i Ä‘Äƒng:', error);
      alert(error.message || 'KhÃ´ng thá»ƒ xÃ³a bÃ i Ä‘Äƒng. Vui lÃ²ng thá»­ láº¡i.');
    } finally {
      setDeletingRoom(false);
    }
  };

  const handleSendReport = async () => {
    if (!user) {
      alert('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ gá»­i bÃ¡o cÃ¡o vi pháº¡m!');
      router.push('/login');
      return;
    }

    if (!reportReason.trim()) {
      alert('Vui lÃ²ng nháº­p lÃ½ do bÃ¡o cÃ¡o');
      return;
    }

    try {
      setSubmittingReport(true);
      await createReportApi(numericRoomId, reportReason);
      alert('BÃ¡o cÃ¡o cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c gá»­i thÃ nh cÃ´ng!');
      setShowReportModal(false);
      setReportReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'CÃ³ lá»—i xáº£y ra khi gá»­i bÃ¡o cÃ¡o');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) return <div className="detail-loading">Äang táº£i thÃ´ng tin phÃ²ng...</div>;
  if (!room) return <div className="detail-loading">KhÃ´ng tÃ¬m tháº¥y phÃ²ng trá» nÃ y.</div>;

  const imageList = getImageList(room);
  const amenities = getAmenities(room);
  const ownerId = getOwnerId();
  const ownerName = room.user?.full_name || room.author_name || room.author?.full_name || 'Chá»§ bÃ i Ä‘Äƒng';
  const ownerPhone = room.user?.phone;
  const isRoomSaved = isSaved(numericRoomId);
  const isOwner = user?.id !== undefined && ownerId !== undefined && String(user.id) === String(ownerId);
  const postedDate = getRoomCreatedDate(room);
  const relativePostedDate = formatRelativePostedDate(postedDate);
  const locationText = [room.address, room.district_name || room.district, room.city_name || room.city]
    .filter(Boolean)
    .join(', ');
  const averageRating = roomReviews.length
    ? roomReviews.reduce((total, review) => total + Number(review.rating || 0), 0) / roomReviews.length
    : 0;
  const averageRatingLabel = averageRating ? averageRating.toFixed(1) : 'ChÆ°a cÃ³';

  const handleOwnerReply = async (reviewId: number) => {
    const reply = replyDrafts[reviewId]?.trim();
    if (!reply) {
      alert('Vui lÃ²ng nháº­p ná»™i dung pháº£i há»“i.');
      return;
    }

    try {
      setSubmittingReplyId(reviewId);
      await replyToReviewAsOwner(reviewId, reply);
      const nextReviews = await getRoomReviews(numericRoomId, { sort: reviewSort, filter: reviewFilter, viewerId: user?.id });
      setRoomReviews(nextReviews);
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (error: any) {
      alert(error.message || 'KhÃ´ng thá»ƒ pháº£n há»“i Ä‘Ã¡nh giÃ¡. Vui lÃ²ng thá»­ láº¡i.');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ gá»­i Ä‘Ã¡nh giÃ¡.');
      router.push('/login');
      return;
    }

    if (isOwner) {
      alert('Báº¡n khÃ´ng thá»ƒ tá»± Ä‘Ã¡nh giÃ¡ bÃ i Ä‘Äƒng cá»§a chÃ­nh mÃ¬nh.');
      return;
    }

    try {
      setSubmittingReview(true);
      const uploadedReviewImages = newReviewImages.length ? await uploadRoomImages(newReviewImages) : [];
      await submitReview({
        room_id: numericRoomId,
        rating: newReviewRating,
        comment: newReviewComment.trim(),
        images: uploadedReviewImages,
      });
      setNewReviewComment('');
      setNewReviewImages([]);
      setNewReviewRating(5);
      setReviewSort('latest');
      setReviewFilter('all');
      const nextReviews = await getRoomReviews(numericRoomId, { sort: 'latest', filter: 'all', viewerId: user?.id });
      setRoomReviews(nextReviews);
    } catch (error: any) {
      alert(error.message || 'KhÃ´ng thá»ƒ gá»­i Ä‘Ã¡nh giÃ¡. Vui lÃ²ng thá»­ láº¡i.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleReaction = async (reviewId: number, reactionType: ReviewReactionType) => {
    if (!user) {
      alert('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ tháº£ cáº£m xÃºc.');
      router.push('/login');
      return;
    }

    try {
      const result = await toggleReviewReaction(reviewId, reactionType);
      setRoomReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                reactions: { ...(review.reactions || {}), ...(result.reactions || {}) },
                current_user_reactions: result.active
                  ? Array.from(new Set([...(review.current_user_reactions || []), reactionType]))
                  : (review.current_user_reactions || []).filter((type) => type !== reactionType),
              }
            : review
        )
      );
    } catch (error: any) {
      alert(error.message || 'KhÃ´ng thá»ƒ cáº­p nháº­t cáº£m xÃºc. Vui lÃ²ng thá»­ láº¡i.');
    }
  };

  return (
    <div className="room-detail-container">
      <section className="detail-hero">
        <div className="gallery-section">
          <div className="main-image-wrapper">
            <img src={selectedImage} alt={room.title} className="main-image" />
          </div>
          {imageList.length > 1 && (
            <div className="thumbnail-list" aria-label="Danh sÃ¡ch áº£nh phÃ²ng">
              {imageList.map((img: string, idx: number) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  className={`thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                  aria-label={`Xem áº£nh ${idx + 1}`}
                >
                  <img src={img} alt={`áº¢nh phÃ²ng ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hero-summary">
          <div className="summary-eyebrow">
            <Home size={16} />
            <span>Chi tiáº¿t phÃ²ng trá»</span>
          </div>
          <h1 className="room-title">{room.title}</h1>
          <p className="room-address">
            <MapPin size={18} />
            <span>{locationText || 'ChÆ°a cáº­p nháº­t Ä‘á»‹a chá»‰'}</span>
          </p>

          <div className="stats-bar">
            <div className="stat-item">
              <Banknote size={18} />
              <span className="label">GiÃ¡ thuÃª</span>
              <span className="value price">{formatPrice(room.price)}</span>
            </div>
            <div className="stat-item">
              <Ruler size={18} />
              <span className="label">Diá»‡n tÃ­ch</span>
              <span className="value">{formatArea(room.area)}</span>
            </div>
            <div className="stat-item posted-date-card">
              <CalendarDays size={18} />
              <div className="posted-date-content">
                <span className="label">NgÃ y Ä‘Äƒng</span>
                <span className="value">{formatPostedDate(postedDate)}</span>
                <span className="date-note">
                  {formatPostedTime(postedDate)}
                  {relativePostedDate ? ` Â· ${relativePostedDate}` : ''}
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
              <h2>Tiá»‡n Ã­ch phÃ²ng</h2>
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
                Chá»§ bÃ i Ä‘Äƒng chÆ°a cáº­p nháº­t danh sÃ¡ch tiá»‡n Ã­ch cho phÃ²ng nÃ y.
              </div>
            )}
          </section>

          <section className="detail-section description-section">
            <div className="section-heading">
              <CircleCheck size={20} />
              <h2>MÃ´ táº£ chi tiáº¿t</h2>
            </div>
            <div className="description-text">
              {room.content || room.description || 'ChÆ°a cÃ³ mÃ´ táº£ chi tiáº¿t.'}
            </div>
          </section>

          <section className="detail-section reviews-section">
            <div className="reviews-header">
              <div className="section-heading">
                <MessageSquare size={20} />
                <h2>ÄÃ¡nh giÃ¡ tá»« ngÆ°á»i thuÃª</h2>
              </div>
              <div className="reviews-summary">
                <span className="rating-score">{averageRatingLabel}</span>
                <span>{roomReviews.length} ÄÃ¡nh giÃ¡</span>
              </div>
            </div>

            {!isOwner && (
              <div className="review-compose">
                <div className="compose-row">
                  <label>
                    Äiá»ƒm Ä‘Ã¡nh giÃ¡
                    <select
                      value={newReviewRating}
                      onChange={(event) => setNewReviewRating(Number(event.target.value))}
                    >
                      <option value={5}>5/5 - Ráº¥t tá»‘t</option>
                      <option value={4}>4/5 - Tá»‘t</option>
                      <option value={3}>3/5 - Trung bÃ¬nh</option>
                      <option value={2}>2/5 - KÃ©m</option>
                      <option value={1}>1/5 - Ráº¥t kÃ©m</option>
                    </select>
                  </label>
                </div>

                <textarea
                  rows={4}
                  value={newReviewComment}
                  onChange={(event) => setNewReviewComment(event.target.value)}
                  placeholder="Chia sáº» tráº£i nghiá»‡m cá»§a báº¡n vá» phÃ²ng nÃ y..."
                />

                <div className="review-image-picker">
                  <label>
                    ThÃªm áº£nh thá»±c táº¿
                    <input
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.heic,.heif"
                      multiple
                      onChange={(event) => {
                        const files = Array.from(event.target.files || []).slice(0, 6);
                        setNewReviewImages(files);
                        event.target.value = '';
                      }}
                    />
                  </label>
                  {newReviewImages.length > 0 && (
                    <div className="review-image-names">
                      {newReviewImages.map((file) => (
                        <span key={`${file.name}-${file.size}`}>{file.name}</span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Äang gá»­i Ä‘Ã¡nh giÃ¡...' : 'Gá»­i Ä‘Ã¡nh giÃ¡'}
                </button>
              </div>
            )}

            <div className="reviews-toolbar">
              <label>
                Sáº¯p xáº¿p
                <select
                  value={reviewSort}
                  onChange={(event) => setReviewSort(event.target.value as RoomReviewSort)}
                >
                  <option value="latest">Má»›i nháº¥t</option>
                  <option value="rating_desc">ÄÃ¡nh giÃ¡ cao nháº¥t</option>
                  <option value="rating_asc">ÄÃ¡nh giÃ¡ tháº¥p nháº¥t</option>
                </select>
              </label>

              <label>
                Bá» lá»c
                <select
                  value={reviewFilter}
                  onChange={(event) => setReviewFilter(event.target.value as RoomReviewFilter)}
                >
                  <option value="all">Táº¥t cáº£ bÃ¬nh luáº­n</option>
                  <option value="with_reply">CÃ³ pháº£n há»“i tá»« chá»§ nhÃ </option>
                  <option value="with_images">CÃ³ hÃ¬nh áº£nh</option>
                </select>
              </label>
            </div>

            {reviewsLoading ? (
              <div className="reviews-empty">Äang táº£i danh sÃ¡ch Ä‘Ã¡nh giÃ¡...</div>
            ) : roomReviews.length > 0 ? (
              <div className="reviews-list">
                {roomReviews.map((review) => {
                  const reviewerName = review.user?.full_name || 'NgÆ°á»i dÃ¹ng';
                  const reviewerInitial = reviewerName.trim().charAt(0).toUpperCase() || 'U';
                  const replyDraft = replyDrafts[review.id] ?? review.owner_reply ?? '';
                  const reviewImages = parseStringList(review.images);

                  return (
                    <article className="review-card" key={review.id}>
                      <div className="review-topline">
                        <div className="reviewer-block">
                          {review.user?.avatar ? (
                            <img src={review.user.avatar} alt={reviewerName} className="reviewer-avatar" />
                          ) : (
                            <span className="reviewer-avatar reviewer-avatar-fallback">{reviewerInitial}</span>
                          )}
                          <div>
                            <div className="reviewer-name-row">
                              <span className="reviewer-name">{reviewerName}</span>
                              {review.verified_interaction && (
                                <span className="real-renter-badge">
                                  <ShieldCheck size={13} /> ÄÃ£ tá»«ng xem / liÃªn há»‡
                                </span>
                              )}
                            </div>
                            <span className="review-date">{formatPostedDate(parseDatabaseDate(review.created_at || undefined))}</span>
                          </div>
                        </div>

                        <div className="review-rating" aria-label={`${review.rating} trÃªn 5 Ä‘iá»ƒm`}>
                          {Number(review.rating || 0)}/5
                        </div>
                      </div>

                      <p className="review-comment">{review.comment || 'NgÆ°á»i dÃ¹ng chÆ°a Ä‘á»ƒ láº¡i ná»™i dung bÃ¬nh luáº­n.'}</p>

                      {reviewImages.length > 0 && (
                        <div className="review-image-grid">
                          {reviewImages.map((imageUrl, imageIndex) => (
                            <a
                              key={`${imageUrl}-${imageIndex}`}
                              href={imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="review-image-thumb"
                            >
                              <img src={imageUrl} alt={`áº¢nh Ä‘Ã¡nh giÃ¡ ${imageIndex + 1}`} />
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="review-reactions" aria-label="Cáº£m xÃºc cho Ä‘Ã¡nh giÃ¡">
                        {REVIEW_REACTIONS.map((reaction) => (
                          <button
                            key={reaction.type}
                            type="button"
                            className={`review-reaction-btn ${review.current_user_reactions?.includes(reaction.type) ? 'active' : ''}`}
                            onClick={() => handleToggleReaction(review.id, reaction.type)}
                          >
                            <span className="reaction-icon">{reaction.icon}</span>
                            <span>{reaction.label}</span>
                            <strong>{Number(review.reactions?.[reaction.type] || 0)}</strong>
                          </button>
                        ))}
                      </div>

                      {review.owner_reply && (
                        <div className="owner-reply-box">
                          <span className="owner-reply-label">Pháº£n há»“i tá»« chá»§ nhÃ </span>
                          <p>{review.owner_reply}</p>
                          {review.owner_reply_at && (
                            <span className="review-date">
                              {formatPostedDate(parseDatabaseDate(review.owner_reply_at))}
                            </span>
                          )}
                        </div>
                      )}

                      {isOwner && (
                        <div className="owner-reply-form">
                          <textarea
                            rows={3}
                            value={replyDraft}
                            onChange={(event) =>
                              setReplyDrafts((prev) => ({ ...prev, [review.id]: event.target.value }))
                            }
                            placeholder="Viáº¿t pháº£n há»“i ngáº¯n gá»n cho Ä‘Ã¡nh giÃ¡ nÃ y..."
                          />
                          <button
                            type="button"
                            onClick={() => handleOwnerReply(review.id)}
                            disabled={submittingReplyId === review.id}
                          >
                            {submittingReplyId === review.id ? 'Äang gá»­i...' : review.owner_reply ? 'Cáº­p nháº­t pháº£n há»“i' : 'Pháº£n há»“i'}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="reviews-empty">
                ChÆ°a cÃ³ Ä‘Ã¡nh giÃ¡ phÃ¹ há»£p vá»›i bá»™ lá»c hiá»‡n táº¡i.
              </div>
            )}
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
                    <span className="verified-badge" title="TÃ i khoáº£n Ä‘Ã£ xÃ¡c thá»±c">
                      <ShieldCheck size={15} /> Uy tÃ­n
                    </span>
                  )}
                </div>
                <span className="host-sub">Chá»§ bÃ i Ä‘Äƒng</span>
              </div>
            </div>

            <div className="action-buttons">
              {isOwner ? (
                <>
                  <Link href={`/rooms/${room.id}/edit`} className="btn-edit">
                    <Edit3 size={18} /> Chá»‰nh sá»­a tin Ä‘Äƒng nÃ y
                  </Link>
                  <button
                    type="button"
                    className="btn-delete-room"
                    onClick={handleDeleteRoom}
                    disabled={deletingRoom}
                  >
                    <Trash2 size={18} />
                    {deletingRoom ? 'Äang xÃ³a bÃ i Ä‘Äƒng...' : 'XÃ³a bÃ i Ä‘Äƒng nÃ y'}
                  </button>
                </>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleContactLandlord}
                  disabled={submittingChat}
                >
                  <MessageSquare size={18} />
                  {submittingChat ? 'Äang káº¿t ná»‘i...' : 'Chat vá»›i chá»§ nhÃ '}
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
                {isRoomSaved ? 'ÄÃ£ lÆ°u tin' : 'LÆ°u tin'}
              </button>

              {!isOwner && (
                <button className="btn-sub" onClick={() => setShowReportModal(true)}>
                  <Flag size={16} /> BÃ¡o cÃ¡o
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
              aria-label="ÄÃ³ng bÃ¡o cÃ¡o"
            >
              <X size={18} />
            </button>
            <div className="section-heading">
              <AlertTriangle size={20} />
              <h2>BÃ¡o cÃ¡o bÃ i Ä‘Äƒng vi pháº¡m</h2>
            </div>
            <p className="modal-desc">
              HÃ£y mÃ´ táº£ rÃµ lÃ½ do nhÆ° thÃ´ng tin sai sá»± tháº­t, dáº¥u hiá»‡u lá»«a Ä‘áº£o, hÃ¬nh áº£nh khÃ´ng Ä‘Ãºng hoáº·c ná»™i dung khÃ´ng phÃ¹ há»£p.
            </p>

            <textarea
              rows={5}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Nháº­p chi tiáº¿t lÃ½ do..."
              className="report-textarea"
            />

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setShowReportModal(false)}
                disabled={submittingReport}
              >
                Há»§y
              </button>
              <button
                type="button"
                className="btn-modal-danger"
                onClick={handleSendReport}
                disabled={submittingReport}
              >
                {submittingReport ? 'Äang gá»­i...' : 'Gá»­i bÃ¡o cÃ¡o'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
