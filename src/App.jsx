import { useCallback, useEffect, useState } from "react";

import Filter from "./components/Filter/Filter";
import RoomList from "./components/RoomList/RoomList";
import CandleStickChart from "./components/CandleStickChart/CandleStickChart";

import { getRooms } from "./api/roomApi";

import {
    getProvinces,
    getDistricts
} from "./api/locationApi";

import "./App.css";

const getResponseData = (response) =>
  response?.data ?? response ?? [];

const toLocationMap = (locations) => {
  if (!Array.isArray(locations)) {
    return locations;
  }

  return locations.reduce((result, location) => {
    result[location.code] = {
      ...location,
      name_with_type:
        location.name_with_type ?? location.name,
    };

    return result;
  }, {});
};

function App() {
   // =========================
  // STATE - BÀI 1
  // =========================

const [selectedCity, setSelectedCity] = useState("");

const [selectedDistrict, setSelectedDistrict] = useState("");

const [selectedPrice, setSelectedPrice] = useState("");

const [selectedArea, setSelectedArea] = useState("");


// Danh sách phòng lấy từ Backend
const [rooms, setRooms] = useState([]);


// Danh sách tỉnh lấy từ Backend
const [provinces, setProvinces] = useState([]);


// Danh sách quận/huyện lấy từ Backend
const [districts, setDistricts] = useState([]);


// Trạng thái loading
const [loading, setLoading] = useState(false);

// Trạng thái lỗi
const [error, setError] = useState("");

// ==================================================
// LOAD DỮ LIỆU BAN ĐẦU
// ==================================================

const loadInitialData = useCallback(async () => {

    try {

        setLoading(true);
        setError("");

        const [
            roomResponse,
            provinceResponse,
            districtResponse
        ] = await Promise.all([
            getRooms(),
            getProvinces(),
            getDistricts()
        ]);

        setRooms(getResponseData(roomResponse));
        setProvinces(
            toLocationMap(getResponseData(provinceResponse))
        );
        setDistricts(
            toLocationMap(getResponseData(districtResponse))
        );

    } catch (error) {

        console.error(error);

        setError(
            "Không thể kết nối tới Backend"
        );

    } finally {

        setLoading(false);

    }
}, []);

useEffect(() => {

    const timeoutId = setTimeout(() => {
        loadInitialData();
    }, 0);

    return () => {
        clearTimeout(timeoutId);
    };

}, [loadInitialData]);


  // =========================
  // CHỌN TỈNH / THÀNH
  // =========================

  const handleCityChange = async (cityCode) => {

    setSelectedCity(cityCode);

    setSelectedDistrict("");

    if (!cityCode) {

        return;

    }

    try {

        const response =
            await getDistricts(cityCode);

        setDistricts(
            toLocationMap(getResponseData(response))
        );

    } catch (error) {

        console.error(error);

    }

};


  // =========================
  // LỌC PHÒNG
  // =========================

  const handleFilter = async () => {

    try {

        setLoading(true);
        setError("");

        const params = {};

        if (selectedCity) {
            params.city = selectedCity;
        }

        if (selectedDistrict) {
            params.district = selectedDistrict;
        }

        if (selectedPrice) {

            const [min, max] =
                selectedPrice.split("-");

            params.minPrice = min;
            params.maxPrice = max;

        }

        if (selectedArea) {

            const [min, max] =
                selectedArea.split("-");

            params.minArea = min;
            params.maxArea = max;

        }

        const response =
            await getRooms(params);

        setRooms(getResponseData(response));

    } catch (error) {

        console.error(error);

        setError(
            "Không thể lọc danh sách phòng"
        );

    } finally {

        setLoading(false);

    }

};


  // =========================
  // RESET FILTER
  // =========================
const handleReset = async () => {
    setSelectedCity("");
    setSelectedDistrict("");
    setSelectedPrice("");
    setSelectedArea("");

    try {
        setLoading(true);

        const response = await getRooms();

        setRooms(response.data);

    } catch (error) {
        console.error(error);
        setError("Không thể tải lại danh sách phòng.");
    } finally {
        setLoading(false);
    }
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
            provinces={provinces}
            districts={districts}

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
              {loading
                ? "Đang tải danh sách phòng..."
                : (
                  <>
                    Tìm thấy{" "}<strong>{rooms.length}</strong>{" "} phòng
                  </>
                )}
            </span>

            <button
              onClick={handleReset}
              className="reset-button"
            >
              Xóa bộ lọc
            </button>

          </div>

          {error && (
            <div className="no-result">
              {error}
            </div>
          )}


          {/* DANH SÁCH PHÒNG */}

          <RoomList
            rooms={rooms}
            provinces={provinces}
            districts={districts}
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
