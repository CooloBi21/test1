import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Hệ Thống Tìm Trọ & Phòng Cho Thuê',
  description: 'Ứng dụng tìm kiếm phòng trọ tiện lợi, nhanh chóng',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}