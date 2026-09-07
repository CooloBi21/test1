'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        const res = await fetch(`${apiUrl}/auth/profile`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const currentUser = await res.json();
        setUser(currentUser);
      } catch (error) {
        console.error('Không thể khôi phục phiên đăng nhập:', error);
        setUser(null);
      }
    };

    restoreSession();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
