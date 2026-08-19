'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Settings, User, Lock, Bell, Check } from 'lucide-react';
import './page.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>
          <Settings size={24} />
          Cài Đặt Tài Khoản
        </h1>
        <p>Cập nhật thông tin cá nhân và thiết lập mật khẩu.</p>
      </div>

      {saved && (
        <div className="success-banner" role="alert" aria-live="polite">
          <Check size={18} />
          <span>Đã cập nhật cài đặt thành công!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-card">
          <div className="field-group">
            <label htmlFor="full-name">Họ và tên</label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="field-group">
            <label htmlFor="email">Email (Không thể thay đổi)</label>
            <input
              id="email"
              type="email"
              disabled
              value={user?.email || 'user@example.com'}
            />
          </div>

          <div className="field-group">
            <label htmlFor="phone">Số điện thoại liên hệ</label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="settings-actions">
            <button type="submit" className="primary-btn">
              Lưu Thay Đổi
            </button>
          </div>
        </div>

        <div className="settings-sidebar">
          <div className="side-panel">
            <div className="panel-title">
              <User size={18} />
              <span>Thông tin tài khoản</span>
            </div>
            <p>{user?.full_name || 'Người dùng'}</p>
            <small>{user?.email || 'user@example.com'}</small>
          </div>

          <div className="side-panel">
            <div className="panel-title">
              <Lock size={18} />
              <span>Bảo mật</span>
            </div>
            <p>Đổi mật khẩu</p>
            <small>Khuyến nghị thay đổi định kỳ để tăng an toàn.</small>
          </div>

          <div className="side-panel">
            <div className="panel-title">
              <Bell size={18} />
              <span>Thông báo</span>
            </div>
            <p>Nhận thông báo mới</p>
            <small>Thông báo quan trọng về tin đăng và tài khoản.</small>
          </div>
        </div>
      </form>
    </div>
  );
}