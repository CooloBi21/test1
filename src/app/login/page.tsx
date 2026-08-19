'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import './page.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
      }

      login(data.access_token, data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Chào mừng trở lại! 👋</h2>
          <p className="login-subtitle">
            Đăng nhập để quản lý tin đăng và tìm kiếm phòng trọ dễ dàng.
          </p>
        </div>

        {error && (
          <div className="error-message" role="alert" aria-live="polite">
            <AlertCircle size={18} className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Địa chỉ Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="vidu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-row">
              <label htmlFor="password">Mật khẩu</label>
              <Link href="#" className="link-muted">
                Quên mật khẩu?
              </Link>
            </div>

            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="login-footer">
          Chưa có tài khoản?{' '}
          <Link href="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}