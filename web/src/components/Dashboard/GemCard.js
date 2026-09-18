import React, { useRef, useState } from 'react';
import PremiumCard from '@/components/ui/PremiumCard';
import { theme } from '@/theme';
import TechCard from './TechCard';
import { Code2, Globe } from 'lucide-react';
import BookmarkButton from '@/components/ui/BookmarkButton';

/**
 * Extracts clean domain name for display (e.g., "ui.shadcn.com" -> "shadcn.com")
 */
function getDomain(url) {
  try {
    if (!url) return '';
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Resolves authentic relevant images:
 * 1. Uses authentic source image if provided (not a mock placeholder)
 * 2. Uses deterministic OpenGraph image (e.g. GitHub social preview card)
 * 3. Falls back to dynamic /api/og-image live OpenGraph extractor
 * Strictly no stock images (no Unsplash, no generic mock placeholders).
 */
function resolveRelevantImage(image, url) {
  const isGenericPlaceholder = !image || 
    image === '/card_placeholder.png' || 
    image === '/reddit.webp' || 
    image === '/8.webp' ||
    image.includes('/news_') ||
    image.includes('/gem_') ||
    image.includes('/fresh_link_') ||
    image.includes('/promo_');

  // If source data provided a real image, use it!
  if (image && !isGenericPlaceholder) {
    return image;
  }

  // If no source image, use OpenGraph (OG) image from URL
  if (url) {
    // Deterministic GitHub Repo social card (stars, author, repo details)
    const githubMatch = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
    if (githubMatch && !['features', 'topics', 'trending', 'collections', 'settings'].includes(githubMatch[1])) {
      return `https://opengraph.githubassets.com/1/${githubMatch[1]}/${githubMatch[2]}`;
    }
    // Dynamic real OG extractor
    return `/api/og-image?url=${encodeURIComponent(url)}`;
  }

  return image || null;
}

export default function GemCard({ 
  title, 
  description, 
  image, 
  url, 
  showBadge = true, 
  forceTech = false, 
  fallbackImage, 
  badgeIcon, 
  type 
}) {
  const cardRef = useRef(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [attemptedOg, setAttemptedOg] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--x', `${x}px`);
    cardRef.current.style.setProperty('--y', `${y}px`);
  };

  const domain = getDomain(url);

  // Dispatch Logic
  const isRepo = forceTech || (image && image.includes('/repo_'));
  
  let CardContent;

  // Technical Card
  if (isRepo) {
    CardContent = (
      <PremiumCard style={{ ...styles.cardWrapper, padding: 0 }} innerRef={cardRef} onMouseMove={handleMouseMove}>
        <div className="spotlight-border"></div>
        <BookmarkButton itemData={{ url, title, description, image, type: type || 'repo' }} />
        <TechCard 
          title={title} 
          subtitle={description} 
          icon={Code2} 
          type="REPOSITORY" 
        />
        <div style={styles.content}>
          <div style={styles.textGroup}>
            <p style={{ ...styles.description, marginTop: '8px' }}>{description}</p>
          </div>
        </div>
      </PremiumCard>
    );
  } else {
    // Resolve relevant image: source data first, else OG
    const initialImage = resolveRelevantImage(image, url);
    const hasImage = initialImage && !imageFailed;

    const isGoody = type === 'goody';
    const imageContainerStyle = {
      ...styles.imageContainer,
      height: isGoody ? '170px' : '240px',
    };
    const contentStyle = {
      ...styles.content,
      padding: isGoody ? '12px 6px 4px 6px' : '16px 8px 8px 8px',
    };
    const titleStyle = {
      ...styles.title,
      fontSize: isGoody ? '15px' : '16px',
      WebkitLineClamp: isGoody ? 1 : 2,
    };
    const descriptionStyle = {
      ...styles.description,
      fontSize: isGoody ? '12px' : '13px',
      lineHeight: isGoody ? '1.4' : '1.5',
      WebkitLineClamp: isGoody ? 1 : 2,
    };

    CardContent = (
      <PremiumCard style={styles.cardWrapper} innerRef={cardRef} onMouseMove={handleMouseMove}>
        <div className="spotlight-border"></div>
        <BookmarkButton itemData={{ url, title, description, image: initialImage, type: type || 'goody' }} />
        
        <div style={imageContainerStyle}>
          {hasImage ? (
            <img 
              src={initialImage} 
              alt={title} 
              style={styles.image} 
              onError={(e) => {
                if (fallbackImage) {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                } else if (url && !attemptedOg && !e.currentTarget.src.includes('/api/og-image')) {
                  // Attempt OG resolution fallback
                  setAttemptedOg(true);
                  e.currentTarget.src = `/api/og-image?url=${encodeURIComponent(url)}`;
                } else {
                  setImageFailed(true);
                }
              }}
            />
          ) : (
            // Clean, elegant fallback card with real domain branding (no stock images)
            <div style={styles.domainBanner}>
              <div style={styles.domainBadge}>
                {domain ? (
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} 
                    alt="" 
                    style={{ width: '24px', height: '24px', borderRadius: '6px' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <Globe size={24} color={theme.colors.primary} />
                )}
                <span style={styles.domainText}>{domain || 'Resource'}</span>
              </div>
              <p style={styles.bannerTitle}>{title}</p>
            </div>
          )}
        </div>

        <div style={contentStyle}>
          <div style={styles.textGroup}>
            <h3 style={titleStyle}>{title}</h3>
            <p style={descriptionStyle}>{description}</p>
          </div>
          {showBadge && (
            <div style={styles.badge}>
              {badgeIcon ? (
                <img src={badgeIcon} alt="Badge" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <img src="/badge-1.png" alt="Badge" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              )}
            </div>
          )}
        </div>
      </PremiumCard>
    );
  }

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        {CardContent}
      </a>
    );
  }

  return CardContent;
}

const styles = {
  cardWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    minWidth: '0',
    overflow: 'hidden',
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    padding: '8px', // Inset space for the image
  },
  imageContainer: {
    width: '100%',
    height: '240px',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
    position: 'relative',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s cubic-bezier(0.2, 0, 0, 1)',
  },
  domainBanner: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'radial-gradient(circle at 50% 30%, rgba(255, 90, 18, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
    gap: '12px',
    textAlign: 'center',
  },
  domainBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(8px)',
  },
  domainText: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--textMain)',
    letterSpacing: '-0.01em',
  },
  bannerTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--textMuted)',
    margin: 0,
    lineHeight: '1.4',
    maxWidth: '90%',
  },
  content: {
    padding: '16px 8px 8px 8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: '1'
  },
  textGroup: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: theme.colors.textMain,
    margin: 0,
    fontFamily: theme.typography.fontSans,
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    letterSpacing: '-0.01em',
    wordBreak: 'break-word',
  },
  description: {
    fontSize: '13px',
    fontWeight: '500',
    color: theme.colors.textMuted,
    margin: 0,
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  badge: {
    width: '36px',
    height: '36px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: '16px',
  },
};
