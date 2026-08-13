// Kiểu dữ liệu Tỉnh/Thành & Quận/Huyện
export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  province_code: string;
}

// Kiểu dữ liệu Phòng trọ
export interface Room {
  id: number | string;
  title: string;
  price: number;
  area: number;
  address: string;
  province_code?: string;
  district_code?: string;
  image?: string;
  images?: string[];
  description?: string;
  created_at?: string;
}

// Kiểu dữ liệu Bộ lọc (Filter)
export interface FilterState {
  provinceCode: string;
  districtCode: string;
  minPrice: number | string;
  maxPrice: number | string;
  minArea: number | string;
  maxArea: number | string;
}