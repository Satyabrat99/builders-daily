"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import GemCard from './GemCard';
import SliderContainer from '@/components/ui/SliderContainer';
import { theme } from '@/theme';
import { useItemsPerSlide } from '@/hooks/useItemsPerSlide';
import { FeaturedGemsIcon } from '@/components/ui/SectionIcons';
import { formatExternalUrl } from '@/lib/urlUtils';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const GEMS_CACHE_KEY = 'builder_daily_gems_cache';

export default function GemsSlider() {
  const { getSetting } = useSiteSettings();
  const visible = getSetting('featured_gems_visible', 'false') === 'true';

  const [gems, setGems] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(GEMS_CACHE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });
  const [loading, setLoading] = useState(false);

  // Must be called unconditionally (Rules of Hooks) — before any early return
  const itemsPerSlide = useItemsPerSlide(3, 2, 1);

  useEffect(() => {
    if (!visible) return;

    async function loadFeaturedGems() {
      try {
        const { data: gemsData, error: gemsError } = await supabase
          .from('featured_gems')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (gemsError || !gemsData || gemsData.length === 0) {
          return;
        }

        let badgeMap = {};
        try {
          const badgeSetting = getSetting('gem_badges', '{}');
          badgeMap = typeof badgeSetting === 'string' ? JSON.parse(badgeSetting || '{}') : (badgeSetting || {});
        } catch {}

        let urlMap = {};
        try {
          const urlSetting = getSetting('gem_urls', '{}');
          urlMap = typeof urlSetting === 'string' ? JSON.parse(urlSetting || '{}') : (urlSetting || {});
        } catch {}

        const formatted = gemsData.map(gem => ({ 
          ...gem, 
          url: gem.url || urlMap[gem.id] || '',
          badge_icon: badgeMap[gem.id] || '/badge-1.png' 
        }));

        setGems(formatted);
        try {
          localStorage.setItem(GEMS_CACHE_KEY, JSON.stringify(formatted));
        } catch (e) {}
      } catch (err) {
        console.error('Error loading featured gems:', err);
      }
    }

    loadFeaturedGems();
  }, [visible, getSetting]);

  if (loading || !visible || gems.length === 0) return null;
  const totalSlides = Math.ceil(gems.length / itemsPerSlide);

  const coloredIcon = (
    <div style={{
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(168, 85, 247, 0.08)',
      border: '1px solid rgba(168, 85, 247, 0.22)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    }}>
      <FeaturedGemsIcon size={22} color="#a855f7" />
    </div>
  );

  return (
    <SliderContainer
      title="Featured Gems"
      icon={coloredIcon}
      totalSlides={totalSlides}
      arrowsPosition="topRight"
    >
      {gems.map((gem, i) => (
        <div key={gem.id || i} style={styles.slide}>
          <GemCard 
            title={gem.title} 
            description={gem.description} 
            image={gem.image_url} 
            badgeIcon={gem.badge_icon}
            url={formatExternalUrl(gem.url)}
          />
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
