'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createRoomPost } from '@/api/roomApi';
import { getProvinces, getDistrictsByProvince } from '@/api/locationApi';
import { PlusCircle, CheckCircle, X } from 'lucide-react';
import './page.css';

export default function PostRoomPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [externalImageUrls, setExternalImageUrls] = useState<string[]>([]);
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    area: '',
    city: '',
    district: '',
    addressLine: '',
    content: '',
  });

  // 1. LẤY DỮ LIỆU TỈNH/THÀNH TỪ API
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách Tỉnh/Thành:", error);
      }
    };
    fetchProvinces();
  }, []);

  // 2. LẤY DỮ LIỆU QUẬN/HUYỆN KHI CHỌN TỈNH
  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.city) {
        try {
          const data = await getDistrictsByProvince(formData.city);
          setDistricts(data || []);
        } catch (error) {
          console.error("Lỗi khi tải danh sách Quận/Huyện:", error);
        }
      } else {
        setDistricts([]);
        setFormData(prev => ({ ...prev, district: '' }));
      }
    };
    
    fetchDistricts();
  }, [formData.city]);

  const handleAddImageUrl = () => {
    const trimmedUrl = imageUrlInput.trim();
    if (!trimmedUrl) return;
    setExternalImageUrls((prev) => [...prev, trimmedUrl]);
    setImageUrlInput('');
  };

  const handleResetForm = () => {
    setFormData({
      title: '',
      price: '',
      area: '',
      city: '',
      district: '',
      addressLine: '',
      content: '',
    });
    setExternalImageUrls([]);
    setImageUrlInput('');
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Vui lòng đăng nhập để đăng tin!");
      return;
    }

    if (externalImageUrls.length === 0) {
      alert("Vui lòng thêm ít nhất 1 hình ảnh thực tế!");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const fullContent = formData.addressLine 
        ? `📍${formData.addressLine}\n\n${formData.content}`
        : formData.content;

      const payload = {
        title: formData.title,
        price: Number(formData.price),
        area: Number(formData.area),
        city: formData.city,             
        district: formData.district,     
        content: fullContent,            
        thumbnail: externalImageUrls[0] || "", 
      };
      
      await createRoomPost(payload);
      setSubmitted(true);
      
    } catch (error: any) {
      alert(error.message || "Đã xảy ra lỗi khi đăng tin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-box" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '40px auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <CheckCircle size={60} color="#16a34a" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '12px' }}>Gửi tin đăng thành công!</h2>
        <p style={{ color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
          Bài viết của bạn đã được tiếp nhận và đang chờ Admin kiểm duyệt trước khi hiển thị công khai.
        </p>
        <button onClick={handleResetForm} className="btn-submit" style={{ padding: '12px 32px', maxWidth: 'max-content', margin: '0 auto' }}>
          Đăng tin mới
        </button>
      </div>
    );
  }

  return (
    <div className="post-room-container">
      <div className="post-room-header">
        <h1 className="post-room-title"><PlusCircle color="#ea580c" /> Đăng Tin Cho Thuê</h1>
      </div>

      <form onSubmit={handleSubmit} className="post-room-form">
        <div className="form-group">
          <label>Tiêu đề bài đăng *</label>
          <input type="text" required className="form-control" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>

        <div className="grid-2-cols">
          <div className="form-group">
            <label>Giá cho thuê (VNĐ/tháng) *</label>
            <input type="number" required className="form-control" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Diện tích (m²) *</label>
            <input type="number" required className="form-control" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
          </div>
        </div>

        <div className="grid-2-cols">
          <div className="form-group">
            <label>Tỉnh / Thành phố *</label>
            <select
              required
              className="form-control"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value, district: '' })} 
            >
              <option value="">-- Chọn Tỉnh/Thành phố --</option>
              {provinces.map(prov => (
                <option key={prov.code} value={prov.code}>
                  {prov.name_with_type || prov.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quận / Huyện *</label>
            <select
              required
              className="form-control"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              disabled={!formData.city || provinces.length === 0} 
            >
              <option value="">-- Chọn Quận/Huyện --</option>
              {districts.map(dist => (
                <option key={dist.code} value={dist.code}>
                  {dist.name_with_type || dist.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Số nhà, ngõ, tên đường (Tùy chọn)</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Ví dụ: 123/45 Lê Lợi, Phường Bến Thành" 
            value={formData.addressLine} 
            onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })} 
          />
        </div>

        <div className="form-group">
          <label>Hình ảnh thực tế *</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="url" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="Link ảnh..." className="form-control" />
            <button type="button" onClick={handleAddImageUrl} className="btn-add-image">Thêm ảnh</button>
          </div>
          
          {externalImageUrls.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginTop: '12px' }}>
              {externalImageUrls.map((url) => (
                <div key={url} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
                  <img src={url} alt="Ảnh phòng" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => setExternalImageUrls(prev => prev.filter(u => u !== url))}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                  >
                    <X size={14} style={{ margin: 'auto' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Nội dung mô tả</label>
          <textarea rows={5} className="form-control" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
        </div>

        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : 'Đăng Tin Ngay'}
        </button>
      </form>
    </div>
  );
}