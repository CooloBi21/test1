'use client';

import { useState, useEffect, useMemo } from 'react';
import Filter, { ProvinceItem, DistrictItem } from '../components/Filter/Filter';
import RoomList, { FilterTag } from '../components/RoomList/RoomList';
import CandleStickChart from '../components/CandleStickChart/CandleStickChart';
import { Room, RoomFilterParams } from '../types/room';
import { CandlestickItem } from '../types/candlestick';
import { getRooms } from '../api/roomApi';
import { getProvinces, getDistrictsByProvince } from '../api/locationApi';
import { TrendingUp, Sparkles, Building2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);

  const [candlestickData, setCandlestickData] = useState<CandlestickItem[]>([]);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const provData = await getProvinces();
        const list = (Array.isArray(provData) ? provData : Object.values(provData || {})) as ProvinceItem[];
        setProvinces(list);
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

  useEffect(() => {
    if (selectedCity) {
      getDistrictsByProvince(selectedCity)
        .then((data) => {
          const list = (Array.isArray(data) ? data : Object.values(data || {})) as DistrictItem[];
          setDistricts(list);
        })
        .catch((err) => console.error('Lỗi khi tải quận/huyện:', err));
    } else {
      setDistricts([]);
    }
  }, [selectedCity]);

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

  const handleResetFilter = () => {
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedPrice('');
    setSelectedArea('');
    fetchRooms({});
  };

  const activeFilterTags = useMemo<FilterTag[]>(() => {
    const tags: FilterTag[] = [];

    if (selectedCity) {
      const foundProv = provinces.find((p) => String(p.code) === String(selectedCity));
      tags.push({ key: 'city', label: `Tỉnh/Thành: ${foundProv?.name || selectedCity}` });
    }

    if (selectedDistrict) {
      const foundDist = districts.find((d) => String(d.code) === String(selectedDistrict));
      tags.push({ key: 'district', label: `Quận/Huyện: ${foundDist?.name || selectedDistrict}` });
    }

    if (selectedPrice) {
      const priceLabels: Record<string, string> = {
        '0-3000000': 'Dưới 3 triệu',
        '3000000-5000000': '3 - 5 triệu',
        '5000000-10000000': '5 - 10 triệu',
        '10000000-999999999': 'Trên 10 triệu',
      };
      tags.push({ key: 'price', label: `Giá: ${priceLabels[selectedPrice] || selectedPrice}` });
    }

    if (selectedArea) {
      const areaLabels: Record<string, string> = {
        '0-20': 'Dưới 20m²',
        '20-40': '20 - 40m²',
        '40-60': '40 - 60m²',
        '60-999': 'Trên 60m²',
      };
      tags.push({ key: 'area', label: `Diện tích: ${areaLabels[selectedArea] || selectedArea}` });
    }

    return tags;
  }, [selectedCity, selectedDistrict, selectedPrice, selectedArea, provinces, districts]);

  return (
    <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px 60px' }}>
      {/* Hero Banner Section */}
      <section style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        borderRadius: '20px',
        padding: '36px 24px',
        marginBottom: '32px',
        border: '1px solid #fed7aa',
        textAlign: 'center'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 600, color: '#ea580c', marginBottom: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <Sparkles size={16} /> Nền tảng tìm kiếm phòng trọ uy tín hàng đầu
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Tìm Kiếm Phòng Trọ Nhanh Chóng & Tiện Nghi
        </h1>
        <p style={{ color: '#475569', fontSize: '15px', maxWidth: '640px', margin: '0 auto' }}>
          Hàng ngàn bài đăng phòng trọ, căn hộ mini được cập nhật liên tục với đầy đủ thông tin, hình ảnh thực tế và giá cả minh bạch.
        </p>
      </section>

      {/* Filter Component */}
      <Filter
        provinces={provinces}
        districts={districts}
        selectedCity={selectedCity}
        selectedDistrict={selectedDistrict}
        selectedPrice={selectedPrice}
        selectedArea={selectedArea}
        loading={loading}
        onCityChange={handleCityChange}
        onDistrictChange={setSelectedDistrict}
        onPriceChange={setSelectedPrice}
        onAreaChange={setSelectedArea}
        onFilter={handleFilter}
        onReset={handleResetFilter}
      />

      {/* Room List Component */}
      <RoomList
        rooms={rooms}
        loading={loading}
        provinces={provinces}
        districts={districts}
        activeTags={activeFilterTags}
        onResetFilter={handleResetFilter}
      />

      {/* Market Trends Section */}
      <div style={{ marginTop: '56px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '10px', color: '#ea580c' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Biến Động Thị Trường
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Cập nhật chỉ số tham chiếu kinh tế & bất động sản</p>
          </div>
        </div>
        <CandleStickChart
          data={candlestickData}
          title="Tỷ giá VN-Index / Crypto"
          height={400}
        />
      </div>
    </main>
  );
}