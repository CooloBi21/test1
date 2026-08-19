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
  const response = await fetch(`${API_URL}/api/provinces`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách tỉnh/thành");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
};

// ========================================
// GET DISTRICTS
// ========================================

/**
 * Lấy tất cả danh sách Quận/Huyện
 */
export const getDistricts = async (): Promise<DistrictItem[]> => {
  const response = await fetch(`${API_URL}/api/districts`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách tất cả quận/huyện");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
};

/**
 * Lấy danh sách Quận/Huyện theo Mã Tỉnh
 */
export const getDistrictsByProvince = async (
  parentCode: string | number
): Promise<DistrictItem[]> => {
  if (!parentCode) return [];

  const response = await fetch(
    `${API_URL}/api/districts/by-province?parentCode=${parentCode}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Lỗi khi lấy danh sách quận/huyện theo tỉnh/thành");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.data || [];
};