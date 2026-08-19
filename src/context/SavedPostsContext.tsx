'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
// Đổi tên import để tránh trùng với tên hàm bên trong context
import { getSavedPosts, toggleSavePost as toggleSavePostApi } from '@/api/roomApi';

interface SavedPostsContextType {
  savedPosts: any[];
  isLoading: boolean;
  toggleSavePost: (room: any) => Promise<void>;
  removeSavedPost: (roomId: number) => Promise<void>;
  isSaved: (roomId: number) => boolean;
}

const SavedPostsContext = createContext<SavedPostsContextType | undefined>(undefined);

export const SavedPostsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh sách tin đã lưu khi user đăng nhập
  const fetchSavedPosts = useCallback(async () => {
    if (!user) {
      setSavedPosts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getSavedPosts();
      setSavedPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi khi fetch tin đã lưu:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  // Hàm tiện ích giúp UI bên ngoài dễ dàng kiểm tra trạng thái
  const isSaved = useCallback((roomId: number) => {
    return savedPosts.some((p) => (p.room?.id || p.id) === roomId);
  }, [savedPosts]);

  // Hàm Toggle Tim (Tích hợp Optimistic UI)
  const toggleSavePost = async (room: any) => {
    if (!user) return alert('Vui lòng đăng nhập để lưu tin!');

    const roomId = room.id;
    const currentlySaved = isSaved(roomId);

    // 1. OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức
    setSavedPosts((prev) => 
      currentlySaved 
        ? prev.filter((p) => (p.room?.id || p.id) !== roomId) // Xóa khỏi danh sách tạm
        : [{ room, id: Date.now() }, ...prev] // Thêm vào danh sách tạm
    );

    // 2. Gọi API ngầm (Dùng chung 1 API toggle)
    try {
      await toggleSavePostApi(roomId);
    } catch (error) {
      // 3. ROLLBACK: Nếu API lỗi, khôi phục lại trạng thái ban đầu
      console.error('API Error, rolling back...');
      setSavedPosts((prev) => 
        currentlySaved 
          ? [{ room, id: Date.now() }, ...prev] // Khôi phục lại nếu lỗi xóa
          : prev.filter((p) => (p.room?.id || p.id) !== roomId) // Xóa đi nếu lỗi thêm
      );
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  // Hàm Xóa trực tiếp trong trang SavedPosts
  const removeSavedPost = async (roomId: number) => {
    const postToRemove = savedPosts.find((p) => (p.room?.id || p.id) === roomId);
    if (!postToRemove) return;

    // Cập nhật UI ngay lập tức
    setSavedPosts((prev) => prev.filter((p) => (p.room?.id || p.id) !== roomId));

    try {
      // Vì trạng thái hiện tại trên db là đang lưu, gọi toggle sẽ tương đương với DELETE
      await toggleSavePostApi(roomId);
    } catch (error) {
      // Rollback nếu lỗi
      setSavedPosts((prev) => [postToRemove, ...prev]);
      alert('Xóa thất bại!');
    }
  };

  return (
    <SavedPostsContext.Provider value={{ savedPosts, isLoading, toggleSavePost, removeSavedPost, isSaved }}>
      {children}
    </SavedPostsContext.Provider>
  );
};

export const useSavedPosts = () => {
  const context = useContext(SavedPostsContext);
  if (!context) throw new Error('useSavedPosts must be used within SavedPostsProvider');
  return context;
};