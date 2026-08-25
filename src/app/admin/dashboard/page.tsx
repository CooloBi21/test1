'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import CandleStickChart from '@/components/CandleStickChart/CandleStickChart';
import { CandlestickItem } from '@/types/candlestick';
import { getCandlestickData } from '@/api/candlestickApi';

import '../rooms/page.css';

export default function AdminDashboardOverview() {
  const [candlestickData, setCandlestickData] = useState<CandlestickItem[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);

  useEffect(() => {
    getCandlestickData()
      .then((data) => setCandlestickData(data))
      .catch((err) => console.error('Lỗi khi tải dữ liệu nến:', err))
      .finally(() => setChartLoading(false));
  }, []);

  return (
    <div>
      <h1 className="admin-title" style={{ marginBottom: '20px' }}>
        Thống kê tổng quan hệ thống
      </h1>

      {/* Thẻ Thống Kê Nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Tổng bài đăng</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0', color: '#2563eb' }}>124</p>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Chờ duyệt</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0', color: '#d97706' }}>12</p>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Báo cáo vi phạm</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0', color: '#dc2626' }}>3</p>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ color: '#64748b', fontSize: '13px' }}>Người dùng</span>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0', color: '#16a34a' }}>58</p>
        </div>
      </div>

      {/* Biểu đồ nến dành riêng cho Admin */}
      <section className="dashboard-chart-section" style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div className="dashboard-chart-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div className="dashboard-chart-icon" style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', color: '#3b82f6' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Biến Động Thị Trường
            </h2>
            <p style={{ fontSize: '13px', margin: 0, color: '#64748b' }}>
              Chỉ số tham chiếu kinh tế & bất động sản (Quản trị viên)
            </p>
          </div>
        </div>

        {chartLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Đang tải biểu đồ thị trường...
          </div>
        ) : (
          <CandleStickChart
            data={candlestickData}
            title="Tỷ giá VN-Index / Crypto"
            height={400}
          />
        )}
      </section>
    </div>
  );
}