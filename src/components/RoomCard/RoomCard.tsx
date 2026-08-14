import React from "react";
import Link from "next/link"; // 1. Import Link từ next/link
import "./RoomCard.css";

// ==========================================
// 1. KHAI BÁO KIỂU DỮ LIỆU 
// ==========================================

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

interface RoomCardProps {
  room: RoomItem;
  cityName?: string;
  districtName?: string;
}

// ==========================================
// 2. COMPONENT ROOMCARD CHUẨN NEXT.JS
// ==========================================

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  cityName,
  districtName,
}) => {
  // Tạo đường dẫn động tới trang chi tiết phòng
  const detailUrl = room.id ? `/rooms/${room.id}` : "#";

  return (
    <article className="room-card">
      {/* Hình ảnh - Bọc trong Link để click chuyển sang trang chi tiết */}
      <div className="room-image-wrapper">
        <Link href={detailUrl}>
          <img
            src={room.thumbnail || "https://via.placeholder.com/300x200?text=No+Image"}
            alt={room.title}
            className="room-image"
          />
        </Link>
      </div>

      {/* Nội dung */}
      <div className="room-info">
        {/* Tiêu đề - Bọc trong Link */}
        <h2 className="room-title">
          <Link href={detailUrl} style={{ textDecoration: "none", color: "inherit" }}>
            {room.title}
          </Link>
        </h2>

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