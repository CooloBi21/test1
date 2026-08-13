import { RoomWithLocation } from "../components/RoomList/RoomList";

export interface RoomFilterParams {
  city?: string | number;
  district?: string | number;
  price?: string;
  area?: string;
  [key: string]: string | number | undefined | null;
}

// Lấy URL Backend từ biến môi trường
const API_URL: string =
  (import.meta.env.VITE_API_URL as string) ||
  "https://test1-be-845w.onrender.com";

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

  return response.json();
};