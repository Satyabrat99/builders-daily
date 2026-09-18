"use client";
import { theme } from '@/theme';
import { Cpu, Box, Code2, FileText, ArrowUpRight } from 'lucide-react';

export default function ContentCard({ tagTitle, itemName, link, bgImage }) {
  const type = tagTitle.toLowerCase();
  let Icon = Box;
  let label = 'TOOL';

  if (type.includes('model')) {
    Icon = Cpu;
    label = 'MODEL';
  } else if (type.includes('repo')) {
    Icon = Code2;
    label = 'REPO';
  } else if (type.includes('paper')) {
    Icon = FileText;
    label = 'PAPER';
  }

  const CardContent = (
    <div style={styles.card} className="premium-card content-card">
      <div style={styles.bgImageContainer}>
        <img src={bgImage || "/model-2-png.png"} alt="Background" style={styles.bgImage} />
      </div>

      <div style={styles.leftCol}>
        <div style={styles.tagRow}>
          <span style={styles.tagLabel}>{label}</span>
        </div>
        
        <div style={styles.infoArea}>
          <h4 style={styles.itemName}>{itemName}</h4>
          <p style={styles.metaText}>{tagTitle.split(':')[0]}</p>
        </div>
      </div>

      <div style={styles.rightCol}>
        <ArrowUpRight size={16} style={styles.arrowIcon} />
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          {CardContent}
        </a>
      ) : (
        CardContent
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    flex: 1,
    minWidth: '200px',
  },
  card: {
    height: '140px',
    borderRadius: theme.radius.lg,
    border: `1px solid rgba(249, 115, 22, 0.15)`, // Subtle orange border
    backdropFilter: theme.colors.glass.blur,
    WebkitBackdropFilter: theme.colors.glass.blur,
    display: 'flex',
    flexDirection: 'row',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: theme.shadows.card,
  },
  leftCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 2,
    paddingRight: '30px',
  },
  tagRow: {
    display: 'flex',
    alignItems: 'center',
  },
  tagLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: theme.colors.primary, // Orange accent
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontFamily: theme.typography.fontSans,
  },
  infoArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  itemName: {
    fontSize: '16px', // Scaled down for cleaner UI and to handle long names
    fontWeight: '700',
    color: theme.colors.textMain,
    fontFamily: theme.typography.fontSans,
    margin: 0,
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word', // Ensure long repo names wrap nicely without overflowing
  },
  metaText: {
    fontSize: '13px',
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontSans,
    fontWeight: '500',
    margin: 0,
  },
  rightCol: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    zIndex: 3,
  },
  arrowIcon: {
    color: theme.colors.primary, // Orange accent
    zIndex: 2,
  },
  bgImageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '50%',
    pointerEvents: 'none',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  bgImage: {
    height: '140%', // Oversized for cool effect
    objectFit: 'contain',
    transform: 'translate(10%, 10%)',
    opacity: 0.9,
  }
};
