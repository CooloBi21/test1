import type { Metadata } from 'next';
import '../index.css';
import { AuthProvider } from '@/context/AuthContext';
import { SavedPostsProvider } from '@/context/SavedPostsContext';
import Navbar from '@/components/Navbar/Navbar';
import { ChatProvider } from '@/context/ChatContext';

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
      <body>
        <AuthProvider>
          {}
          <ChatProvider>
            <SavedPostsProvider>
              <Navbar />
              <main>{children}</main>
            </SavedPostsProvider>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}