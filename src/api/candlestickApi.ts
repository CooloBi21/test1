import { CandlestickItem } from '../types/candlestick';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export const getCandlestickData = async (): Promise<CandlestickItem[]> => {
  const res = await fetch(`${API_URL}/candlestick`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Không thể lấy dữ liệu biểu đồ nến');
  }
  return res.json();
};