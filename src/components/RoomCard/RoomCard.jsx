import "./RoomCard.css";

function RoomCard({
  room,
  cityName,
  districtName,
}) {
  return (
    <article className="room-card">
      {/* Hình ảnh */}
      <div className="room-image-wrapper">
        <img
          src={room.thumbnail}
          alt={room.title}
          className="room-image"
        />
      </div>

      {/* Nội dung */}
      <div className="room-info">
        {/* Tiêu đề */}
        <h2 className="room-title">
          {room.title}
        </h2>

        {/* Giá */}
        <div className="room-price">
          {Number(room.price).toLocaleString("vi-VN")}
          {" "}đồng/tháng
        </div>

        {/* Thông tin */}
        <div className="room-location">
          Diện tích:{" "}
          <strong>{room.area}m²</strong>

          <br />

          Khu vực:{" "}
          <strong>
            {districtName}
            {districtName && cityName ? ", " : ""}
            {cityName}
          </strong>
        </div>

        {/* Nội dung bài đăng */}
        <p className="room-content">
          {room.content}
        </p>
      </div>
    </article>
  );
}

export default RoomCard;