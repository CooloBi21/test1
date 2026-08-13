import { ProvinceItem, DistrictItem } from "../components/Filter/Filter";

const API_URL: string =
  (import.meta.env.VITE_API_URL as string) ||
  "https://test1-be-845w.onrender.com";

// ========================================
// GET PROVINCES
// ========================================

/**
 * Lấy danh sách Tỉnh/Thành
 */
export const getProvinces = async (): Promise<Record<string, ProvinceItem>> => {
  const response = await fetch(`${API_URL}/api/provinces`);

  if (!response.ok) {
    throw new Error("Không thể lấy tỉnh/thành");
  }

  return response.json();
};

// ========================================
// GET DISTRICTS
// ========================================

/**
 * Lấy danh sách Quận/Huyện (có thể lọc theo Mã Tỉnh/Thành)
 */
export const getDistricts = async (
  parentCode: string | number | null = null
): Promise<Record<string, DistrictItem>> => {
  let url = `${API_URL}/api/districts`;

  // Nếu có tỉnh được chọn
  if (parentCode) {
    url = `${API_URL}/api/districts/by-province?parentCode=${encodeURIComponent(
      String(parentCode)
    )}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Không thể lấy quận/huyện");
  }

  return response.json();
};