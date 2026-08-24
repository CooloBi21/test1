'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAdminReportsApi, updateReportStatusApi } from '@/api/reportApi';
import { updateRoomStatus } from '@/api/roomApi';
import '../rooms/page.css';

interface Report {
  id: number;
  room_id: number;
  reporter_id: number;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at?: string;
  room?: {
    id: number;
    title: string;
  };
  reporter?: {
    id: number;
    full_name?: string;
    email?: string;
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminReportsApi();
      setReports(data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách báo cáo:', err);
      setError('Không thể tải danh sách báo cáo. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Xử lý Khóa bài viết vi phạm (Chuyển trạng thái phòng thành 'rejected' và báo cáo thành 'resolved')
  const handleBlockRoom = async (reportId: number, roomId: number) => {
    if (!confirm('Bạn có chắc muốn khóa bài đăng này do vi phạm?')) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
      await updateRoomStatus(roomId, 'rejected', token);
      await updateReportStatusApi(reportId, 'resolved');
      alert('Đã khóa bài viết thành công!');
      await fetchReports();
    } catch (err) {
      console.error('Lỗi khóa bài viết:', err);
      alert('Xử lý thất bại. Vui lòng thử lại!');
    }
  };

  // Bỏ qua báo cáo (Chuyển trạng thái báo cáo thành 'dismissed')
  const handleDismissReport = async (reportId: number) => {
    try {
      await updateReportStatusApi(reportId, 'dismissed');
      await fetchReports();
    } catch (err) {
      console.error('Lỗi cập nhật báo cáo:', err);
      alert('Cập nhật thất bại. Vui lòng thử lại!');
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Đang tải danh sách báo cáo...</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Quản lý báo cáo vi phạm</h1>
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
              <th>Bài đăng bị báo cáo</th>
              <th>Người báo cáo</th>
              <th>Lý do vi phạm</th>
              <th className="text-center" style={{ width: '130px' }}>Trạng thái</th>
              <th className="text-center" style={{ width: '180px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center" style={{ padding: '24px', color: '#6b7280' }}>
                  Chưa có báo cáo vi phạm nào.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td className="room-id">#{report.id}</td>
                  <td>
                    <a
                      href={`/rooms/${report.room_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="room-link"
                      style={{ color: '#2563eb', fontWeight: 500 }}
                    >
                      {report.room?.title || `Phòng #${report.room_id}`}
                    </a>
                  </td>
                  <td>
                    {report.reporter?.full_name || report.reporter?.email || `User #${report.reporter_id}`}
                  </td>
                  <td style={{ color: '#ef4444', fontSize: '13px', maxWidth: '250px' }}>
                    {report.reason}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge ${
                        report.status === 'resolved'
                          ? 'badge-approved'
                          : report.status === 'dismissed'
                          ? 'badge-rejected'
                          : 'badge-pending'
                      }`}
                    >
                      {report.status === 'resolved'
                        ? 'Đã khóa bài'
                        : report.status === 'dismissed'
                        ? 'Đã bỏ qua'
                        : 'Chờ xử lý'}
                    </span>
                  </td>
                  <td className="text-center">
                    {report.status === 'pending' ? (
                      <div className="action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleBlockRoom(report.id, report.room_id)}
                          className="btn btn-reject"
                        >
                          Khóa bài
                        </button>
                        <button
                          onClick={() => handleDismissReport(report.id)}
                          className="btn btn-approve"
                        >
                          Bỏ qua
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>Đã hoàn tất</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}