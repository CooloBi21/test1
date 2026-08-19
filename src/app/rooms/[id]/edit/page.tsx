'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRoomById, updateRoomPost } from '@/api/roomApi';
import { getDistrictsByProvince, getProvinces } from '@/api/locationApi';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';
import styles from './edit-room.module.css';
import type { DistrictItem, ProvinceItem } from '@/components/Filter/Filter';

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
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách Tỉnh/Thành:', error);
      }
    };

    fetchProvinces();
  }, []);

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
          city: String(room.province_code ?? room.city ?? ''),
          district: String(room.district_code ?? room.district ?? ''),
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

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.city) {
        setDistricts([]);
        return;
      }

      try {
        const data = await getDistrictsByProvince(formData.city);
        setDistricts(data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách Quận/Huyện:', error);
        setDistricts([]);
      }
    };

    fetchDistricts();
  }, [formData.city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'area' ? Number(value) : value
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      city: e.target.value,
      district: ''
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
    return <div className={styles.loading}>Đang tải dữ liệu bài đăng...</div>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Chỉnh sửa bài đăng</h1>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.backButton}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tiêu đề bài đăng</label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.input}
              placeholder="Nhập tiêu đề phòng trọ..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Giá thuê (VNĐ/tháng)</label>
              <input
                required
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Diện tích (m²)</label>
              <input
                required
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Thành phố / Tỉnh</label>
              <select
                required
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                className={styles.select}
              >
                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                {provinces.map((province) => (
                  <option key={province.code} value={String(province.code)}>
                    {province.name_with_type || province.name || province.code}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Quận / Huyện</label>
              <select
                required
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={styles.select}
                disabled={!formData.city || districts.length === 0}
              >
                <option value="">
                  {!formData.city ? '-- Chọn Tỉnh/Thành trước --' : '-- Chọn Quận/Huyện --'}
                </option>
                {districts.map((district) => (
                  <option key={district.code} value={String(district.code)}>
                    {district.name_with_type || district.name || district.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>URL Ảnh Thumbnail</label>
            <input
              type="text"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              className={styles.input}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nội dung mô tả chi tiết</label>
            <textarea
              required
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              className={styles.textarea}
              placeholder="Mô tả chi tiết phòng trọ..."
            ></textarea>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className={styles.btnCancel}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={styles.btnSubmit}
            >
              <Save size={18} />
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
