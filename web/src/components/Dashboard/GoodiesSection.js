"use client";
import React, { useState, useEffect } from 'react';
import GemCard from './GemCard';
import { GoodiesIcon } from '@/components/ui/SectionIcons';
import { INITIAL_GOODIES } from '@/lib/goodiesData';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';

export default function GoodiesSection() {
  const [goodies, setGoodies] = useState(INITIAL_GOODIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Instant local check to prevent any revert or flicker
    const applyCachedOrder = (list) => {
      try {
        const cached = localStorage.getItem('builder_goodies_live_order');
        if (cached) {
          const order = JSON.parse(cached);
          if (Array.isArray(order) && order.length > 0) {
            const live = [];
            const map = new Map(list.map(g => [g.id, g]));
            for (const id of order) {
              if (map.has(id)) {
                live.push({ ...map.get(id), is_featured: true });
                map.delete(id);
              }
            }
            const remaining = Array.from(map.values()).map(g => ({ ...g, is_featured: false }));
            return [...live, ...remaining];
          }
        }
      } catch (e) {}
      return list;
    };

    // Apply immediate cached order to initial state
    setGoodies(prev => applyCachedOrder(prev));

    async function loadGoodies() {
      try {
        const res = await fetch('/api/goodies');
        if (res.ok) {
          const json = await res.json();
          if (json.goodies && json.goodies.length > 0) {
            setGoodies(json.goodies);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('API fetch failed in GoodiesSection, trying direct Supabase:', err);
      }

      try {
        const { data, error } = await supabase
          .from('goodies')
          .select('*')
          .eq('status', 'approved')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6);

        if (!error && data && data.length > 0) {
          const enriched = data.map((item) => {
            const seedMatch = INITIAL_GOODIES.find(g => g.title === item.title || g.resource_url === item.resource_url);
            return {
              ...item,
              image: item.thumbnail_url || item.image || (seedMatch ? (seedMatch.thumbnail_url || seedMatch.image) : null),
              url: item.resource_url || item.url
            };
          });
          setGoodies(applyCachedOrder(enriched));
        }
      } catch (err) {
        console.warn('Using initial seed goodies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGoodies();

    // Listen to admin live reorder events in the same browser session
    const handleOrderChange = () => {
      setGoodies(prev => applyCachedOrder(prev));
    };
    window.addEventListener('builder_goodies_order_change', handleOrderChange);
    return () => {
      window.removeEventListener('builder_goodies_order_change', handleOrderChange);
    };
  }, []);

  // Display strictly 6 active goodies in their configured sequence
  const liveOnly = goodies.filter(g => g.is_featured);
  const displayedCards = (liveOnly.length > 0 ? liveOnly : goodies).slice(0, 6);

  return (
    <section id="builder-goodies" style={styles.container} aria-label="Goodies">
      {/* Header Row: Title Area */}
      <div style={styles.header}>
        <div style={styles.titleArea}>
          <div style={styles.iconBadge}>
            <GoodiesIcon size={28} />
          </div>
          <h2 style={styles.title}>Goodies</h2>
        </div>
      </div>

      {/* Clean 2x3 Grid - Exactly 6 Everyday Fresh Goodies */}
      <div style={styles.grid}>
        {displayedCards.map((item, i) => (
          <div key={item.id || i} style={styles.gridItem}>
            <GemCard 
              title={item.title}
              description={item.description}
              image={item.image}
              url={item.resource_url || item.url}
              showBadge={false}
              type="goody"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  container: {
    width: '100%',
    position: 'relative',
    margin: '32px 0 20px 0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '0 var(--slider-header-padding-horizontal, 20px)',
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  iconBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 'var(--section-title-font-size, 32px)',
    fontWeight: '800',
    color: 'var(--textMain)',
    margin: 0,
    fontFamily: theme.typography.fontSerif,
    letterSpacing: '-0.02em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'var(--hn-grid-cols, repeat(3, 1fr))',
    gridTemplateRows: 'var(--hn-grid-rows, repeat(2, auto))',
    gap: 'var(--hn-grid-gap, 24px)',
    padding: 'var(--slider-slide-padding, 10px 16px 20px 16px)',
  },
  gridItem: {
    height: '100%',
    minWidth: 0
  }
};
