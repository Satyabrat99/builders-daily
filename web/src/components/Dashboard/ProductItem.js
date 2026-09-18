"use client";
import { theme } from '@/theme';
import BookmarkButton from '@/components/ui/BookmarkButton';

export default function ProductItem({ name, description, thumbnail, url }) {
  const CardContent = (
    <div style={styles.item} className="premium-card">
      <BookmarkButton itemData={{ url, title: name, description, image: thumbnail, type: 'product' }} />
      <div style={styles.thumbnailContainer}>
        {thumbnail ? (
          <img src={thumbnail} alt={name} style={styles.thumbnail} />
        ) : (
          <div style={styles.placeholderIcon}>{name[0]}</div>
        )}
      </div>
      <div style={styles.content}>
        <h4 style={styles.name}>{name}</h4>
        <p style={styles.description}>{description}</p>
      </div>
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}>
        {CardContent}
      </a>
    );
  }

  return CardContent;
}

const styles = {
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '13px 20px',
    backgroundColor: theme.colors.bgCard,
    position: 'relative',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  thumbnailContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '16px', // Squircle-like
    overflow: 'hidden',
    backgroundColor: theme.colors.bgApp,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholderIcon: {
    fontSize: '20px',
    fontWeight: '800',
    color: theme.colors.primary,
    fontFamily: theme.typography.fontSans,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflow: 'hidden',
    flex: '1'
  },
  name: {
    fontSize: '16px',
    fontWeight: '700',
    color: theme.colors.textMain,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: theme.typography.fontSans,
    lineHeight: '1.4',
    letterSpacing: '-0.01em',
  },
  description: {
    fontSize: '13px',
    fontWeight: '500',
    color: theme.colors.textMuted,
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.5',
  }
};
