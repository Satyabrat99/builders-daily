"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import GemCard from './GemCard';
import SliderContainer from '@/components/ui/SliderContainer';
import { theme } from '@/theme';
import { useItemsPerSlide } from '@/hooks/useItemsPerSlide';
import { FeaturedGemsIcon } from '@/components/ui/SectionIcons';
import { formatExternalUrl } from '@/lib/urlUtils';

export default function GemsSlider() {
  const [gems, setGems] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Must be called unconditionally (Rules of Hooks) — before any early return
  const itemsPerSlide = useItemsPerSlide(3, 2, 1);

  useEffect(() => {
    async function loadFeaturedGems() {
      try {
        // 1. Check if the section is globally toggled visible in settings
        const { data: setting, error: settingError } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'featured_gems_visible')
          .single();

        if (settingError || !setting || setting.value !== 'true') {
          setVisible(false);
          setLoading(false);
          return;
        }

        // 2. Fetch all active gems ordered by index
        const { data: gemsData, error: gemsError } = await supabase
          .from('featured_gems')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        const { data: badgeData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'gem_badges')
          .single();
          
        const badgeMap = badgeData && badgeData.value ? JSON.parse(badgeData.value) : {};

        // Also fetch two-tier gem_urls fallback
        let urlMap = {};
        try {
          const { data: urlData } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'gem_urls')
            .single();
          if (urlData && urlData.value) {
            urlMap = JSON.parse(urlData.value);
          }
        } catch {
          // Ignore
        }

        if (gemsError || !gemsData || gemsData.length === 0) {
          setVisible(false);
        } else {
          setGems(gemsData.map(gem => ({ 
            ...gem, 
            url: gem.url || urlMap[gem.id] || '',
            badge_icon: badgeMap[gem.id] || '/badge-1.png' 
          })));
          setVisible(true);
        }
      } catch (err) {
        console.error('Error loading featured gems:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedGems();
  }, []);

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
