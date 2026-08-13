import React from "react";
import "./Filter.css";

// ==========================================
// 1. KHAI BÁO KIỂU DỮ LIỆU 
// ==========================================

// Kiểu dữ liệu từng Tỉnh/Thành
export interface ProvinceItem {
  code: string | number;
  name_with_type: string;
}

// Kiểu dữ liệu từng Quận/Huyện
export interface DistrictItem {
  code: string | number;
  name_with_type: string;
  parent_code: string | number;
}

// Kiểu dữ liệu cho toàn bộ Props nhận từ Component cha
interface FilterProps {
  provinces: Record<string, ProvinceItem> | ProvinceItem[];
  districts: Record<string, DistrictItem> | DistrictItem[];
  selectedCity: string;
  selectedDistrict: string;
  selectedPrice: string;
  selectedArea: string;
  onCityChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onFilter: () => void;
}

// ==========================================
// 2. COMPONENT REACT VỚI TYPESCRIPT
// ==========================================

const Filter: React.FC<FilterProps> = ({
  provinces,
  districts,
  selectedCity,
  selectedDistrict,
  selectedPrice,
  selectedArea,
  onCityChange,
  onDistrictChange,
  onPriceChange,
  onAreaChange,
  onFilter,
}) => {
  // Lọc danh sách Quận/Huyện dựa trên Tỉnh/Thành được chọn
  const districtList = (Object.values(districts) as DistrictItem[]).filter(
    (district) => String(district.parent_code) === String(selectedCity)
  );

  return (
    <nav className="filter-nav">
      <div className="filter-inner">

        {/* Tỉnh thành */}
        <div className="filter-item">
          <label>Tỉnh thành</label>

          <select
            value={selectedCity}
            onChange={(event) => onCityChange(event.target.value)}
          >
            <option value="">---Tỉnh thành---</option>

            {(Object.values(provinces) as ProvinceItem[]).map((province) => (
              <option key={province.code} value={province.code}>
                {province.name_with_type}
              </option>
            ))}
          </select>
        </div>

        {/* Quận huyện */}
        <div className="filter-item">
          <label>Quận huyện</label>

          <select
            value={selectedDistrict}
            onChange={(event) => onDistrictChange(event.target.value)}
            disabled={!selectedCity}
          >
            <option value="">---Quận huyện---</option>

            {districtList.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name_with_type}
              </option>

            ))}
          </select>
        </div>

        {/* Khoảng giá */}
        <div className="filter-item">
          <label>Khoảng giá</label>

          <select
            value={selectedPrice}
            onChange={(event) => onPriceChange(event.target.value)}
          >
            <option value="">Chọn mức giá</option>
            <option value="0-3000000">Dưới 3 triệu</option>
            <option value="3000000-5000000">3 - 5 triệu</option>
            <option value="5000000-10000000">5 - 10 triệu</option>
            <option value="10000000-999999999">Trên 10 triệu</option>
          </select>
        </div>

        {/* Diện tích */}
        <div className="filter-item">
          <label>Diện tích</label>

          <select
            value={selectedArea}
            onChange={(event) => onAreaChange(event.target.value)}
          >
            <option value="">Chọn diện tích</option>
            <option value="0-20">Dưới 20m²</option>
            <option value="20-40">20 - 40m²</option>
            <option value="40-60">40 - 60m²</option>
            <option value="60-999">Trên 60m²</option>
          </select>
        </div>

        {/* Nút lọc */}
        <button
          type="button"
          className="filter-button"
          onClick={onFilter}
        >
          Lọc tin
        </button>

      </div>
    </nav>
  );
};

export default Filter;