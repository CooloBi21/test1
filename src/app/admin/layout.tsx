'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import './admin-layout.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const userRole = user?.role?.toLowerCase();
      if (!user || userRole !== 'admin') {
        router.replace('/');
      }
    }
  }, [user, isMounted, router]);

  if (!isMounted) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b', fontWeight: 500 }}>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  const userRole = user?.role?.toLowerCase();
  if (!user || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="admin-dashboard-root">
      {/* Sidebar bên trái */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Admin Dashboard</h2>
          <span className="admin-badge-role">Administrator</span>
        </div>

        <nav className="admin-nav">
          <Link 
            href="/admin/dashboard" 
            className={`admin-nav-item ${pathname === '/admin/dashboard' ? 'active' : ''}`}
          >
            📈 Tổng quan & Thống kê
          </Link>
          <Link 
            href="/admin/rooms" 
            className={`admin-nav-item ${pathname === '/admin/rooms' ? 'active' : ''}`}
          >
            📋 Duyệt bài đăng
          </Link>
          <Link 
            href="/admin/reports" 
            className={`admin-nav-item ${pathname === '/admin/reports' ? 'active' : ''}`}
          >
            🚩 Báo cáo vi phạm
          </Link>
          <Link 
            href="/admin/users" 
            className={`admin-nav-item ${pathname === '/admin/users' ? 'active' : ''}`}
          >
            👥 Quản lý người dùng
          </Link>
          <Link 
            href="/admin/support" 
            className={`admin-nav-item ${pathname === '/admin/support' ? 'active' : ''}`}
          >
            🎧 Liên hệ & Trợ giúp
          </Link>
        </nav>

        <div className="admin-user-footer">
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.full_name || 'Admin Manager'}</span>
            <span className="admin-user-email">{user?.email || 'admin@phongtro247.com'}</span>
          </div>
          <button onClick={logout} className="admin-logout-btn">
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Nội dung chức năng hiển thị bên phải */}
      <main className="admin-content-area">
        <header className="admin-topbar"></header>
        <div className="admin-main-body">{children}</div>
      </main>
    </div>
  );
}