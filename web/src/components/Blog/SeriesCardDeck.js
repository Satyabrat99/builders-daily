"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './SeriesCardDeck.module.css';

export default function SeriesCardDeck({ collections = [] }) {
  const deckRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');
  const touchStartX = useRef(null);

  const pageSize = 3;
  const totalPages = Math.ceil(collections.length / pageSize);

  const changePage = (newIdx) => {
    if (newIdx === activePage || newIdx < 0 || newIdx >= totalPages) return;
    setSlideDirection(newIdx > activePage ? 'next' : 'prev');
    setActivePage(newIdx);
  };

  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;

    // Trigger reveal when scrolling into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Safe slice for current page (3 cards in one set)
  const currentCards = collections.slice(
    activePage * pageSize,
    activePage * pageSize + pageSize
  );

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (diffX > 40 && activePage < totalPages - 1) {
      changePage(activePage + 1);
    } else if (diffX < -40 && activePage > 0) {
      changePage(activePage - 1);
    }
    touchStartX.current = null;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      changePage(activePage + 1);
    } else if (e.key === 'ArrowLeft') {
      changePage(activePage - 1);
    }
  };

  const [detectedTones, setDetectedTones] = useState({});

  const handleImageLoad = (key, e) => {
    try {
      const img = e.currentTarget;
      if (!img.naturalWidth || !img.naturalHeight) return;
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      // Sample the bottom 45% of the card where title & count text sit
      const startY = img.naturalHeight * 0.55;
      const height = img.naturalHeight * 0.45;
      ctx.drawImage(img, 0, startY, img.naturalWidth, height, 0, 0, 16, 16);
      const imgData = ctx.getImageData(0, 0, 16, 16).data;
      let totalLuma = 0;
      const pixelCount = imgData.length / 4;
      for (let i = 0; i < imgData.length; i += 4) {
        totalLuma += 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
      }
      const avgLuma = totalLuma / pixelCount;
      // If average brightness is greater than 135, background is light
      setDetectedTones((prev) => ({
        ...prev,
        [key]: avgLuma > 135 ? 'light' : 'dark',
      }));
    } catch {
      // CORS fallback: keep predefined tone
    }
  };

  return (
    <section
      className={styles.seriesSection}
      id="collections"
      aria-label="Featured Series and Collections"
    >
      {/* Left Column: Intro with Headline and Subtitle */}
      <div className={styles.seriesIntro}>
        <div className={styles.introKickerRow}>
          <span className={styles.introKicker}>COLLECTIONS</span>
          <span className={styles.introLine} aria-hidden="true" />
        </div>
        <h2 className={styles.seriesHeading}>
          <span>Curated</span>
          <strong>Series</strong>
        </h2>
        <p className={styles.seriesSubcopy}>
          Deep dives and structured reading paths on frontier AI and software architecture.
        </p>
      </div>

      {/* Right Column: 3 Cards in One Set + Pill-shaped Pagination */}
      <div className={styles.seriesCardsWrap}>
        <div
          ref={deckRef}
          key={activePage}
          className={`${styles.seriesCards} ${styles[slideDirection === 'next' ? 'slideNext' : 'slidePrev']} ${inView ? styles.revealed : ''}`}
          role="list"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentCards.map((item, idx) => {
            const cardKey = item.id || item.title || idx;
            const rawTone = item.tone ? String(item.tone).toLowerCase() : '';
            const detected = detectedTones[cardKey];
            const isLight = detected ? detected === 'light' : rawTone === 'light';
            const isDark = detected ? detected === 'dark' : rawTone === 'dark';

            const toneClass = isLight
              ? styles.seriesCardLight
              : isDark
              ? styles.seriesCardDark
              : styles.seriesCardOrange;

            const href = item.href || '/blog';

            return (
              <Link
                key={cardKey}
                href={href}
                className={`${styles.seriesCard} ${toneClass} ${styles[`cardDelay${idx + 1}`]}`}
                role="listitem"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className={styles.cardImage}
                  loading="lazy"
                  crossOrigin="anonymous"
                  onLoad={(e) => handleImageLoad(cardKey, e)}
                />
                <div className={styles.seriesOverlay} aria-hidden="true" />
                <div className={styles.seriesCardBody}>
                  <h3 className={styles.cardTitle}>
                    {String(item.title).split('\n').map((line, i) => (
                      <span key={i} className={styles.titleLine}>{line}</span>
                    ))}
                  </h3>
                  <p className={styles.cardCount}>{item.count}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pill-shaped pagination indicator when there are more than 3 collections */}
        {totalPages > 1 && (
          <div
            className={styles.seriesDots}
            role="tablist"
            aria-label="Collections pagination"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const isActive = activePage === pageIdx;
              return (
                <button
                  key={pageIdx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Collection set ${pageIdx + 1} of ${totalPages}`}
                  className={`${styles.seriesDot} ${isActive ? styles.seriesDotActive : ''}`}
                  onClick={() => changePage(pageIdx)}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
