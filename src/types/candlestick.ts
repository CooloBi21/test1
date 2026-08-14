export interface CandlestickItem {
  x: string | number | Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandlestickChartProps {
  data: CandlestickItem[];
  title?: string;
  height?: number;
}