"use client";
import { useRef } from 'react';
import { theme } from '@/theme';
import BookmarkButton from '@/components/ui/BookmarkButton';

export default function FreshLinkCard({ title, category, image, description, url }) {
  const cardRef = useRef(null);

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
      className="premium-card" 
      style={styles.card}
      ref={cardRef}
      onMouseMove={handleMouseMove}
    >
      <div className="spotlight-border"></div>
      <BookmarkButton itemData={{ url, title, description, image, category, type: 'link' }} />
      <div style={styles.imageContainer}>
        <img src={image} alt={title} style={styles.image} />
      </div>
      <div style={styles.content}>
        <div style={styles.categoryRow}>
          <span style={styles.category}>{category}</span>
        </div>
        <h3 style={styles.title}>{title}</h3>
        {description && <p style={styles.description}>{description}</p>}
      </div>
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
    borderRadius: '16px',
    border: `1px solid ${theme.colors.border}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    backgroundColor: theme.colors.bgCard,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    height: '100%',
    position: 'relative',
    padding: '8px', // Inset space for the image
  },
  imageContainer: {
    width: '100%',
    height: '200px',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '8px', // Curved borders for the image
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.8s cubic-bezier(0.2, 0, 0, 1)',
  },
  content: {
    padding: '16px 8px 8px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
  },
  category: {
    fontSize: '11px',
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontFamily: theme.typography.fontSans,
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: theme.colors.textMain,
    lineHeight: '1.4',
    margin: 0,
    fontFamily: theme.typography.fontSans,
    letterSpacing: '-0.01em',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
  },
  description: {
    fontSize: '13px',
    fontWeight: '500',
    color: theme.colors.textMuted,
    lineHeight: '1.5',
    margin: 0,
    fontFamily: theme.typography.fontSans,
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    opacity: 0.8,
  }
};
