"use client";

import GemCard from './GemCard';
import SliderContainer from '@/components/ui/SliderContainer';
import { useItemsPerSlide } from '@/hooks/useItemsPerSlide';

export default function RedditSlider({ items }) {
  const itemsPerSlide = useItemsPerSlide(3, 2, 1);
  if (!items) return null;
  const totalSlides = Math.ceil(items.length / itemsPerSlide);

  return (
    <SliderContainer
      title="Reddit Pulse"
      icon={<img src="/Reddit_Logo (1).webp" alt="Reddit Logo" width={32} height={32} style={{ objectFit: 'contain' }} />}
      totalSlides={totalSlides}
      arrowsPosition="topRight"
    >
      {items.map((post, i) => (
        <div key={i} style={styles.slide}>
          <GemCard {...post} showBadge={false} fallbackImage="/reddit.webp" />
        </div>
      ))}
    </SliderContainer>
  );
}

const styles = {
  slide: {
    flex: 'var(--slider-slide-flex, 0 0 33.333%)',
    padding: 'var(--slider-slide-padding, 30px 16px)',
    boxSizing: 'border-box',
  }
};

