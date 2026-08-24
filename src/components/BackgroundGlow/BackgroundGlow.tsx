'use client';

import React, { useEffect, useState } from 'react';
import './BackgroundGlow.css';

export default function BackgroundGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [isOverContent, setIsOverContent] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      // Kiểm tra xem con trỏ chuột có đang nằm trên các phần tử nội dung không
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInsideCardOrInteractive = target.closest(
        '.surface-card, .room-card, .search-banner-container, navbar, header, button, input, select, a, article'
      );

      setIsOverContent(!!isInsideCardOrInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-animation-container">
      {/* Vệt sáng đi theo con trỏ chuột */}
      <div
        className={`mouse-glow-follower ${isOverContent ? 'hidden' : ''}`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        }}
      />

      {/* Các Sticker trôi nổi ở 2 bên lề */}
      <div className="floating-stickers">
        <span className="sticker float-1">🏠</span>
        <span className="sticker float-2">🔑</span>
        <span className="sticker float-3">📍</span>
        <span className="sticker float-4">🛋️</span>
        <span className="sticker float-5">⚡</span>
      </div>
    </div>
  );
}