'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import GoogleLoginButton from '@/components/GoogleLoginButton/GoogleLoginButton';
import './page.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // State quản lý Banned Modal
  const [bannedInfo, setBannedInfo] = useState<{ isBanned: boolean; reason: string }>({
    isBanned: false,
    reason: '',
  });

  const redirectByRole = (loggedInUser: any) => {
    if (loggedInUser?.role?.toLowerCase() === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Kiểm tra lỗi 403 khi tài khoản bị khóa (Banned)
        if (res.status === 403 && data.banned) {
          setBannedInfo({
            isBanned: true,
            reason: data.reason || 'Vi phạm điều khoản sử dụng.',
          });
          return;
        }

        throw new Error(
          data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!'
        );
      }

      login(data.access_token, data.user);
      redirectByRole(data.user);
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-row">
              <label htmlFor="password">Mật khẩu</label>
              <Link href="/forgot-password" className="link-muted">
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
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '20px 0',
            color: '#94a3b8',
            fontSize: '13px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ padding: '0 10px', fontWeight: 600 }}>HOẶC</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLoginButton
            text="signin_with"
            onSuccess={(data) => {
              login(data.access_token, data.user);
              redirectByRole(data.user);
            }}
            onError={(err: any) => {
              if (typeof err === 'object' && err?.banned) {
                setBannedInfo({
                  isBanned: true,
                  reason: err.reason || 'Vi phạm điều khoản sử dụng.',
                });
              } else {
                setError(
                  typeof err === 'string' ? err : 'Đăng nhập Google thất bại'
                );
              }
            }}
          />
        </div>

        <p className="login-footer">
          Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
        </p>
      </div>

      {/* UI Modal hiển thị khi bị Khóa tài khoản */}
      {bannedInfo.isBanned && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '90%',
              boxShadow:
                '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px',
              }}
            >
              🚫
            </div>
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: '20px',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              Tài khoản bị tạm khóa
            </h2>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px' }}>
              Tài khoản của bạn đã bị khóa bởi Quản trị viên với lý do:
            </p>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 16px',
                borderRadius: '8px',
                color: '#dc2626',
                fontWeight: 500,
                fontSize: '14px',
                marginBottom: '24px',
                textAlign: 'left',
              }}
            >
              "{bannedInfo.reason}"
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setBannedInfo({ isBanned: false, reason: '' })}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Đóng
              </button>
              <a
                href="/support"
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 500,
                  display: 'inline-block',
                }}
              >
                Liên hệ & Trợ giúp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}