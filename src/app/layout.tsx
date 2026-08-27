import type { Metadata } from 'next';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '../index.css';
import './theme.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { SavedPostsProvider } from '@/context/SavedPostsContext';
import { ChatProvider } from '@/context/ChatContext';
import { NotificationProvider } from '@/context/NotificationContext';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata: Metadata = {
  title: 'Hệ Thống Tìm Trọ & Phòng Cho Thuê',
  description: 'Ứng dụng tìm kiếm phòng trọ tiện lợi, nhanh chóng',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="vi">
      <body>
        <ThemeProvider>
          <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
              <NotificationProvider>
                <ChatProvider>
                  <SavedPostsProvider>
                    {/* ClientLayoutWrapper quản lý việc ẩn/hiện Navbar & BackgroundGlow tùy theo Route */}
                    <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
                  </SavedPostsProvider>
                </ChatProvider>
              </NotificationProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}