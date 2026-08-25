// Định nghĩa interface cho người đăng bài (mới thêm)
export interface RoomOwner {
  id: number | string;
  full_name: string;
  phone: string;
  avatar?: string;
  is_verified?: boolean;
}

export interface Province {
  code: string | number;
  name?: string;
  name_with_type?: string;
}

export interface District {
  code: string | number;
  name?: string;
  name_with_type?: string;
  province_code?: string | number;
}

export interface Room {
  id: number | string;
  userId?: number | string;
  title: string;
  price: number | string;
  area: number | string;
  address?: string;
  province_code?: string | number;
  district_code?: string | number;
  city?: string | number;
  district?: string | number;
  city_name?: string;
  district_name?: string;
  
  // Hình ảnh
  image?: string;
  thumbnail?: string;
  images?: string[] | string;
  
  // Tiện ích (mới thêm)
  amenities?: string[];
  
  // Nội dung
  description?: string;
  content?: string;
  
  // Thời gian
  created_at?: string;
  createdAt?: string;
  
  // --- THÔNG TIN NGƯỜI ĐĂNG (Cập nhật sử dụng RoomOwner) ---
  user?: RoomOwner;
  
  // Giữ lại author cho tương thích ngược nếu có component cũ đang dùng
  author?: {
    id?: number | string;
    full_name?: string;
  };
  author_name?: string;
}

export interface RoomFilterParams {
  city?: string | number;
  district?: string | number;
  minPrice?: string | number;
  maxPrice?: string | number;
  minArea?: string | number;
  maxArea?: string | number;
  userId?: number | string;
  [key: string]: any;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'area-desc';