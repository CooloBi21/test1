'use client';

import { useEffect, useState } from 'react';
import { updateRoomStatus } from '@/api/roomApi';
import { useAuth } from '@/context/AuthContext';
import './page.css';

interface Room {
  id: number;
  title: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export default function AdminRoomsPage() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/rooms`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        const roomList = Array.isArray(data) ? data : data.data || [];
        setRooms(roomList);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách phòng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [token]);

  const handleStatusChange = async (id: number, newStatus: 'approved' | 'rejected') => {
    if (!token) {
      alert('Bạn chưa đăng nhập hoặc không có quyền thực hiện!');
      return;
    }

    setLoadingId(id);
    try {
      await updateRoomStatus(id, newStatus, token);
      
      setRooms((prev) =>
        prev.map((room) => (room.id === id ? { ...room, status: newStatus } : room))
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái bài đăng');
    } finally {
      setLoadingId(null);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (filterStatus === 'all') return true;
    return room.status === filterStatus;
  });

  if (loading) {
    return <div className="admin-empty">Đang tải danh sách bài đăng...</div>;
  }

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <h1 className="admin-title">Quản lý duyệt bài đăng</h1>
        
        <div className="admin-filter">
          <span className="admin-filter-label">Lọc trạng thái:</span>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="admin-select"
          >
            <option value="all">Tất cả ({rooms.length})</option>
            <option value="pending">Chờ duyệt ({rooms.filter(r => r.status === 'pending').length})</option>
            <option value="approved">Đã duyệt ({rooms.filter(r => r.status === 'approved').length})</option>
            <option value="rejected">Bị từ chối ({rooms.filter(r => r.status === 'rejected').length})</option>
          </select>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="admin-empty">Không có bài đăng nào tương ứng.</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th>Tiêu đề bài đăng</th>
                <th className="text-center" style={{ width: '140px' }}>Trạng thái</th>
                <th className="text-center" style={{ width: '180px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td className="room-id">#{room.id}</td>
                  <td>
                    <a 
                      href={`/rooms/${room.id}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="room-link"
                    >
                      {room.title}
                    </a>
                  </td>
                  <td className="text-center">
                    <span className={`badge badge-${room.status}`}>
                      {room.status === 'approved' 
                        ? 'Đã duyệt' 
                        : room.status === 'rejected' 
                        ? 'Từ chối' 
                        : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="action-buttons">
                      <button
                        disabled={loadingId === room.id || room.status === 'approved'}
                        onClick={() => handleStatusChange(room.id, 'approved')}
                        className="btn btn-approve"
                      >
                        {loadingId === room.id ? '...' : 'Duyệt'}
                      </button>
                      <button
                        disabled={loadingId === room.id || room.status === 'rejected'}
                        onClick={() => handleStatusChange(room.id, 'rejected')}
                        className="btn btn-reject"
                      >
                        {loadingId === room.id ? '...' : 'Từ chối'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}