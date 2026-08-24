'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Settings, User, Lock, Bell, Check, AlertCircle, KeyRound, Save } from 'lucide-react';
import './page.css';

export default function SettingsPage() {
  const { user, login } = useAuth();

  // State Cập nhật Profile
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // State Đổi mật khẩu
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Xử lý cập nhật thông tin cá nhân
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await axios.put(
        `${apiUrl}/auth/profile`,
        { full_name: fullName, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Đồng bộ lại AuthContext & LocalStorage
      login(token!, res.data);
      setProfileMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (error: any) {
      setProfileMsg({
        type: 'error',
        text: error.response?.data?.message || 'Lỗi cập nhật thông tin cá nhân.',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới không khớp!' });
      return;
    }

    setPassLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.post(
        `${apiUrl}/auth/change-password`,
        { current_password: currentPass, new_password: newPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (error: any) {
      setPassMsg({
        type: 'error',
        text: error.response?.data?.message || 'Lỗi khi thay đổi mật khẩu.',
      });
    } finally {
      setPassLoading(false);
    }
  };

  if (!user) {
    return <div className="settings-loading">Đang tải thông tin...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>
          <Settings size={28} /> Cài Đặt Tài Khoản
        </h1>
        <p>Cập nhật thông tin cá nhân và thiết lập bảo mật mật khẩu.</p>
      </div>

      <div className="settings-layout">
        <div className="settings-main">
          {/* Card 1: Thông tin cá nhân */}
          <div className="settings-card">
            <div className="card-header">
              <User size={20} />
              <h2>Thông tin cá nhân</h2>
            </div>

            {profileMsg.text && (
              <div className={`message ${profileMsg.type}`} role="alert">
                {profileMsg.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="settings-form-group">
              <div className="form-field">
                <label htmlFor="full-name">Họ và tên</label>
                <input
                  id="full-name"
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email (Không thể thay đổi)</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={user.email}
                  disabled
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Số điện thoại liên hệ</label>
                <input
                  id="phone"
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={profileLoading}>
                <Save size={18} />
                {profileLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </form>
          </div>

          {/* Card 2: Đổi mật khẩu */}
          <div className="settings-card">
            <div className="card-header">
              <KeyRound size={20} />
              <h2>🔒 Đổi mật khẩu</h2>
            </div>
            <p className="card-subtitle">
              Nếu bạn đang dùng mật khẩu tạm thời (mã Hex), vui lòng nhập vào ô "Mật khẩu hiện tại".
            </p>

            {passMsg.text && (
              <div className={`message ${passMsg.type}`} role="alert">
                {passMsg.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                <span>{passMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="settings-form-group">
              <div className="form-field">
                <label htmlFor="current-pass">Mật khẩu hiện tại</label>
                <input
                  id="current-pass"
                  type="password"
                  className="form-input"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="new-pass">Mật khẩu mới</label>
                <input
                  id="new-pass"
                  type="password"
                  minLength={6}
                  className="form-input"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Nhập ít nhất 6 ký tự"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="confirm-pass">Nhập lại mật khẩu mới</label>
                <input
                  id="confirm-pass"
                  type="password"
                  minLength={6}
                  className="form-input"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              <button type="submit" className="btn-secondary" disabled={passLoading}>
                <Lock size={18} />
                {passLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="settings-sidebar">
          <div className="side-panel">
            <div className="panel-title">
              <User size={18} />
              <span>Thông tin tài khoản</span>
            </div>
            <p className="user-name">{user.full_name || 'Người dùng'}</p>
            <small className="user-email">{user.email}</small>
          </div>

          <div className="side-panel">
            <div className="panel-title">
              <Lock size={18} />
              <span>Bảo mật</span>
            </div>
            <p className="panel-body">Đổi mật khẩu định kỳ</p>
            <small>Khuyến nghị thay đổi định kỳ để bảo vệ tài khoản tốt hơn.</small>
          </div>

          <div className="side-panel">
            <div className="panel-title">
              <Bell size={18} />
              <span>Thông báo</span>
            </div>
            <p className="panel-body">Hệ thống gửi mail</p>
            <small>Mọi hoạt động đổi mật khẩu sẽ gửi email thông báo cho bạn.</small>
          </div>
        </div>
      </div>
    </div>
  );
}