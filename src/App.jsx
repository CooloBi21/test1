import { useState } from "react";

import Filter from "./components/Filter/Filter";
import RoomList from "./components/RoomList/RoomList";
import CandleStickChart from "./components/CandleStickChart/CandleStickChart";

import roomsData from "./data/room.json";
import provincesData from "./data/tinh_tp.json";
import districtsData from "./data/quan_huyen.json";

import "./App.css";

function App() {
   // =========================
  // STATE - BÀI 1
  // =========================

  const [selectedCity, setSelectedCity] = useState("");

  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [selectedPrice, setSelectedPrice] = useState("");

  const [selectedArea, setSelectedArea] = useState("");

  const [rooms, setRooms] = useState(roomsData);


  // =========================
  // CHỌN TỈNH / THÀNH
  // =========================

  const handleCityChange = (cityCode) => {
    setSelectedCity(cityCode);

    // Khi đổi tỉnh thì reset quận/huyện
    setSelectedDistrict("");
  };


  // =========================
  // LỌC PHÒNG
  // =========================

  const handleFilter = () => {
    let result = roomsData;


    // -------------------------
    // Lọc theo tỉnh
    // -------------------------

    if (selectedCity) {
      result = result.filter(
        (room) =>
          String(room.city) === String(selectedCity)
      );
    }


    // -------------------------
    // Lọc theo quận/huyện
    // -------------------------

    if (selectedDistrict) {
      result = result.filter(
        (room) =>
          String(room.district) ===
          String(selectedDistrict)
      );
    }


    // -------------------------
    // Lọc theo giá
    // -------------------------

    if (selectedPrice) {
      const [min, max] =
        selectedPrice.split("-").map(Number);

      result = result.filter(
        (room) =>
          Number(room.price) >= min &&
          Number(room.price) <= max
      );
    }


    // -------------------------
    // Lọc theo diện tích
    // -------------------------

    if (selectedArea) {
      const [min, max] =
        selectedArea.split("-").map(Number);

      result = result.filter(
        (room) =>
          Number(room.area) >= min &&
          Number(room.area) <= max
      );
    }


    // Cập nhật danh sách
    setRooms(result);
  };


  // =========================
  // RESET FILTER
  // =========================

  const handleReset = () => {
    setSelectedCity("");
    setSelectedDistrict("");
    setSelectedPrice("");
    setSelectedArea("");

    setRooms(roomsData);
  };


  // =========================
  // GIAO DIỆN
  // =========================

  return (
    <div className="app">


      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="header">

        <h1>
          ĐỀ TEST DÀNH CHO ỨNG VIÊN FRONT-END DEVELOPER
        </h1>

      </header>



      {/* ==================================================
          BÀI 1
      ================================================== */}

      <section className="test-section">

        <div className="title">

          <h2>
            Bài 1: Thiết kế 1 trang bao gồm 1 form tìm kiếm
            và 1 danh sách các bài viết
          </h2>

          <p>
            Thời gian thực hiện: 1 tiếng
          </p>

        </div>


        {/* =========================
            MAIN BÀI 1
        ========================= */}

        <main className="container">


          {/* FILTER */}

          <Filter
            provinces={provincesData}
            districts={districtsData}

            selectedCity={selectedCity}
            selectedDistrict={selectedDistrict}
            selectedPrice={selectedPrice}
            selectedArea={selectedArea}

            onCityChange={handleCityChange}
            onDistrictChange={setSelectedDistrict}
            onPriceChange={setSelectedPrice}
            onAreaChange={setSelectedArea}

            onFilter={handleFilter}
          />


          {/* RESULT TOOLBAR */}

          <div className="result-toolbar">

            <span>
              Tìm thấy{" "}<strong>{rooms.length}</strong>{" "} phòng
            </span>

            <button
              onClick={handleReset}
              className="reset-button"
            >
              Xóa bộ lọc
            </button>

          </div>


          {/* DANH SÁCH PHÒNG */}

          <RoomList
            rooms={rooms}
            provinces={provincesData}
            districts={districtsData}
          />

        </main>

      </section>



      {/* ==================================================
          BÀI 2
      ================================================== */}

      <section className="test-section chart-section">


        <div className="title">

          <h2>
            Bài 2: Candlestick Chart
          </h2>

          <p>
            Thời gian thực hiện: 30 phút
          </p>

        </div>


        {/* =========================
            CANDLESTICK CHART
        ========================= */}

        <CandleStickChart />

      </section>


    </div>
  );
}

export default App;