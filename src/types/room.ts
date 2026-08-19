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
  userId: number;
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
  image?: string;
  thumbnail?: string;
  images?: string[];
  description?: string;
  content?: string;
  created_at?: string;
  
  // --- THÊM CÁC TRƯỜNG THÔNG TIN NGƯỜI ĐĂNG ---
  user?: {
    id?: number | string;
    full_name?: string;
    avatar?: string;
  };
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