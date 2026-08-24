'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import './page.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/auth/forgot-password`, { email });
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => router.push('/login'), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2 className="forgot-title">Khôi phục mật khẩu</h2>
        <p className="forgot-desc">Nhập email, chúng tôi sẽ gửi mật khẩu ngẫu nhiên để bạn đăng nhập.</p>
        
        {message.text && (
          <div className={`message-box ${message.type === 'success' ? 'msg-success' : 'msg-error'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="email" required placeholder="Nhập email của bạn" className="form-input" 
                   value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? 'Đang gửi...' : 'Gửi mật khẩu mới'}
          </button>
        </form>
        <a href="/login" className="back-link">Quay lại đăng nhập</a>
      </div>
    </div>
  );
}