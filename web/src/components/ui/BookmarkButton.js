"use client";
import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarks } from '@/context/BookmarkContext';

export default function BookmarkButton({ itemData, style = {}, variant = 'default' }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // If there's no URL, we can't bookmark it properly since we use URL as ID
  if (!itemData || !itemData.url) return null;

  const saved = isBookmarked(itemData.url);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger pop animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    await toggleBookmark(itemData);
  };

  const isDark = variant === 'dark';

  return (
    <div 
      className="bookmark-btn"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 20,
        cursor: 'pointer',
        padding: '6px',
        borderRadius: '8px',
        backgroundColor: isHovered ? 'var(--bgCardHover)' : 'var(--bgCard)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--borderDark)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        ...style
      }}
    >
      <Bookmark 
        size={18} 
        fill={saved ? 'var(--primary)' : 'none'} 
        color={saved ? 'var(--primary)' : 'var(--textMain)'} 
        strokeWidth={2}
        style={{ 
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isAnimating ? 'scale(1.3)' : (isHovered ? 'scale(1.1)' : 'scale(1)')
        }}
      />
    </div>
  );
}
