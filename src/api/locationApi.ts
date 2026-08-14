import { ProvinceItem, DistrictItem } from "../components/Filter/Filter";

const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ========================================
// GET PROVINCES
// ========================================

/**
 * Lấy danh sách Tỉnh/Thành
 */
export const getProvinces = async (): Promise<ProvinceItem[]> => {
  const response = await fetch(`${API_URL}/api/provinces`);

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách tỉnh/thành");
  }

  return response.json();
};

// ========================================
// GET DISTRICTS
// ========================================

/**
 * Lấy tất cả danh sách Quận/Huyện
 */
export const getDistricts = async (): Promise<DistrictItem[]> => {
  const response = await fetch(`${API_URL}/api/districts`);

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách tất cả quận/huyện");
  }

  return response.json();
};

/**
 * Lấy danh sách Quận/Huyện theo Mã Tỉnh
 */
export const getDistrictsByProvince = async (parentCode: string): Promise<DistrictItem[]> => {
  if (!parentCode) return [];

  const response = await fetch(
    `${API_URL}/api/districts/by-province?parentCode=${parentCode}`
  );

  if (!response.ok) {
    throw new Error("Lỗi khi lấy danh sách quận/huyện theo tỉnh/thành");
  }

  return response.json();
};