'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { CandlestickChartProps } from '@/types/candlestick';

// Load động react-apexcharts để bỏ qua SSR
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const CandleStickChart: React.FC<CandlestickChartProps> = ({
  data = [], // Mặc định là mảng rỗng nếu chưa có dữ liệu
  title = 'Biểu đồ Nến (Candlestick)',
  height = 350,
}) => {
  // Chuyển đổi dữ liệu sang định dạng series của ApexCharts
  const series = [
    {
      name: 'Nến giá',
      data: (data || []).map((item) => ({
        x: item.x,
        y: [item.open, item.high, item.low, item.close], // Chuẩn OHLC
      })),
    },
  ];

  // Cấu hình Options
  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: height,
      toolbar: {
        show: true,
      },
    },
    title: {
      text: title,
      align: 'left',
      style: {
        fontSize: '16px',
        color: '#333',
      },
    },
    xaxis: {
      type: 'category',
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        formatter: (val: number) => `$${val ? val.toFixed(2) : '0'}`,
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00B746',   // Nến tăng (Xanh)
          downward: '#EF403C', // Nến giảm (Đỏ)
        },
      },
    },
  };

  return (
    <div className="candlestick-chart-wrapper p-4 bg-white rounded-lg shadow">
      <ReactApexChart
        options={options}
        series={series}
        type="candlestick"
        height={height}
      />
    </div>
  );
};

export default CandleStickChart;