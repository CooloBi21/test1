import React from "react";
import RoomCard, { RoomItem } from "../RoomCard/RoomCard";
import { ProvinceItem, DistrictItem } from "../Filter/Filter";
import "./RoomList.css";

export interface RoomWithLocation extends RoomItem {
  city?: string | number;
  district?: string | number;
}

interface RoomListProps {
  rooms: RoomWithLocation[];
  provinces?: Record<string, ProvinceItem> | ProvinceItem[];
  districts?: Record<string, DistrictItem> | DistrictItem[];
}

const RoomList: React.FC<RoomListProps> = ({
  rooms = [],
  provinces = [],
  districts = [],
}) => {
  // Hàm tìm tên Tỉnh/Thành an toàn
  const getProvinceName = (cityCode?: string | number): string => {
    if (!cityCode || !provinces) return "Không xác định";

    // Trường hợp provinces là Mảng
    if (Array.isArray(provinces)) {
      const found = provinces.find((p) => String(p.code) === String(cityCode));
      return found?.name_with_type || found?.name || "Không xác định";
    }

    // Trường hợp provinces là Object
    const province = provinces[cityCode];
    return province?.name_with_type || province?.name || "Không xác định";
  };

  // Hàm tìm tên Quận/Huyện an toàn
  const getDistrictName = (districtCode?: string | number): string => {
    if (!districtCode || !districts) return "Không xác định";

    // Trường hợp districts là Mảng
    if (Array.isArray(districts)) {
      const found = districts.find((d) => String(d.code) === String(districtCode));
      return found?.name_with_type || found?.name || "Không xác định";
    }

    // Trường hợp districts là Object
    const district = districts[districtCode];
    return district?.name_with_type || district?.name || "Không xác định";
  };

  if (!rooms || rooms.length === 0) {
    return (
      <div className="no-rooms">
        <p>Không tìm thấy phòng trọ nào phù hợp với tìm kiếm của bạn.</p>
      </div>
    );
  }

  return (
    <div className="room-list-container">
      <div className="room-grid">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            cityName={getProvinceName(room.city || room.province_code)}
            districtName={getDistrictName(room.district || room.district_code)}
          />
        ))}
      </div>
    </div>
  );
};

export default RoomList;