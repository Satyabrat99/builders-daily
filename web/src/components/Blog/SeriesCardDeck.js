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
            const toneClass = styles[`seriesCard${item.tone || 'Orange'}`] || '';
            const href = item.href || '/blog';

            return (
              <Link
                key={item.id || item.title || idx}
                href={href}
                className={`${styles.seriesCard} ${toneClass} ${styles[`cardDelay${idx + 1}`]}`}
                role="listitem"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className={styles.cardImage}
                  loading="lazy"
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
