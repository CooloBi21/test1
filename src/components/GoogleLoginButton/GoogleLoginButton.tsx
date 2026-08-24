'use client';

import { GoogleLogin } from '@react-oauth/google';

interface GoogleLoginButtonProps {
  onSuccess: (data: { access_token: string; user: any }) => void;
  onError?: (error: any) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  text = 'signin_with',
}: GoogleLoginButtonProps) {
  const handleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('Không nhận được credential từ Google');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw data;

      onSuccess(data);
    } catch (err) {
      console.error('Google Login Error:', err);
      if (onError) onError(err);
    }
  };

  return (
    <div className="w-full flex justify-center my-3">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError && onError('Đăng nhập Google thất bại')}
        text={text}
        shape="rectangular"
        theme="outline"
        width="100%"
      />
    </div>
  );
}