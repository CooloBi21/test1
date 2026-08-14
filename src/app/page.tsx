'use client';

import { useState, useEffect } from 'react';
import Filter, { ProvinceItem, DistrictItem } from '../components/Filter/Filter';
import RoomList from '../components/RoomList/RoomList';

// Import Component Biểu đồ Nến & Type
import CandleStickChart from '../components/CandleStickChart/CandleStickChart';
import { CandlestickItem } from '../types/candlestick';

import { getRooms, RoomFilterParams } from '../api/roomApi';
import { getProvinces, getDistrictsByProvince } from '../api/locationApi';

// ⚡ Lấy URL Backend từ biến môi trường (mặc định fallback về localhost:5000 khi dev)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Danh sách địa điểm cho Filter
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);

  // State lưu dữ liệu biểu đồ nến
  const [candlestickData, setCandlestickData] = useState<CandlestickItem[]>([]);

  // State quản lý các lựa chọn lọc
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  // 1. Tải Tỉnh/Thành, Biểu đồ & Phòng trọ ban đầu khi tải trang
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const provData = await getProvinces();
        setProvinces(provData as any);
      } catch (error) {
        console.error('Lỗi khi tải danh sách tỉnh/thành:', error);
      }
    };

    const fetchCandlestick = async () => {
      try {
        const res = await fetch(`${API_URL}/candlestick`);
        if (res.ok) {
          const data = await res.json();
          setCandlestickData(data);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu nến:', error);
      }
    };

    fetchInitialData();
    fetchRooms({});
    fetchCandlestick();
  }, []);

  // 2. Tự động lấy danh sách Quận/Huyện ĐỘNG mỗi khi thay đổi Tỉnh/Thành
  useEffect(() => {
    if (selectedCity) {
      getDistrictsByProvince(selectedCity)
        .then((data) => setDistricts(data as any))
        .catch((err) => console.error('Lỗi khi tải quận/huyện:', err));
    } else {
      setDistricts([]);
    }
  }, [selectedCity]);

  // 3. Hàm gọi API lấy danh sách phòng trọ
  const fetchRooms = async (params: RoomFilterParams) => {
    try {
      setLoading(true);
      const data = await getRooms(params);
      setRooms(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (cityCode: string) => {
    setSelectedCity(cityCode);
    setSelectedDistrict('');
  };

  // 4. Xử lý sự kiện khi bấm nút "Lọc tin"
  const handleFilter = () => {
    const params: RoomFilterParams = {};

    if (selectedCity) params.city = selectedCity;
    if (selectedDistrict) params.district = selectedDistrict;

    if (selectedPrice) {
      const [minP, maxP] = selectedPrice.split('-');
      params.minPrice = minP;
      params.maxPrice = maxP;
    }

    if (selectedArea) {
      const [minA, maxA] = selectedArea.split('-');
      params.minArea = minA;
      params.maxArea = maxA;
    }

    fetchRooms(params);
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>
        🏡 Tìm Kiếm Phòng Trọ & Cho Thuê
      </h1>

      {/* Component Bộ lọc */}
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

      {/* Danh sách phòng trọ */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px 0' }}>Đang tải danh sách phòng trọ...</p>
      ) : (
        <RoomList 
          rooms={rooms} 
          provinces={provinces} 
          districts={districts} 
        />
      )}

      {/* Biểu đồ nến thị trường */}
      <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
          📈 Biến Động Thị Trường
        </h2>
        <CandleStickChart 
          data={candlestickData} 
          title="Tỷ giá VN-Index / Crypto" 
          height={400} 
        />
      </div>
    </main>
  );
}