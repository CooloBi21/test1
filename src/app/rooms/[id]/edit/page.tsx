'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRoomById, updateRoomPost } from '@/api/roomApi';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';
import styles from './edit-room.module.css';

type RoomFormData = {
  title: string;
  thumbnail: string;
  price: number;
  area: number;
  city: string;
  district: string;
  content: string;
};

export default function EditRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const roomId = params?.id as string;

  const [formData, setFormData] = useState<RoomFormData>({
    title: '',
    thumbnail: '',
    price: 0,
    area: 0,
    city: '',
    district: '',
    content: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        setLoading(true);
        const room = await getRoomById(roomId);

        if (!room) {
          alert('Không tìm thấy thông tin phòng!');
          router.push('/profile');
          return;
        }

        // Kiểm tra quyền sở hữu bài đăng
        const ownerId = room.userId ?? (room as any).user_id;
        if (user && String(ownerId) !== String(user.id)) {
          alert('Bạn không có quyền chỉnh sửa bài đăng này');
          router.push('/profile');
          return;
        }

        setFormData({
          title: room.title || '',
          thumbnail: room.thumbnail || '',
          price: Number(room.price || 0),
          area: Number(room.area || 0),
          city: String(room.city || room.city_name || ''),
          district: String(room.district || room.district_name || ''),
          content: room.content || ''
        });
      } catch (error) {
        console.error('Lỗi khi tải thông tin phòng:', error);
        alert('Có lỗi xảy ra khi lấy dữ liệu phòng');
        router.push('/profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRoom();
    }
  }, [roomId, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'area' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Tự động sử dụng getToken() bên trong roomApi
      await updateRoomPost(roomId, formData);
      alert('Cập nhật bài đăng thành công!');
      router.push(`/rooms/${roomId}`);
    } catch (error: any) {
      console.error('Lỗi khi cập nhật:', error);
      alert(error.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 font-medium">Đang tải dữ liệu bài đăng...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl border border-gray-200 shadow-sm my-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa bài đăng</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề bài đăng</label>
          <input
            required
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            placeholder="Nhập tiêu đề phòng trọ..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Giá thuê (VNĐ/tháng)</label>
            <input
              required
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Diện tích (m²)</label>
            <input
              required
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Thành phố / Tỉnh</label>
            <input
              required
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quận / Huyện</label>
            <input
              required
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">URL Ảnh Thumbnail</label>
          <input
            type="text"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung mô tả chi tiết</label>
          <textarea
            required
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            placeholder="Mô tả chi tiết phòng trọ..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <Save size={18} />
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
