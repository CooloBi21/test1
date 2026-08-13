import React from "react";
import RoomCard, { RoomItem } from "../RoomCard/RoomCard";
import { ProvinceItem, DistrictItem } from "../Filter/Filter";
import "./RoomList.css";

// ==========================================
// 1. KHAI BÁO KIỂU DỮ LIỆU 
// ==========================================

export interface RoomWithLocation extends RoomItem {
  city?: string | number;
  district?: string | number;
}

// Định nghĩa kiểu dữ liệu cho Props của RoomList
interface RoomListProps {
  rooms: RoomWithLocation[];
  provinces: Record<string | number, ProvinceItem>;
  districts: Record<string | number, DistrictItem>;
}

// ==========================================
// 2. COMPONENT ROOMLIST VỚI TYPESCRIPT
// ==========================================

const RoomList: React.FC<RoomListProps> = ({
  rooms,
  provinces,
  districts,
}) => {
  // Tìm tên tỉnh/thành
  const getProvinceName = (cityCode?: string | number): string => {
    if (!cityCode) return "Không xác định";
    const province = provinces[cityCode];

    if (!province) {
      return "Không xác định";
    }

    return province.name_with_type;
  };

  // Tìm tên quận/huyện
  const getDistrictName = (districtCode?: string | number): string => {
    if (!districtCode) return "Không xác định";
    const district = districts[districtCode];

    if (!district) {
      return "Không xác định";
    }

    return district.name_with_type;
  };

  // Không có kết quả
  if (!rooms || rooms.length === 0) {
    return (
      <div className="no-result">
        Không tìm thấy phòng trọ phù hợp.
      </div>
    );
  }

  return (
    <section className="room-list">
      {rooms.map((room, index) => (
        <RoomCard
          key={`${room.district}-${index}`}
          room={room}
          cityName={getProvinceName(room.city)}
          districtName={getDistrictName(room.district)}
        />
      ))}
    </section>
  );
};

export default RoomList;