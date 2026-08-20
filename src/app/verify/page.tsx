'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './verify.module.css';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác thực tài khoản của bạn...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Mã xác thực không hợp lệ hoặc đã bị thiếu!');
      return;
    }

    const verifyEmail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/auth/verify?token=${token}`);
        
        setStatus('success');
        setMessage(response.data.message || 'Xác thực tài khoản thành công!');

        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 'Xác thực thất bại. Đường dẫn có thể đã hết hạn hoặc không hợp lệ!'
        );
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className={styles.card}>
      {/* TRẠNG THÁI LOADING */}
      {status === 'loading' && (
        <div className={styles.wrapper}>
          <div className={styles.spinnerWrapper}>
            <div className={styles.spinnerPing}></div>
            <div className={styles.spinnerMain}></div>
          </div>
          <h2 className={styles.title}>Đang xử lý</h2>
          <p className={styles.message}>{message}</p>
        </div>
      )}

      {/* TRẠNG THÁI THÀNH CÔNG */}
      {status === 'success' && (
        <div className={styles.wrapper}>
          <div className={styles.iconSuccess}>
            <svg className={styles.svgIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className={styles.title}>Kích hoạt thành công!</h2>
          <p className={styles.message}>{message}</p>
          <div className={styles.redirectBadge}>
            <svg className={styles.spinnerSmall} fill="none" viewBox="0 0 24 24">
              <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span>Đang chuyển hướng về trang đăng nhập...</span>
          </div>
        </div>
      )}

      {/* TRẠNG THÁI LỖI */}
      {status === 'error' && (
        <div className={styles.wrapper}>
          <div className={styles.iconError}>
            <svg className={styles.svgIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className={styles.title}>Xác thực thất bại</h2>
          <p className={styles.message}>{message}</p>
          <button onClick={() => router.push('/login')} className={styles.button}>
            Quay lại trang đăng nhập
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={
        <div className={styles.card}>
          <div className={styles.spinnerMain} style={{ margin: '0 auto 1rem' }}></div>
          <p className={styles.message}>Đang tải...</p>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}