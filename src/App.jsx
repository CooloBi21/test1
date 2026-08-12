import { useEffect, useState } from "react";

import Filter from "./components/Filter/Filter";
import RoomList from "./components/RoomList/RoomList";
import CandleStickChart from "./components/CandleStickChart/CandleStickChart";

import { getRooms } from "./api/roomApi";
import { getProvinces, getDistricts } from "./api/locationApi";

import "./App.css";

// ==================================================
// RESPONSE DATA
// ==================================================
const getResponseData = (response) => {
    return response?.data ?? response ?? [];
};

// ==================================================
// LOCATION MAP
// ==================================================
const toLocationMap = (locations) => {
    if (!Array.isArray(locations)) {
        return locations;
    }

    return locations.reduce((result, location) => {
        result[location.code] = {
            ...location,
            name_with_type: location.name_with_type ?? location.name,
        };
        return result;
    }, {});
};

// ==================================================
// APP
// ==================================================
function App() {
    // ==================================================
    // FILTER STATE
    // ==================================================
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedPrice, setSelectedPrice] = useState("");
    const [selectedArea, setSelectedArea] = useState("");

    // ==================================================
    // DATA STATE
    // ==================================================
    const [rooms, setRooms] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);

    // ==================================================
    // STATUS (Để loading mặc định là true)
    // ==================================================
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==================================================
    // LOAD WHEN APP START
    // ==================================================
    useEffect(() => {
        let isMounted = true;

        const fetchInitialData = async () => {
            try {
                const [roomResponse, provinceResponse] = await Promise.all([
                    getRooms(),
                    getProvinces(),
                ]);

                if (!isMounted) return;

                setRooms(getResponseData(roomResponse));
                setProvinces(toLocationMap(getResponseData(provinceResponse)));
            } catch (err) {
                if (!isMounted) return;
                console.error(err);
                setError("Không thể kết nối tới Backend");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchInitialData();

        return () => {
            isMounted = false;
        };
    }, []);

    // ==================================================
    // CHỌN TỈNH / THÀNH
    // ==================================================
    const handleCityChange = async (cityCode) => {
        setSelectedCity(cityCode);
        setSelectedDistrict("");

        if (!cityCode) {
            setDistricts([]);
            return;
        }

        try {
            const response = await getDistricts(cityCode);
            const districtData = getResponseData(response);

            console.log("Selected province:", cityCode);
            console.log("Districts:", districtData);

            setDistricts(toLocationMap(districtData));
        } catch (error) {
            console.error("Không thể lấy quận/huyện:", error);
            setDistricts([]);
        }
    };

    // ==================================================
    // LỌC PHÒNG
    // ==================================================
    const handleFilter = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (selectedCity) params.city = selectedCity;
            if (selectedDistrict) params.district = selectedDistrict;

            if (selectedPrice) {
                const [min, max] = selectedPrice.split("-");
                params.minPrice = min;
                params.maxPrice = max;
            }

            if (selectedArea) {
                const [min, max] = selectedArea.split("-");
                params.minArea = min;
                params.maxArea = max;
            }

            const response = await getRooms(params);
            setRooms(getResponseData(response));
        } catch (error) {
            console.error(error);
            setError("Không thể lọc danh sách phòng");
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // RESET FILTER
    // ==================================================
    const handleReset = async () => {
        setSelectedCity("");
        setSelectedDistrict("");
        setSelectedPrice("");
        setSelectedArea("");
        setDistricts([]);

        try {
            setLoading(true);
            setError("");

            const response = await getRooms();
            setRooms(getResponseData(response));
        } catch (error) {
            console.error(error);
            setError("Không thể tải lại danh sách phòng.");
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // RENDER
    // ==================================================
    return (
        <div className="app">
            {/* HEADER */}
            <header className="header">
                <h1>ĐỀ TEST DÀNH CHO ỨNG VIÊN FRONT-END DEVELOPER</h1>
            </header>

            {/* BÀI 1 */}
            <section className="test-section">
                <div className="title">
                    <h2>
                        Bài 1: Thiết kế 1 trang bao gồm 1 form tìm kiếm và 1 danh sách các bài viết
                    </h2>
                    <p>Thời gian thực hiện: 1 tiếng</p>
                </div>

                <main className="container">
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

                    <div className="result-toolbar">
                        <span>
                            {loading ? (
                                "Đang tải danh sách phòng..."
                            ) : (
                                <>
                                    Tìm thấy <strong>{rooms.length}</strong> phòng
                                </>
                            )}
                        </span>

                        <button onClick={handleReset} className="reset-button">
                            Xóa bộ lọc
                        </button>
                    </div>

                    {error && <div className="no-result">{error}</div>}

                    <RoomList rooms={rooms} provinces={provinces} districts={districts} />
                </main>
            </section>

            {/* BÀI 2 */}
            <section className="test-section chart-section">
                <div className="title">
                    <h2>Bài 2: Candlestick Chart</h2>
                    <p>Thời gian thực hiện: 30 phút</p>
                </div>

                <CandleStickChart />
            </section>
        </div>
    );
}

export default App;