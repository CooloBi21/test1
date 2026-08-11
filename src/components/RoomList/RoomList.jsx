import RoomCard from "../RoomCard/RoomCard";

import "./RoomList.css";

function RoomList({
  rooms,
  provinces,
  districts,
}) {
  // Tìm tên tỉnh/thành
  const getProvinceName = (cityCode) => {
    const province = provinces[cityCode];

    if (!province) {
      return "Không xác định";
    }

    return province.name_with_type;
  };

  // Tìm tên quận/huyện
  const getDistrictName = (districtCode) => {
    const district = districts[districtCode];

    if (!district) {
      return "Không xác định";
    }

    return district.name_with_type;
  };

  // Không có kết quả
  if (rooms.length === 0) {
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
}

export default RoomList;