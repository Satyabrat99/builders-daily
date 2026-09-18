"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { theme } from '@/theme';

export default function SliderContainer({ 
  title, 
  icon, 
  totalSlides, 
  children,
  showSideArrows = true,
  arrowsPosition = 'sides'
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    if (currentIndex >= totalSlides) {
      setCurrentIndex(Math.max(0, totalSlides - 1));
    }
  }, [totalSlides, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div style={styles.container} className="slider-container">
      {/* Header Row */}
      <div style={styles.header}>
        <div style={styles.titleArea}>
          {icon && <div style={styles.iconWrapper}>{icon}</div>}
          <h2 style={styles.title}>{title}</h2>
        </div>
        
        {arrowsPosition === 'topRight' && totalSlides > 1 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--textMuted)',
              marginRight: '8px',
              letterSpacing: '0.05em',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            }}>
              <span style={{ color: (currentIndex + 1) === totalSlides ? 'var(--primary)' : 'inherit' }}>
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              /
              <span style={{ color: 'var(--primary)' }}>
                {String(totalSlides).padStart(2, '0')}
              </span>
            </div>
            <button 
              onClick={handlePrev} 
              style={styles.topArrow}
              className="top-nav-btn"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNext} 
              style={styles.topArrow}
              className="top-nav-btn"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Slider Viewport */}
      <div style={styles.sliderWrapper}>
        {arrowsPosition === 'sides' && totalSlides > 1 && showSideArrows && (
          <button 
            onClick={handlePrev} 
            style={styles.floatingArrowLeft}
            className="nav-btn"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div style={styles.viewport}>
          <div style={{
            ...styles.track,
            transform: `translateX(-${currentIndex * 100}%)`
          }}>
            {children}
          </div>
        </div>

        {arrowsPosition === 'sides' && totalSlides > 1 && showSideArrows && (
          <button 
            onClick={handleNext} 
            style={styles.floatingArrowRight}
            className="nav-btn"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Pagination Pills */}
      <div style={styles.pillsContainer}>
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            style={{
              ...styles.pill,
              backgroundColor: currentIndex === i ? theme.colors.textMain : 'rgba(128, 128, 128, 0.3)',
              width: currentIndex === i ? '32px' : '8px'
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    padding: '40px 0 20px 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '24px',
    padding: '0 var(--slider-header-padding-horizontal, 20px)',
    position: 'relative',
    zIndex: 10,
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 'var(--section-title-font-size, 32px)',
    fontWeight: '800',
    color: theme.colors.textMain,
    margin: 0,
    fontFamily: theme.typography.fontSerif,
    letterSpacing: '-0.02em',
  },
  sliderWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  viewport: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    padding: '60px 0', 
    margin: '-60px 0', 
    boxSizing: 'border-box',
  },
  track: {
    display: 'flex',
    padding: '0 var(--slider-track-padding-horizontal, 4px)', 
    transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  topArrow: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--glassBg)',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--glassBorder)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    color: 'var(--textMain)',
  },
  floatingArrowLeft: {
    position: 'absolute',
    top: '50%',
    left: '-28px',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--glassBg)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--glassBorder)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    opacity: 0,
    color: 'var(--textMain)',
  },
  floatingArrowRight: {
    position: 'absolute',
    top: '50%',
    right: '-28px',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--glassBg)',
    backdropFilter: 'blur(10px)',
    border: '1px solid var(--glassBorder)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    opacity: 0,
    color: 'var(--textMain)',
  },
  pillsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
  },
  pill: {
    height: '6px',
    borderRadius: '3px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    padding: 0,
  }
};
