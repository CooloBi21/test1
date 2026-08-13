import React from "react";
import "./RoomCard.css";

// ==========================================
// 1. KHAI BÁO KIỂU DỮ LIỆU 
// ==========================================

// Kiểu dữ liệu cho từng đối tượng Phòng trọ
export interface RoomItem {
  id?: number | string;
  title: string;
  thumbnail?: string;
  price: number | string;
  area: number | string;
  content?: string;
  province_code?: string;
  district_code?: string;
}

// Kiểu dữ liệu Props nhận từ RoomList
interface RoomCardProps {
  room: RoomItem;
  cityName?: string;
  districtName?: string;
}

// ==========================================
// 2. COMPONENT ROOMCARD VỚI TYPESCRIPT
// ==========================================

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  cityName,
  districtName,
}) => {
  return (
    <article className="room-card">
      {/* Hình ảnh */}
      <div className="room-image-wrapper">
        <img
          src={room.thumbnail || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={room.title}
          className="room-image"
        />
      </div>

      {/* Nội dung */}
      <div className="room-info">
        {/* Tiêu đề */}
        <h2 className="room-title">{room.title}</h2>

        {/* Giá */}
        <div className="room-price">
          {Number(room.price || 0).toLocaleString("vi-VN")} đồng/tháng
        </div>

        {/* Thông tin */}
        <div className="room-location">
          Diện tích: <strong>{room.area}m²</strong>
          <br />
          Khu vực:{" "}
          <strong>
            {districtName}
            {districtName && cityName ? ", " : ""}
            {cityName}
          </strong>
        </div>

        {/* Nội dung bài đăng */}
        <p className="room-content">{room.content}</p>
      </div>
    </article>
  );
};

export default RoomCard;