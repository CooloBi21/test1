'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, Clock, Trash2, ChevronRight, X } from 'lucide-react';
import { getViewHistory, clearAllHistory, deleteHistoryItem } from '@/api/roomApi';

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Lấy danh sách lịch sử xem và LỌC TRÙNG LẶP bài đăng
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getViewHistory();
        if (Array.isArray(data)) {
          // Khử trùng bài đăng theo room_id (giữ lại bản ghi xem mới nhất)
          const uniqueMap = new Map();
          data.forEach((item) => {
            const roomId = item.room_id || item.room?.id || item.id;
            if (!uniqueMap.has(roomId)) {
              uniqueMap.set(roomId, item);
            }
          });
          setHistoryList(Array.from(uniqueMap.values()));
        } else {
          setHistoryList([]);
        }
      } catch (error) {
        console.error('Lỗi khi tải lịch sử xem:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // 2. Xóa toàn bộ lịch sử
  const handleClearAll = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem?')) return;
    try {
      await clearAllHistory();
      setHistoryList([]);
    } catch (error) {
      alert('Không thể xóa toàn bộ lịch sử!');
    }
  };

  // 3. Xóa 1 mục khỏi lịch sử
  const handleRemoveItem = async (roomId: number) => {
    try {
      await deleteHistoryItem(roomId);
      setHistoryList((prev) => prev.filter((item) => (item.room_id || item.room?.id) !== roomId));
    } catch (error) {
      console.error('Lỗi khi xóa mục lịch sử:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '32px auto', textAlign: 'center', color: '#64748b' }}>
        Đang tải lịch sử xem...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '32px auto', padding: '0 16px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <History color="#2563eb" /> Lịch Sử Xem Tin
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            Danh sách các bài đăng bạn đã truy cập gần đây.
          </p>
        </div>
        {historyList.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={15} /> Xóa lịch sử
          </button>
        )}
      </div>

      {historyList.length === 0 ? (
        <div style={{ background: '#ffffff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <History size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', margin: 0 }}>Lịch sử xem tin trống.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {historyList.map((item) => {
            const room = item.room || item;
            const roomId = item.room_id || room.id;
            const formattedPrice = Number(room.price || 0).toLocaleString('vi-VN');
            const timeText = item.viewed_at
              ? new Date(item.viewed_at).toLocaleDateString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                })
              : 'Vừa xong';

            return (
              <div
                key={item.id || roomId}
                style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
              >
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                    {room.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                    <span style={{ color: '#ea580c', fontWeight: 700 }}>{formattedPrice} đ/tháng</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {timeText}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Link
                    href={`/rooms/${roomId}`}
                    style={{ color: '#ea580c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '14px' }}
                  >
                    Xem lại <ChevronRight size={16} />
                  </Link>

                  <button
                    onClick={() => handleRemoveItem(roomId)}
                    title="Xóa khỏi lịch sử"
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}