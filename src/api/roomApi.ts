import { Room, RoomFilterParams } from '@/types/room';

const API_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Helper lấy token thông minh (Quét tất cả các key lưu trữ phổ biến)
 */
const getToken = (token?: string): string | null => {
  if (token) return token;
  if (typeof window === 'undefined') return null;

  // 1. Kiểm tra các key chuỗi token trực tiếp
  const directToken =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('auth_token');

  if (directToken) return directToken;

  // 2. Kiểm tra nếu token nằm bọc bên trong object 'user' hoặc 'auth'
  try {
    const userStr = localStorage.getItem('user') || localStorage.getItem('auth');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      return parsed.token || parsed.access_token || parsed.accessToken || null;
    }
  } catch {
    // Bỏ qua nếu parse JSON thất bại
  }

  return null;
};

/**
 * Helper lấy Auth Header chứa Token cho fetch API
 */
const getAuthHeaders = (token?: string): HeadersInit => {
  const jwt = getToken(token);
  return {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };
};

/* ==========================================================================
   1. QUẢN LÝ PHÒNG TRỌ (ROOMS)
   ========================================================================== */

export const getRooms = async (params: RoomFilterParams = {}): Promise<Room[]> => {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });

    const response = await fetch(`${API_URL}/api/rooms?${query.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) return [];
    const result = await response.json();

    // Tự động giải bọc nếu backend trả về { total, data } hoặc array thuần
    if (result && Array.isArray(result.data)) {
      return result.data;
    }
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Lỗi khi tải danh sách phòng trọ:', error);
    return [];
  }
};

export const getRoomById = async (id: number | string): Promise<Room | null> => {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${id}`, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Lỗi lấy thông tin phòng ${id}:`, error);
    return null;
  }
};

/* ==========================================================================
   2. TIN ĐÃ LƯU (SAVED POSTS)
   ========================================================================== */

export const toggleSavePost = async (
  roomId: number,
): Promise<{ saved: boolean }> => {
  const response = await fetch(`${API_URL}/api/saved-posts`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ room_id: roomId }),
  });

  if (!response.ok) {
    throw new Error('Thao tác lưu bài viết thất bại');
  }

  return response.json();
};

export const checkIsSaved = async (roomId: number): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_URL}/api/saved-posts/check/${roomId}`,
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) return false;

    return await response.json();
  } catch {
    return false;
  }
};

export const getSavedPosts = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/api/saved-posts`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Lỗi lấy danh sách tin đã lưu:', error);
    return [];
  }
};

/* ==========================================================================
   3. LỊCH SỬ XEM (ROOM VIEWS)
   ========================================================================== */

export const recordRoomView = async (roomId: number): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/room-views`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room_id: roomId }),
    });
  } catch (error) {
    console.error('Lỗi ghi nhận lượt xem:', error);
  }
};

export const getViewHistory = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/api/room-views`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Lỗi lấy lịch sử xem:', error);
    return [];
  }
};

export const deleteHistoryItem = async (roomId: number): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/room-views/${roomId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Lỗi xóa lịch sử:', error);
  }
};

export const clearAllHistory = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/room-views`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Lỗi xóa toàn bộ lịch sử:', error);
  }
};

/* ==========================================================================
   4. ĐÁNH GIÁ (REVIEWS)
   ========================================================================== */

export type ReviewReactionType = 'helpful' | 'like' | 'trusted';

export const toggleReviewReaction = async (
  reviewId: number | string,
  type: ReviewReactionType,
): Promise<{ reactions?: Record<string, number>; active?: boolean }> => {
  const response = await fetch(
    `${API_URL}/api/reviews/${reviewId}/reactions`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Thao tác thả cảm xúc thất bại');
  }

  return response.json();
};

export const submitReview = async (
  data: { room_id: number; rating: number; comment?: string; images?: string[] },
): Promise<any> => {
  const response = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Gửi đánh giá thất bại');
  return response.json();
};

