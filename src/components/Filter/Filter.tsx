import React from "react";
import "./Filter.css";

export interface ProvinceItem {
  code: string | number;
  name?: string;
  name_with_type?: string;
}

export interface DistrictItem {
  code: string | number;
  name?: string;
  name_with_type?: string;
  parent_code?: string | number;
}

interface FilterProps {
  provinces: Record<string, ProvinceItem> | ProvinceItem[];
  districts: Record<string, DistrictItem> | DistrictItem[];
  selectedCity: string;
  selectedDistrict: string;
  selectedPrice: string;
  selectedArea: string;
  loading?: boolean;
  onCityChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

const Filter: React.FC<FilterProps> = ({
  provinces,
  districts,
  selectedCity,
  selectedDistrict,
  selectedPrice,
  selectedArea,
  loading = false,
  onCityChange,
  onDistrictChange,
  onPriceChange,
  onAreaChange,
  onFilter,
  onReset,
}) => {
  const provinceList: ProvinceItem[] = provinces
    ? Array.isArray(provinces)
      ? provinces
      : Object.values(provinces)
    : [];

  const districtList: DistrictItem[] = districts
    ? Array.isArray(districts)
      ? districts
      : Object.values(districts)
    : [];

  const hasActiveFilter = Boolean(selectedCity || selectedDistrict || selectedPrice || selectedArea);

  return (
    <nav className="filter-card">
      <div className="filter-header">
        <span className="filter-title">🔍 Tìm kiếm nâng cao</span>
        {hasActiveFilter && (
          <span className="filter-badge-active">Đang áp dụng bộ lọc</span>
        )}
      </div>

      <div className="filter-inner">
        {/* Dropdown Tỉnh thành */}
        <div className="filter-item">
          <label htmlFor="filter-city">Tỉnh Thành</label>
          <select
            id="filter-city"
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
          >
            <option value="">--- Tất cả Tỉnh/Thành ---</option>
            {provinceList.map((province) => (
              <option key={province.code} value={String(province.code)}>
                {province.name_with_type || province.name || province.code}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Quận huyện */}
        <div className="filter-item">
          <label htmlFor="filter-district">Quận/ Huyện</label>
          <select
            id="filter-district"
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={!selectedCity || districtList.length === 0}
          >
            <option value="">
              {!selectedCity
                ? "---Chọn Tỉnh/Thành trước---"
                : "--- Tất cả Quận/Huyện ---"}
            </option>
            {districtList.map((district) => (
              <option key={district.code} value={String(district.code)}>
                {district.name_with_type || district.name || district.code}
              </option>
            ))}
          </select>
        </div>

        {/* Khoảng giá */}
        <div className="filter-item">
          <label htmlFor="filter-price">Khoảng giá</label>
          <select
            id="filter-price"
            value={selectedPrice}
            onChange={(e) => onPriceChange(e.target.value)}
          >
            <option value="">Tất cả mức giá</option>
            <option value="0-3000000">Dưới 3 triệu</option>
            <option value="3000000-5000000">3 - 5 triệu</option>
            <option value="5000000-10000000">5 - 10 triệu</option>
            <option value="10000000-999999999">Trên 10 triệu</option>
          </select>
        </div>

        {/* Diện tích */}
        <div className="filter-item">
          <label htmlFor="filter-area">Diện tích</label>
          <select
            id="filter-area"
            value={selectedArea}
            onChange={(e) => onAreaChange(e.target.value)}
          >
            <option value="">Tất cả diện tích</option>
            <option value="0-20">Dưới 20 m²</option>
            <option value="20-40">20 - 40 m²</option>
            <option value="40-60">40 - 60 m²</option>
            <option value="60-999">Trên 60 m²</option>
          </select>
        </div>

        {/* Thao tác nút */}
        <div className="filter-actions">
          <button
            type="button"
            className="filter-button"
            onClick={onFilter}
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner">Đang lọc...</span>
            ) : (
              "Lọc tin"
            )}
          </button>

          {hasActiveFilter && (
            <button
              type="button"
              className="reset-button"
              onClick={onReset}
              title="Xóa toàn bộ các điều kiện đã chọn"
            >
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Filter;