import React, { useState, useMemo } from 'react';
import RoomCard from '../RoomCard/RoomCard';
import { Room, Province, District, SortOption } from '@/types/room';
import './RoomList.css';

export interface FilterTag {
  key: string;
  label: string;
}

interface RoomListProps {
  rooms: Room[];
  loading?: boolean;
  provinces?: Record<string, any> | Province[];
  districts?: Record<string, any> | District[];
  activeTags?: FilterTag[];
  onResetFilter?: () => void;
}

const RoomList: React.FC<RoomListProps> = ({
  rooms = [],
  loading = false,
  provinces = [],
  districts = [],
  activeTags = [],
  onResetFilter,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const getProvinceName = (room: Room): string => {
    if (room.city_name) return room.city_name;
    const cityCode = room.city || room.province_code;
    if (!cityCode || !provinces) return 'Không xác định';

    if (Array.isArray(provinces)) {
      const found = provinces.find((p) => String(p.code) === String(cityCode));
      return found?.name_with_type || found?.name || 'Không xác định';
    }
    const province = (provinces as Record<string, any>)[cityCode];
    return province?.name_with_type || province?.name || 'Không xác định';
  };

  const getDistrictName = (room: Room): string => {
    if (room.district_name) return room.district_name;
    const districtCode = room.district || room.district_code;
    if (!districtCode || !districts) return 'Không xác định';

    if (Array.isArray(districts)) {
      const found = districts.find((d) => String(d.code) === String(districtCode));
      return found?.name_with_type || found?.name || 'Không xác định';
    }
    const district = (districts as Record<string, any>)[districtCode];
    return district?.name_with_type || district?.name || 'Không xác định';
  };

  // Sắp xếp dữ liệu client-side mà không làm hỏng API
  const sortedRooms = useMemo(() => {
    const list = [...rooms];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      case 'price-desc':
        return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      case 'area-desc':
        return list.sort((a, b) => Number(b.area || 0) - Number(a.area || 0));
      case 'newest':
      default:
        return list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }
  }, [rooms, sortBy]);

  return (
    <div className="room-list-container">
      {/* Header công cụ: Đếm kết quả, Thẻ lọc đang chọn & Sắp xếp */}
      <div className="results-bar">
        <div className="results-count">
          Tìm thấy <strong>{rooms.length}</strong> tin đăng phù hợp
        </div>

        <div className="sort-wrapper">
          <label htmlFor="sort-select">Sắp xếp:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="area-desc">Diện tích lớn nhất</option>
          </select>
        </div>
      </div>

      {/* Hiển thị các tiêu chí đang được lọc */}
      {activeTags.length > 0 && (
        <div className="active-tags-container">
          <span className="tags-label">Đã lọc theo:</span>
          {activeTags.map((tag) => (
            <span key={tag.key} className="active-tag-chip">
              {tag.label}
            </span>
          ))}
          {onResetFilter && (
            <button className="clear-all-tags-btn" onClick={onResetFilter}>
              Xóa tất cả
            </button>
          )}
        </div>
      )}

      {/* Hiển thị Skeleton Loader khi đang tải */}
      {loading ? (
        <div className="room-grid">
          {[1, 2, 3].map((item) => (
            <div key={item} className="room-card-skeleton">
              <div className="skeleton-img"></div>
              <div className="skeleton-info">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-price"></div>
                <div className="skeleton-line skeleton-text"></div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedRooms.length === 0 ? (
        /* Trạng thái Không tìm thấy kết quả */
        <div className="no-result">
          <div className="no-result-icon">🏠</div>
          <h3>Không tìm thấy phòng trọ phù hợp</h3>
          <p>Rất tiếc, không có tin đăng nào đáp ứng đúng tất cả bộ lọc bạn chọn.</p>
          {onResetFilter && (
            <button className="reset-filter-action" onClick={onResetFilter}>
              🔄 Reset bộ lọc để xem tất cả
            </button>
          )}
        </div>
      ) : (
        /* Danh sách phòng */
        <div className="room-grid">
          {sortedRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              cityName={getProvinceName(room)}
              districtName={getDistrictName(room)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;