export type RoomReviewSort = 'latest' | 'rating_desc' | 'rating_asc';
export type RoomReviewFilter = 'all' | 'with_reply';

export const getRoomReviews = async (
  roomId: number | string,
  options: { sort?: RoomReviewSort; filter?: RoomReviewFilter; viewerId?: number | string } = {}
): Promise<any[]> => {
  try {
    const query = new URLSearchParams();
    if (options.sort) query.set('sort', options.sort);
    if (options.filter) query.set('filter', options.filter);
    if (options.viewerId) query.set('viewerId', String(options.viewerId));

    const response = await fetch(`${API_URL}/api/reviews/room/${roomId}?${query.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) return [];
    const result = await response.json();
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Lỗi khi tải danh sách đánh giá:', error);
    return [];
  }
};

export const replyToReviewAsOwner = async (
  reviewId: number | string,
  reply: string,
): Promise<any> => {
  const response = await fetch(`${API_URL}/api/reviews/${reviewId}/owner-reply`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reply }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Phản hồi đánh giá thất bại');
  }

  return response.json();
};

export const getMyReviews = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/api/reviews/my-reviews`, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
};

export const deleteReview = async (reviewId: number): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/reviews/${reviewId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Lỗi xóa đánh giá:', error);
  }
};

/* ==========================================================================
   5. ĐĂNG, CẬP NHẬT VÀ XÓA TIN PHÒNG TRỌ (POST / PUT / DELETE ROOM)
   ========================================================================== */

export const createRoomPost = async (roomData: any): Promise<any> => {
  const response = await fetch(`${API_URL}/api/rooms`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roomData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Đăng tin thất bại. Vui lòng thử lại.');
  }

  return response.json();
};

export const uploadRoomImages = async (files: File[]): Promise<string[]> => {
  if (!files.length) return [];

  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await fetch(`${API_URL}/api/rooms/images`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Upload ảnh thất bại. Vui lòng thử lại.');
  }

  const result = await response.json();
  return Array.isArray(result.urls) ? result.urls : [];
};

export const updateRoomPost = async (
  roomId: number | string,
  roomData: any,
  token?: string
): Promise<any> => {
  const jwt = getToken(token);
  if (!jwt) throw new Error('Vui lòng đăng nhập để cập nhật bài đăng');

  const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
    method: 'PUT',
    headers: getAuthHeaders(jwt),
    body: JSON.stringify(roomData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Cập nhật tin đăng thất bại.');
  }

  return response.json();
};

export const deleteRoomPost = async (
  roomId: number | string,
  token?: string
): Promise<any> => {
  const jwt = getToken(token);
  if (!jwt) throw new Error('Vui lòng đăng nhập để xóa bài đăng');

  const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(jwt),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Xóa tin đăng thất bại.');
  }

  return response.json();
};

export const getMyRooms = async (token?: string): Promise<Room[]> => {
  const jwt = getToken(token);
  if (!jwt) return [];

  try {
    const response = await fetch(`${API_URL}/api/rooms/my-rooms`, {
      headers: getAuthHeaders(jwt),
      cache: 'no-store',
    });

    if (!response.ok) return [];
    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài đăng cá nhân:', error);
    return [];
  }
};

/* ==========================================================================
   6. QUẢN TRỊ VIÊN (ADMIN API)
   ========================================================================== */

export const updateRoomStatus = async (
  id: number | string,
  status: 'approved' | 'rejected',
  token?: string
): Promise<any> => {
  const jwt = getToken(token);
  if (!jwt) throw new Error('Vui lòng đăng nhập với quyền Admin để thực hiện');

  const response = await fetch(`${API_URL}/api/admin/rooms/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(jwt),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Lỗi khi cập nhật trạng thái bài đăng');
  }

  return response.json();
};

// Aliases hỗ trợ linh hoạt cho các tên gọi hàm khác nhau
export const createRoom = createRoomPost;
export const updateRoom = updateRoomPost;
export const deleteRoom = deleteRoomPost;
