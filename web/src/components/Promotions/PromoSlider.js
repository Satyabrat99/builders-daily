"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { theme } from '@/theme';
import { supabase } from '@/lib/supabase';
import { formatExternalUrl } from '@/lib/urlUtils';

export default function PromoSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    async function fetchPromos() {
      // Check visibility first
      const { data: setting, error: settingError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'promos_visible')
        .single();

      if (!settingError && setting && setting.value === 'false') {
        setVisible(false);
        setLoading(false);
        return;
      }

      setVisible(true);

      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      // Merge two-tier fallback from site_settings (promo_target_urls)
      let targetUrlsMap = {};
      try {
        const { data: targetSetting } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'promo_target_urls')
          .single();
        if (targetSetting && targetSetting.value) {
          targetUrlsMap = JSON.parse(targetSetting.value);
        }
      } catch {
        // Ignore
      }

      if (!error && data && data.length > 0) {
        setSlides(data.map(d => ({
          id: d.id,
          image_url: d.image_url,
          target_url: d.target_url || d.link_url || targetUrlsMap[d.id] || ''
        })));
      } else {
        // Fallback to defaults if table is empty or error
        setSlides([
          { id: 'p1', image_url: '/promo_1.png', target_url: '' },
          { id: 'p2', image_url: '/promo_2.png', target_url: '' },
          { id: 'p3', image_url: '/promo_3.png', target_url: '' }
        ]);
      }
      setLoading(false);
    }
    fetchPromos();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500); 

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = (e) => {
    if (e) e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };
  const prevSlide = (e) => {
    if (e) e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading || !visible || slides.length === 0) return null;

  return (
    <div style={styles.wrapper}>
      <div className="slider-container" style={styles.sliderContainer}>
        {slides.map((slide, index) => {
          const isCurrent = activeSlide === index;
          const targetUrl = slide.target_url ? formatExternalUrl(slide.target_url) : null;
          return (
            <div
              key={slide.id || index}
              onClick={() => {
                if (targetUrl) {
                  window.open(targetUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              role={targetUrl ? "link" : undefined}
              tabIndex={targetUrl && isCurrent ? 0 : undefined}
              title={targetUrl ? `Visit: ${targetUrl}` : undefined}
              style={{
                ...styles.card,
                backgroundImage: `url(${slide.image_url})`,
                opacity: isCurrent ? 1 : 0,
                visibility: isCurrent ? 'visible' : 'hidden',
                zIndex: isCurrent ? 1 : 0,
                cursor: targetUrl ? 'pointer' : 'default',
              }}
            >
              {/* Optional click indicator pill on hover */}
              {targetUrl && isCurrent && (
                <div 
                  className="promo-visit-pill"
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.72)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '700',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  <span>Visit Sponsor</span>
                  <ExternalLink size={13} />
                </div>
              )}
            </div>
          );
        })}

        {/* Navigation Buttons */}
        <button 
          onClick={prevSlide}
          className="nav-btn left"
          style={{...styles.navButton, left: '20px'}}
          aria-label="Previous promotion"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="nav-btn right"
          style={{...styles.navButton, right: '20px'}}
          aria-label="Next promotion"
        >
          <ChevronRight size={24} />
        </button>

        <style>{`
          .nav-btn:hover {
            background-color: rgba(255, 255, 255, 0.9) !important;
            color: #1e293b !important;
            transform: translateY(-50%) scale(1.05);
          }
          .nav-btn:active {
            transform: translateY(-50%) scale(0.95) !important;
          }
          .slider-container:hover .nav-btn {
            opacity: 1;
          }
          .slider-container:hover .promo-visit-pill {
            background-color: rgba(0, 0, 0, 0.88) !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
            transform: scale(1.03);
          }
        `}</style>
      </div>

      <div style={styles.pagination}>
        {slides.map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.pill,
              backgroundColor: activeSlide === i ? theme.colors.textMain : theme.colors.borderDark,
              width: activeSlide === i ? '40px' : '20px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlide(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    maxWidth: '1210px',
    margin: '40px auto 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sliderContainer: {
    width: '100%',
    height: 'var(--promo-height, 290px)',
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.bgCard,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'opacity 0.8s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  pagination: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  pill: {
    height: '6px',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    cursor: 'pointer',
    zIndex: 10,
    opacity: 0, 
    transition: 'all 0.3s ease',
  }
};
