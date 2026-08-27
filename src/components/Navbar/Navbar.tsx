'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSavedPosts } from '@/context/SavedPostsContext';
import { useChat } from '@/context/ChatContext';
import { useNotifications } from '@/context/NotificationContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Home,
  Heart,
  MessageSquare,
  Bell,
  ChevronDown,
  History,
  Star,
  Settings,
  LogOut,
  PlusCircle,
  CheckCircle2,
  UserCheck,
  Headphones,
  Sun,
  Moon,
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { savedPosts } = useSavedPosts();
  const { unreadCount } = useChat();
  const { theme, toggleTheme } = useTheme();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount: unreadNotiCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const displayName = user?.full_name || user?.email || 'Người dùng';
  const avatarChar = displayName.trim().charAt(0).toUpperCase();
  const savedCountLabel = savedPosts.length > 9 ? '9+' : savedPosts.length;

  return (
    <header className="navbar-header" ref={navbarRef}>
      <div className="navbar-container">

        {/* LOGO */}
        <Link href="/" className="navbar-logo" onClick={() => setActiveMenu(null)}>
          <div className="logo-icon-wrapper">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="logo-text">PhongTro<span className="text-orange-highlight">247</span></span>
        </Link>

        {/* NHÓM CHỨC NĂNG BÊN PHẢI */}
        <div className="navbar-actions">

          {/* 1. ICON & DROPDOWN TIN ĐÃ LƯU */}
          <div className="dropdown-wrapper">
            <button
              type="button"
              className={`icon-btn ${activeMenu === 'saved' ? 'active' : ''}`}
              onClick={() => toggleMenu('saved')}
              title="Tin đăng đã lưu"
              aria-label="Saved posts"
            >
              <Heart className="w-5 h-5" />
              {savedPosts.length > 0 && (
                <span className="badge badge-red">{savedCountLabel}</span>
              )}
            </button>

            {activeMenu === 'saved' && (
              <div className="dropdown-menu dropdown-popover animate-fade-in">
                <div className="popover-header">
                  <span className="font-bold text-gray-800">Tin đã lưu ({savedPosts.length})</span>
                  <Link href="/saved-posts" className="text-link" onClick={() => setActiveMenu(null)}>
                    Xem tất cả
                  </Link>
                </div>
                <div className="popover-list">
                  {savedPosts.length > 0 ? (
                    savedPosts.slice(0, 3).map((item) => {
                      const room = item.room || item;
                      return (
                        <Link
                          key={item.id || room.id}
                          href={`/rooms/${room.id}`}
                          className="popover-item"
                          onClick={() => setActiveMenu(null)}
                        >
                          <img
                            src={room.thumbnail || room.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                            alt={room.title || 'Phòng trọ'}
                            className="popover-thumb"
                          />
                          <div className="popover-info">
                            <p className="popover-title">{room.title}</p>
                            <span className="popover-price">
                              {room.price ? `${Number(room.price).toLocaleString('vi-VN')} đ/tháng` : 'Thỏa thuận'}
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="popover-empty">
                      <Heart className="w-6 h-6" />
                      <p>Chưa có tin nào được lưu.<br />Nhấn biểu tượng trái tim ở tin bạn thích.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. ICON TIN NHẮN */}
          <Link
            href="/chat"
            className="icon-btn"
            title="Tin nhắn"
            aria-label="Messages"
            onClick={() => setActiveMenu(null)}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="badge badge-orange">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* 3. ICON CHUÔNG & DROPDOWN THÔNG BÁO */}
          <div className="dropdown-wrapper">
            <button
              type="button"
              className={`icon-btn ${activeMenu === 'noti' ? 'active' : ''}`}
              onClick={() => toggleMenu('noti')}
              title="Thông báo"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotiCount > 0 && (
                <span className="badge badge-orange badge-pulse">
                  {unreadNotiCount > 99 ? '99+' : unreadNotiCount}
                </span>
              )}
            </button>

            {activeMenu === 'noti' && (
              <div className="dropdown-menu dropdown-popover animate-fade-in">
                <div className="popover-header">
                  <span className="font-bold text-gray-800">Thông báo</span>
                  {unreadNotiCount > 0 && (
                    <button type="button" className="text-link-btn" onClick={() => markAllAsRead()}>
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
                <div className="popover-list">
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <div 
                        key={item.id} 
                        className={`noti-item ${!item.is_read ? 'unread' : ''}`}
                        onClick={() => {
                          if (!item.is_read) markAsRead(item.id);
                          if (item.target_url) window.location.href = item.target_url;
                          setActiveMenu(null);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="noti-icon">
                          {item.type === 'system' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Bell className="w-4 h-4 text-orange-500" />}
                        </div>
                        <div className="noti-content">
                          <p className="noti-title">{item.title}</p>
                          {item.body && <p className="noti-desc">{item.body}</p>}
                          <span className="noti-time">{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="popover-empty">
                      <Bell className="w-6 h-6" />
                      <p>Không có thông báo mới.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. NÚT ĐĂNG TIN */}
          <Link href="/post-room" className="btn-post" onClick={() => setActiveMenu(null)}>
            <PlusCircle className="w-4 h-4 btn-post-icon" />
            <span className="btn-post-text">Đăng tin</span>
          </Link>

          <div className="navbar-divider"></div>

          {/* 5. USER AVATAR & DROPDOWN TÀI KHOẢN */}
          {user ? (
            <div className="dropdown-wrapper">
              <button
                type="button"
                onClick={() => toggleMenu('profile')}
                className={`avatar-btn ${activeMenu === 'profile' ? 'active' : ''}`}
              >
                <div className="avatar-circle">
                  {user.avatar ? <img src={user.avatar} alt={displayName} /> : <span>{avatarChar}</span>}
                </div>
                <ChevronDown className={`chevron-icon ${activeMenu === 'profile' ? 'open' : ''}`} />
              </button>

              {activeMenu === 'profile' && (
                <div className="dropdown-menu dropdown-user-menu animate-fade-in">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar-circle">
                      {user.avatar ? <img src={user.avatar} alt={displayName} /> : <span>{avatarChar}</span>}
                    </div>
                    <div className="dropdown-user-name">{displayName}</div>
                  </div>

                  <div className="dropdown-section">
                    <div className="dropdown-section-title">Tiện ích</div>

                    {/* Nút truy cập Trang Quản Trị chỉ dành cho Admin */}
                    {user?.role?.toLowerCase() === 'admin' && (
                      <Link href="/admin/dashboard" className="dropdown-item" onClick={() => setActiveMenu(null)}>
                        <div className="item-left">
                          <Settings className="item-icon" style={{ color: '#4f46e5' }} />
                          <span style={{ color: '#4f46e5', fontWeight: 600 }}>Trang Quản Trị</span>
                        </div>
                      </Link>
                    )}

                    <Link href="/profile" className="dropdown-item" onClick={() => setActiveMenu(null)}>
                      <div className="item-left"><UserCheck className="item-icon text-orange" /><span>Xem thông tin & Bài đăng</span></div>
                    </Link>

                    <Link href="/saved-posts" className="dropdown-item" onClick={() => setActiveMenu(null)}>
                      <div className="item-left"><Heart className="item-icon text-red" /><span>Tin đã lưu</span></div>
                    </Link>
                    <Link href="/history" className="dropdown-item" onClick={() => setActiveMenu(null)}>
                      <div className="item-left"><History className="item-icon text-blue" /><span>Lịch sử xem tin</span></div>
                    </Link>
                    <Link href="/my-reviews" className="dropdown-item" onClick={() => setActiveMenu(null)}>
                      <div className="item-left"><Star className="item-icon text-yellow" /><span>Đánh giá từ tôi</span></div>
                    </Link>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-section">
                    <Link href="/settings" className="dropdown-item" onClick={() => setActiveMenu(null)}>
                      <div className="item-left"><Settings className="item-icon" /><span>Cài đặt tài khoản</span></div>
                    </Link>
                    <Link href="/support" className="dropdown-item" onClick={() => setActiveMenu(null)}>
                      <div className="item-left"><Headphones className="item-icon text-purple" /><span>Liên hệ & Trợ giúp</span></div>
                    </Link>

                    {/* CÔNG TẮC GẠT CHỌN CHẾ ĐỘ NỀN */}
                    <div className="dropdown-item theme-toggle-row" onClick={toggleTheme}>
                      <div className="theme-info">
                        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                        <span>Chế độ nền: <strong>{theme === 'dark' ? 'Tối' : 'Sáng'}</strong></span>
                      </div>
                      <div className={`theme-switch ${theme === 'dark' ? 'active' : ''}`}>
                        <span className="theme-switch-thumb" />
                      </div>
                    </div>

                    <button type="button" onClick={() => { setActiveMenu(null); logout(); }} className="dropdown-item logout-item">
                      <div className="item-left"><LogOut className="item-icon text-red" /><span>Đăng xuất</span></div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btn-group">
              <Link href="/login" className="btn-login">Đăng nhập</Link>
              <Link href="/register" className="btn-register">Đăng ký</Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
