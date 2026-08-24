'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import BackgroundGlow from '@/components/BackgroundGlow/BackgroundGlow';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Nếu là trang Admin: Bỏ BackgroundGlow & Navbar, chỉ trả về nội dung trang
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Nếu là trang Client người dùng: Render đầy đủ Background, Navbar và <main>
  return (
    <>
      <BackgroundGlow />
      <Navbar />
      <main>{children}</main>
    </>
  );
}