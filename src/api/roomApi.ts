import { RoomWithLocation } from "../components/RoomList/RoomList";

export interface RoomFilterParams {
  city?: string | number;
  district?: string | number;
  minPrice?: string | number;
  maxPrice?: string | number;
  minArea?: string | number;
  maxArea?: string | number;
  [key: string]: any;
}

// Cấu hình URL gọi tới NestJS Backend
const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ========================================
// GET ROOMS
// ========================================

/**
 * Lấy danh sách phòng trọ theo bộ lọc (Query Params)
 */
export const getRooms = async (
  params: RoomFilterParams = {}
): Promise<RoomWithLocation[]> => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const response = await fetch(`${API_URL}/api/rooms?${query.toString()}`);

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách phòng");
  }

  const result = await response.json();

  // Đảm bảo tương thích: NestJS trả về { total, data: [...] }
  return Array.isArray(result) ? result : result.data || [];
};