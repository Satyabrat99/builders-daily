"use client";

import GemCard from './GemCard';
import SliderContainer from '@/components/ui/SliderContainer';
import { useItemsPerSlide } from '@/hooks/useItemsPerSlide';
import { HackerNewsIcon } from '@/components/ui/SectionIcons';

export default function HNSlider({ items }) {
  const itemsPerSlide = useItemsPerSlide(6, 4, 3);
  if (!items) return null;
  const totalSlides = Math.ceil(items.length / itemsPerSlide);

  return (
    <SliderContainer
      title="Hacker News Picks"
      icon={<HackerNewsIcon size={34} />}
      totalSlides={totalSlides}
      arrowsPosition="topRight"
    >
      {Array.from({ length: totalSlides }).map((_, slideIdx) => (
        <div key={slideIdx} style={styles.slide}>
          <div style={styles.grid}>
            {items.slice(slideIdx * itemsPerSlide, (slideIdx + 1) * itemsPerSlide).map((item, i) => (
              <div key={i} style={styles.gridItem}>
                <GemCard {...item} showBadge={false} type="hn" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </SliderContainer>
  );
}

const styles = {
  slide: {
    flex: '0 0 100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'var(--hn-grid-cols, repeat(3, 1fr))',
    gridTemplateRows: 'var(--hn-grid-rows, repeat(2, auto))',
    gap: 'var(--hn-grid-gap, 24px)',
    padding: 'var(--slider-slide-padding, 30px 16px)',
  },
  gridItem: {
    height: '100%',
  }
};

