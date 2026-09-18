"use client";
import React, { useRef } from 'react';
import { Code2, ArrowUpRight, Star, GitBranch, Clock } from 'lucide-react';
import { theme } from '@/theme';
import BookmarkButton from '@/components/ui/BookmarkButton';

export default function RepoCard({ title, description, url, stars = "1.2k", forks = "400", updated = "2d ago" }) {
  const cardRef = useRef(null);

  // Extract owner and repo name from url or title
  let owner = '';
  let repoName = title;

  if (url && url.includes('github.com/')) {
    const urlParts = url.split('github.com/')[1].split('/').filter(Boolean);
    if (urlParts.length >= 2) {
      owner = urlParts[0] + '/';
      repoName = urlParts[1];
    }
  } else if (title && title.includes('/')) {
    const parts = title.split('/');
    owner = parts[0] + '/';
    repoName = parts.slice(1).join('/');
  }

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--x', `${x}px`);
    cardRef.current.style.setProperty('--y', `${y}px`);
  };

  const CardContent = (
    <div
      style={styles.card}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="repo-card-custom"
    >
      {/* Spotlight Effect */}
      <div style={styles.spotlight}></div>

      <div style={styles.content}>
        {/* Header Label */}
        <div style={styles.header}>
          <div style={styles.badge}>
            <Code2 size={12} style={styles.badgeIcon} />
            <span style={styles.badgeText}>REPOSITORY</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookmarkButton 
              itemData={{ url, title, description, type: 'repo' }} 
              variant="dark"
              style={{ position: 'relative', top: 'auto', right: 'auto' }}
            />
            <ArrowUpRight size={16} style={styles.externalIcon} />
          </div>
        </div>

        {/* Title Area */}
        <div style={styles.titleArea}>
          <span style={styles.owner}>{owner}</span>
          <h3 style={styles.repoName}>{repoName}</h3>
        </div>

        {/* Description */}
        <p style={styles.description}>{description}</p>

        <div style={{ ...styles.divider, marginTop: 'auto' }}></div>

        {/* Stats Row at Bottom */}
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <Star size={12} style={styles.statIcon} />
            <span style={styles.statValue}>{stars}</span>
          </div>
          <div style={styles.stat}>
            <GitBranch size={12} style={styles.statIcon} />
            <span style={styles.statValue}>{forks}</span>
          </div>
          <div style={styles.stat}>
            <Clock size={12} style={styles.statIcon} />
            <span style={styles.statValue}>{updated}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .repo-card-custom {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .repo-card-custom:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
      `}</style>
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        {CardContent}
      </a>
    );
  }

  return CardContent;
}

const styles = {
  card: {
    background: 'linear-gradient(165deg, #1A1B1F 0%, #0D0E11 100%) padding-box, linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.2) 100%) border-box',
    borderRadius: '24px',
    height: '320px', 
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid transparent',
    boxShadow: `
      0 8px 16px rgba(0,0,0,0.4), 
      inset 0 1px 0 rgba(255,255,255,0.1),
      inset 0 -1px 0 rgba(0,0,0,0.5)
    `, 
    cursor: 'pointer',
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(400px circle at var(--x) var(--y), rgba(255,255,255,0.08), transparent 100%)`,
    pointerEvents: 'none',
    zIndex: 1,
  },
  content: {
    padding: '32px 28px 16px 28px', // Reduced bottom padding from 32px to 16px
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '5px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  badgeIcon: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  badgeText: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.12em',
    fontFamily: 'var(--font-heading)',
  },
  externalIcon: {
    color: 'rgba(255, 255, 255, 0.15)',
  },
  titleArea: {
    marginBottom: '12px', // Reduced from 28px
  },
  owner: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.45)', 
    display: 'block',
    fontFamily: 'var(--font-body)',
    marginBottom: '4px', 
  },
  repoName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: 0,
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.02em',
    lineHeight: '1.1',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    width: '100%',
    margin: '12px 0',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    margin: '4px 0 0 0', // Reduced and removed bottom margin
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statIcon: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  statValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'var(--font-body)',
  },
  description: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '16px', // Reduced from 32px
    fontFamily: 'var(--font-body)',
    display: '-webkit-box',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }
};
