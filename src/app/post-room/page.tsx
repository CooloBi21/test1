'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createRoomPost, uploadRoomImages } from '@/api/roomApi';
import { getProvinces, getDistrictsByProvince } from '@/api/locationApi';
import {
  AirVent,
  AlertTriangle,
  Camera,
  Car,
  CheckCircle,
  Clock,
  Link as LinkIcon,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Wifi,
} from 'lucide-react';
import './page.css';

const ACCEPTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif', 'heic', 'heif', 'svg'];
const ACCEPTED_IMAGE_TYPES = ACCEPTED_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',');

type LocalImagePreview = {
  id: string;
  file: File;
  previewUrl: string;
};

const AMENITY_OPTIONS = [
  { value: 'Wifi', icon: Wifi },
  { value: 'Điều hòa', icon: AirVent },
  { value: 'Chỗ để xe', icon: Car },
  { value: 'Giờ giấc tự do', icon: Clock },
  { value: 'Camera an ninh', icon: Camera },
  { value: 'Bảo vệ', icon: ShieldCheck },
  { value: 'Nội thất cơ bản', icon: Sparkles },
];

const isImageFile = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return file.type.startsWith('image/') || Boolean(extension && ACCEPTED_IMAGE_EXTENSIONS.includes(extension));
};

export default function PostRoomPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [externalImageUrls, setExternalImageUrls] = useState<string[]>([]);
  const [localImages, setLocalImages] = useState<LocalImagePreview[]>([]);
  const localImagesRef = useRef<LocalImagePreview[]>([]);
  const [imageInputError, setImageInputError] = useState('');

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');

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

  const totalImageCount = externalImageUrls.length + localImages.length;
  const selectedAmenitiesLabel = useMemo(() => selectedAmenities.join(', '), [selectedAmenities]);

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
    const fetchDistricts = async () => {
      if (formData.city) {
        try {
          const data = await getDistrictsByProvince(formData.city);
          setDistricts(data || []);
        } catch (error) {
          console.error('Lỗi khi tải danh sách Quận/Huyện:', error);
        }
      } else {
        setDistricts([]);
        setFormData((prev) => ({ ...prev, district: '' }));
      }
    };

    fetchDistricts();
  }, [formData.city]);

  useEffect(() => {
    localImagesRef.current = localImages;
  }, [localImages]);

  useEffect(() => {
    return () => {
      localImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const handleAddImageUrl = () => {
    const trimmedUrl = imageUrlInput.trim();
    if (!trimmedUrl) return;
    setExternalImageUrls((prev) => (prev.includes(trimmedUrl) ? prev : [...prev, trimmedUrl]));
    setImageUrlInput('');
  };

  const handleLocalImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const accepted = files.filter(isImageFile);
    const rejectedCount = files.length - accepted.length;

    if (rejectedCount > 0) {
      setImageInputError(`Đã bỏ qua ${rejectedCount} file không phải ảnh. Hỗ trợ: ${ACCEPTED_IMAGE_EXTENSIONS.join(', ')}.`);
    } else {
      setImageInputError('');
    }

    const nextImages = accepted.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setLocalImages((prev) => [...prev, ...nextImages]);
    event.target.value = '';
  };

  const handleRemoveLocalImage = (id: string) => {
    setLocalImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((image) => image.id !== id);
    });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity]
    );
  };

  const handleAddCustomAmenity = () => {
    const value = customAmenity.trim();
    if (!value) return;
    setSelectedAmenities((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setCustomAmenity('');
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
    localImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setExternalImageUrls([]);
    setLocalImages([]);
    setImageUrlInput('');
    setImageInputError('');
    setSelectedAmenities([]);
    setCustomAmenity('');
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để đăng tin!');
      return;
    }

    if (totalImageCount === 0) {
      alert('Vui lòng thêm ít nhất 1 hình ảnh thực tế!');
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadedLocalImageUrls = localImages.length
        ? await uploadRoomImages(localImages.map((image) => image.file))
        : [];
      const allImageUrls = [...uploadedLocalImageUrls, ...externalImageUrls];

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
        thumbnail: allImageUrls[0] || '',
        images: allImageUrls,
        amenities: selectedAmenities,
      };

      await createRoomPost(payload);
      setSubmitted(true);
    } catch (error: any) {
      alert(error.message || 'Đã xảy ra lỗi khi đăng tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-box">
        <CheckCircle size={60} className="success-icon" />
        <h2>Gửi tin đăng thành công!</h2>
        <p>
          Bài viết của bạn đã được tiếp nhận và đang chờ Admin kiểm duyệt trước khi hiển thị công khai.
        </p>
        <button onClick={handleResetForm} className="btn-submit success-action">
          Đăng tin mới
        </button>
      </div>
    );
  }

  return (
    <div className="post-room-container">
      <div className="post-room-header">
        <h1 className="post-room-title">
          <PlusCircle /> Đăng Tin Cho Thuê
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="post-room-form">
        <div className="form-group">
          <label>Tiêu đề bài đăng *</label>
          <input
            type="text"
            required
            className="form-control"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid-2-cols">
          <div className="form-group">
            <label>Giá cho thuê (VNĐ/tháng) *</label>
            <input
              type="number"
              required
              className="form-control"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Diện tích (m²) *</label>
            <input
              type="number"
              required
              className="form-control"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            />
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
              {provinces.map((prov) => (
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
              {districts.map((dist) => (
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
          <div className="upload-panel">
            <label className="image-upload-box">
              <span className="upload-icon">
                <UploadCloud size={26} />
              </span>
              <span className="upload-copy">
                <strong>Chọn ảnh từ thiết bị</strong>
                <span>Hỗ trợ: {ACCEPTED_IMAGE_EXTENSIONS.join(', ')} và các file ảnh phổ biến.</span>
              </span>
              <input
                type="file"
                accept={`image/*,${ACCEPTED_IMAGE_TYPES}`}
                multiple
                onChange={handleLocalImageChange}
              />
            </label>

            <div className="upload-note">
              <CheckCircle size={16} />
              <span>Bạn có thể chọn nhiều ảnh. Khi bấm Đăng Tin Ngay, ảnh sẽ tự được tải lên và lưu cùng bài đăng.</span>
            </div>

            {imageInputError && <div className="form-warning">{imageInputError}</div>}

            <div className="link-image-box">
              <div className="link-image-title">
                <LinkIcon size={16} />
                Hoặc thêm URL ảnh đã upload
              </div>
              <div className="image-url-row">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="form-control"
                />
                <button type="button" onClick={handleAddImageUrl} className="btn-add-image">
                  Thêm ảnh
                </button>
              </div>
            </div>
          </div>

          {totalImageCount > 0 && (
            <div className="image-preview-grid">
              {externalImageUrls.map((url) => (
                <div key={url} className="image-preview-card">
                  <img src={url} alt="Ảnh phòng từ URL" />
                  <span className="image-source-badge">URL</span>
                  <button
                    type="button"
                    onClick={() => setExternalImageUrls((prev) => prev.filter((item) => item !== url))}
                    className="remove-image-btn"
                    aria-label="Xóa ảnh URL"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {localImages.map((image) => (
                <div key={image.id} className="image-preview-card">
                  <img src={image.previewUrl} alt={image.file.name} />
                  <span className="image-source-badge local">Thiết bị</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLocalImage(image.id)}
                    className="remove-image-btn"
                    aria-label="Xóa ảnh từ thiết bị"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Tiện ích phòng</label>

          <div className="amenities-grid">
            {AMENITY_OPTIONS.map(({ value, icon: Icon }) => {
              const checked = selectedAmenities.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  className={`amenity-chip ${checked ? 'active' : ''}`}
                  onClick={() => toggleAmenity(value)}
                >
                  <Icon size={16} />
                  {value}
                </button>
              );
            })}
          </div>

          <div className="custom-amenity-row">
            <input
              type="text"
              className="form-control"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              placeholder="Thêm tiện ích khác, ví dụ: Máy giặt, tủ lạnh..."
            />
            <button type="button" className="btn-add-image" onClick={handleAddCustomAmenity}>
              Thêm
            </button>
          </div>

          {selectedAmenities.length > 0 && (
            <p className="selected-amenities">Đã chọn: {selectedAmenitiesLabel}</p>
          )}
        </div>

        <div className="form-group">
          <label>Nội dung mô tả</label>
          <textarea
            rows={5}
            className="form-control"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang upload và đăng tin...' : 'Đăng Tin Ngay'}
        </button>
      </form>
    </div>
  );
}
