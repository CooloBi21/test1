'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar/Navbar';
import BackgroundGlow from '@/components/BackgroundGlow/BackgroundGlow';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <ThemeProvider>
      {/* Nơi bọc thêm các Context Provider khác nếu có (ví dụ: <AuthProvider>, <ChatProvider>) */}
      {isAdminRoute ? (
        /* Giao diện trang Admin: Bỏ BackgroundGlow & Navbar */
        children
      ) : (
        /* Giao diện trang Client: Render đầy đủ Background, Navbar và khung <main> */
        <>
          <BackgroundGlow />
          <Navbar />
          <main>{children}</main>
        </>
      )}
    </ThemeProvider>
  );
}