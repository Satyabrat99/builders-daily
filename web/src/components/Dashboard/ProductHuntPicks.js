"use client";
import { useState, useEffect } from 'react';
import { Triangle, Flame, ExternalLink, ArrowUpRight } from 'lucide-react';
import { theme } from '@/theme';
import Tilt from 'react-parallax-tilt';
import { ProductHuntIcon } from '@/components/ui/SectionIcons';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function ProductHuntPicks({ items }) {
  const { getSetting } = useSiteSettings();
  const bgImage = getSetting('spotlight_bg_image', '/spot-2.webp');
  if (!items || items.length === 0) return null;

  const spotlightTool = items[0] ? {
    title: items[0].name,
    description: items[0].description,
    image: items[0].thumbnail || "/gem_1.png",
    tags: ["#AI", "#New"],
    url: items[0].url
  } : null;

  const trendingTools = items.slice(1).map(item => ({
    name: item.name,
    description: item.description,
    image: item.thumbnail || "/gem_1.png",
    url: item.url,
    votes: Math.floor(Math.random() * 500) + 100 // Mock votes for UI flavor
  }));

  if (!spotlightTool) return null;

  const isVideo = bgImage.match(/\.(mp4|webm)$/i);

  const SpotlightInnerContent = () => (
    <div style={{ ...styles.spotlightCard, backgroundImage: !isVideo ? `url('${bgImage}')` : 'none' }} className="premium-card spotlight-card">
      {isVideo && (
        <video 
          src={bgImage}
          autoPlay 
          loop 
          muted 
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      )}
      <div style={styles.cardContentWrapper}>
        <div style={styles.spotlightHeader}>
          <div style={styles.spotlightTag}>
            <Flame size={12} color={theme.colors.primary} />
            <span>SPOTLIGHT</span>
          </div>
          <button style={styles.visitBtnSmall} className="click-effect visit-btn-small" aria-label="Visit project">
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </button>
        </div>
        
        <div style={styles.spotlightMain}>
          <div style={styles.appLogoContainer}>
            <img src={spotlightTool.image} alt={spotlightTool.title} style={styles.appLogo} className="no-zoom" />
          </div>
          <h3 style={styles.spotlightTitle}>{spotlightTool.title}</h3>
          <p style={styles.spotlightDesc}>{spotlightTool.description}</p>
        </div>

        <div style={styles.spotlightFooter}>
          <div style={styles.tagRow}>
            {spotlightTool.tags.map(tag => (
              <span key={tag} style={styles.tagChip}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Section Header */}
      <div style={styles.header}>
        <div style={styles.titleArea}>
          <ProductHuntIcon size={36} />
          <h2 style={styles.title}>Product Hunt Picks</h2>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left Column: Spotlight Card */}
        <div style={styles.spotlightColumn}>
          {spotlightTool.url ? (
            <a href={spotlightTool.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', width: '100%', maxWidth: '100%', color: 'inherit', boxSizing: 'border-box' }}>
              <Tilt glareEnable={true} glareMaxOpacity={0.25} glareColor="#ffffff" glarePosition="all" glareBorderRadius={theme.radius.lg} scale={1.01} transitionSpeed={2000} tiltMaxAngleX={4} tiltMaxAngleY={4} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <SpotlightInnerContent />
              </Tilt>
            </a>
          ) : (
            <Tilt glareEnable={true} glareMaxOpacity={0.25} glareColor="#ffffff" glarePosition="all" glareBorderRadius={theme.radius.lg} scale={1.01} transitionSpeed={2000} tiltMaxAngleX={4} tiltMaxAngleY={4} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              <SpotlightInnerContent />
            </Tilt>
          )}
        </div>

        {/* Right Column: Trending List */}
        <div style={styles.listColumn}>
          <div style={styles.listHeader}>
             <h3 style={styles.listHeading}>Trending Today</h3>
          </div>
          <div style={styles.list}>
            {trendingTools.map((tool, i) => (
              tool.url ? (
                <a key={i} href={tool.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <div style={styles.listItem} className="premium-card">
                    <div style={styles.itemInfo}>
                      <div style={styles.itemThumb}>
                        <img src={tool.image} alt={tool.name} style={styles.thumbImg} />
                      </div>
                      <div style={styles.itemText}>
                        <h4 style={styles.itemName}>{tool.name}</h4>
                        <p style={styles.itemDesc}>{tool.description}</p>
                      </div>
                    </div>
                    <div style={styles.voteBtn}>
                      <Triangle size={12} fill="currentColor" />
                      <span>{tool.votes}</span>
                    </div>
                  </div>
                </a>
              ) : (
                <div key={i} style={styles.listItem} className="premium-card">
                  <div style={styles.itemInfo}>
                    <div style={styles.itemThumb}>
                      <img src={tool.image} alt={tool.name} style={styles.thumbImg} />
                    </div>
                    <div style={styles.itemText}>
                      <h4 style={styles.itemName}>{tool.name}</h4>
                      <p style={styles.itemDesc}>{tool.description}</p>
                    </div>
                  </div>
                  <div style={styles.voteBtn}>
                    <Triangle size={12} fill="currentColor" />
                    <span>{tool.votes}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    padding: 'var(--ph-container-padding, 40px 0 60px 0)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--ph-header-margin-bottom, 32px)',
    padding: '0 var(--grid-header-padding-horizontal, 0px)',
    width: '100%',
    boxSizing: 'border-box',
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  phIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: '#da552f', // PH Orange
    color: '#fff',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '800',
    fontFamily: theme.typography.fontSans
  },
  title: {
    fontSize: 'var(--section-title-font-size, 32px)',
    fontWeight: '700',
    color: theme.colors.textMain,
    margin: 0,
    fontFamily: theme.typography.fontSerif,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'var(--ph-grid-cols, minmax(0, 1.5fr) minmax(0, 1fr))',
    gap: 'var(--hn-grid-gap, 24px)',
    alignItems: 'start',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  spotlightColumn: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  spotlightCard: {
    backgroundColor: theme.colors.bgApp,
    backgroundImage: `url('/spot-2.webp')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    border: `1px solid rgba(255, 255, 255, 0.08)`,
    borderTop: `1px solid rgba(255, 255, 255, 0.25)`,
    borderLeft: `1px solid rgba(255, 255, 255, 0.15)`,
    boxShadow: '0 12px 40px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.05)',
    cursor: 'pointer',
    padding: 'var(--ph-spotlight-padding, 40px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    minHeight: 'var(--ph-spotlight-min-height, 440px)',
    position: 'relative',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardContentWrapper: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    minWidth: 0,
  },
  spotlightHeader: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--ph-spotlight-header-margin, 32px)',
  },
  spotlightTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: '0.05em',
    fontFamily: theme.typography.fontSans
  },
  spotlightMain: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    minWidth: 0,
  },
  appLogoContainer: {
    width: 'var(--ph-spotlight-logo-size, 84px)',
    height: 'var(--ph-spotlight-logo-size, 84px)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(218, 85, 47, 0.15)',
    backgroundColor: '#ffffff',
    marginBottom: '8px',
    flexShrink: 0,
  },
  appLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  spotlightTitle: {
    fontSize: 'var(--ph-spotlight-title-size, 32px)',
    fontWeight: '700',
    color: theme.colors.textMain,
    margin: 0,
    fontFamily: theme.typography.fontSerif,
    maxWidth: '100%',
    wordBreak: 'break-word',
  },
  spotlightDesc: {
    fontSize: 'var(--ph-spotlight-desc-size, 16px)',
    color: theme.colors.textMuted,
    margin: 0,
    lineHeight: '1.55',
    maxWidth: '100%',
    wordBreak: 'break-word',
    fontFamily: theme.typography.fontSans
  },
  spotlightFooter: {
    marginTop: 'var(--ph-spotlight-footer-margin, 40px)',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'flex-start'
  },
  tagRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-start'
  },
  tagChip: {
    fontSize: '11px',
    fontWeight: '600',
    color: theme.colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '4px 12px',
    borderRadius: '12px',
    fontFamily: theme.typography.fontSans
  },
  visitBtnSmall: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  listColumn: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  listHeader: {
    marginBottom: '16px'
  },
  listHeading: {
    fontSize: '17px',
    fontWeight: '700',
    color: theme.colors.textMuted,
    margin: 0,
    fontFamily: theme.typography.fontSerif,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  listItem: {
    padding: '12px 14px',
    backgroundColor: theme.colors.bgCard,
    borderRadius: '12px',
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: '1 1 0%',
    minWidth: 0,
    overflow: 'hidden'
  },
  itemThumb: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#eee',
    flexShrink: 0
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  itemText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: '1 1 0%',
    minWidth: 0,
    overflow: 'hidden'
  },
  itemName: {
    fontSize: '15px',
    fontWeight: '700',
    color: theme.colors.textMain,
    margin: 0,
    fontFamily: theme.typography.fontSans,
    lineHeight: '1.35',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  itemDesc: {
    fontSize: '12.5px',
    fontWeight: '500',
    color: theme.colors.textMuted,
    margin: 0,
    lineHeight: '1.4',
    fontFamily: theme.typography.fontSans,
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
    minWidth: 0,
  },
  voteBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    padding: '6px 10px',
    borderRadius: '8px',
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.bgApp,
    color: theme.colors.textMuted,
    fontSize: '11px',
    fontWeight: '700',
    minWidth: '42px',
    flexShrink: 0,
    fontFamily: theme.typography.fontSans
  }
};
