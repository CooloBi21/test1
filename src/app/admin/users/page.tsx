'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import '../rooms/page.css';

interface UserItem {
  id: number;
  full_name: string | null;
  email: string;
  role: string;
  is_banned: boolean;
  ban_reason?: string | null;
  created_at?: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [banModal, setBanModal] = useState<{ open: boolean; user: UserItem | null; reason: string }>({
    open: false,
    user: null,
    reason: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const superAdminEmail = 'ggmaytinh@gmail.com';
  const isSuperAdmin = currentUser?.email === superAdminEmail;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';

      const res = await fetch(`${apiUrl}/api/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Không thể tải danh sách người dùng');
      }

      const data = await res.json();
      setUsers(data || []);
    } catch (err: any) {
      console.error('Lỗi tải danh sách người dùng:', err);
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = async (targetUser: UserItem) => {
    if (!isSuperAdmin) {
      alert('Chỉ tài khoản Super Admin gốc mới có quyền cấp/hạ quyền Admin!');
      return;
    }

    const isCurrentAdmin = targetUser.role.toLowerCase() === 'admin';
    const newRole = isCurrentAdmin ? 'renter' : 'admin';
    const actionText = isCurrentAdmin ? 'hạ xuống RENTER' : 'thăng lên ADMIN';

    if (!confirm(`Xác nhận ${actionText} cho tài khoản ${targetUser.email}?`)) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
      const res = await fetch(`${apiUrl}/api/admin/users/${targetUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Cập nhật vai trò thất bại');
      }

      alert(`Đã ${actionText} thành công!`);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Xử lý thất bại. Vui lòng thử lại.');
    }
  };

  const handleConfirmBan = async () => {
    if (!banModal.reason.trim()) {
      alert('Vui lòng nhập lý do khóa!');
      return;
    }

    if (!banModal.user) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
      const res = await fetch(`${apiUrl}/api/admin/users/${banModal.user.id}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: banModal.reason }),
      });

      if (!res.ok) {
        throw new Error('Khóa tài khoản thất bại');
      }

      setBanModal({ open: false, user: null, reason: '' });
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Xử lý thất bại. Vui lòng thử lại.');
    }
  };

  const handleUnban = async (id: number) => {
    if (!confirm('Xác nhận mở khóa tài khoản này?')) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
      const res = await fetch(`${apiUrl}/api/admin/users/${id}/unban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Mở khóa thất bại');
      }

      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Xử lý thất bại. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Đang tải danh sách người dùng...</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Quản lý người dùng</h1>
      </div>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '16px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-center" style={{ width: '220px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center" style={{ padding: '24px', color: '#6b7280' }}>
                  Không có người dùng nào.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isAdminRole = u.role.toLowerCase() === 'admin';
                return (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.full_name || 'Chưa cập nhật'}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          color: isAdminRole ? '#7c3aed' : '#475569',
                          backgroundColor: isAdminRole ? '#f3e8ff' : '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${u.is_banned ? 'badge-rejected' : 'badge-approved'}`}>
                        {u.is_banned ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        {/* 1. Nút Thăng/Hạ ADMIN */}
                        {isSuperAdmin && u.email !== superAdminEmail && (
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="btn"
                            style={{
                              backgroundColor: isAdminRole ? '#d97706' : '#4f46e5',
                              color: '#ffffff',
                              fontSize: '12px',
                              padding: '4px 8px',
                            }}
                          >
                            {isAdminRole ? 'Hạ RENTER' : 'Lên ADMIN'}
                          </button>
                        )}

                        {/* 2. Nút Khóa / Mở khóa: Ẩn hoàn toàn đối với Super Admin */}
                        {u.email !== superAdminEmail && (
                          u.is_banned ? (
                            <button
                              onClick={() => handleUnban(u.id)}
                              className="btn btn-approve"
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                            >
                              Mở khóa
                            </button>
                          ) : (
                            <button
                              onClick={() => setBanModal({ open: true, user: u, reason: '' })}
                              className="btn btn-reject"
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                            >
                              Khóa
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nhập lý do khóa */}
      {banModal.open && (
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
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              width: '420px',
              maxWidth: '90%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '8px', color: '#0f172a' }}>
              Khóa tài khoản #{banModal.user?.id}
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
              Nhập nội dung lý do khóa / phê bình gửi tới người dùng:
            </p>
            <textarea
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '14px',
                resize: 'none',
              }}
              placeholder="VD: Sử dụng từ ngữ thô tục khi đăng bài, vi phạm nhiều lần..."
              value={banModal.reason}
              onChange={(e) => setBanModal({ ...banModal, reason: e.target.value })}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => setBanModal({ open: false, user: null, reason: '' })}
                className="btn"
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
              >
                Hủy
              </button>
              <button onClick={handleConfirmBan} className="btn btn-reject">
                Xác nhận khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}