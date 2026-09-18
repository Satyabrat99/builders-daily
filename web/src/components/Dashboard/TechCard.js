"use client";
import { theme } from '@/theme';
import { GitBranch, Star, Clock } from 'lucide-react';

export default function TechCard({ 
  title, 
  subtitle, 
  language = "TypeScript", 
  stars = "12.4k", 
  forks = "2.1k", 
  updated = "2d ago",
  command = "pnpm create next-saas-starter",
  gradientVariant = "dark"
}) {
  // Extract repo owner and name
  const parts = title.split('/');
  const mainTitle = parts.length > 1 ? parts[1] : title;
  const owner = parts.length > 1 ? parts[0] : 'vercel-labs';

  const variants = {
    dark: { bg: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)', text: '#fff', muted: 'rgba(255,255,255,0.6)', cmdBg: 'rgba(255,255,255,0.05)', cmdText: '#4ade80' },
    purple: { bg: 'linear-gradient(135deg, #4C1D95 0%, #1E1B4B 100%)', text: '#fff', muted: 'rgba(255,255,255,0.6)', cmdBg: 'rgba(0,0,0,0.2)', cmdText: '#a78bfa' },
    blue: { bg: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)', text: '#fff', muted: 'rgba(255,255,255,0.6)', cmdBg: 'rgba(0,0,0,0.2)', cmdText: '#60a5fa' },
    light: { bg: 'linear-gradient(135deg, #F9F9F7 0%, #F2F2F0 100%)', text: '#000', muted: 'rgba(0,0,0,0.5)', cmdBg: 'rgba(0,0,0,0.05)', cmdText: '#4b5563' },
  };

  const style = variants[gradientVariant] || variants.dark;

  return (
    <div style={{...styles.card, background: style.bg}} className="tech-art-card">
      <div style={styles.content}>
        
        {/* Top Header: Window Dots & Language */}
        <div style={styles.header}>
          <div style={styles.windowDots}>
            <div style={{...styles.dot, backgroundColor: '#FF5F56'}}></div>
            <div style={{...styles.dot, backgroundColor: '#FFBD2E'}}></div>
            <div style={{...styles.dot, backgroundColor: '#27C93F'}}></div>
          </div>
          <span style={{...styles.language, color: style.cmdText}}>{language}</span>
        </div>

        {/* Main Info */}
        <div style={styles.infoArea}>
          <span style={{...styles.owner, color: style.muted}}>{owner}</span>
          <h3 style={{...styles.title, color: style.text}}>{mainTitle}</h3>
          <p style={{...styles.description, color: style.muted}}>{subtitle}</p>
        </div>

        {/* Command Box */}
        <div style={{...styles.commandBox, backgroundColor: style.cmdBg}}>
          <span style={{...styles.cmdPrefix, color: style.cmdText}}>$</span>
          <span style={{...styles.cmdText, color: style.text}}>{command}</span>
        </div>

        {/* Footer Stats */}
        <div style={styles.footer}>
          <div style={styles.statsGroup}>
            <div style={styles.stat}>
              <Star size={14} style={{...styles.statIcon, color: style.text}} />
              <span style={{...styles.statText, color: style.text}}>{stars}</span>
            </div>
            <div style={styles.stat}>
              <GitBranch size={14} style={{...styles.statIcon, color: style.text}} />
              <span style={{...styles.statText, color: style.text}}>{forks}</span>
            </div>
          </div>
          <span style={{...styles.updated, color: style.muted}}>Updated {updated}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: '100%',
    height: '420px', // Taller to match the image details
    position: 'relative',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  content: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  windowDots: {
    display: 'flex',
    gap: '8px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  language: {
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: theme.typography.fontSans,
  },
  infoArea: {
    marginBottom: 'auto',
  },
  owner: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    display: 'block',
    fontFamily: theme.typography.fontSans,
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    margin: '0 0 16px 0',
    fontFamily: theme.typography.fontSerif,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
  },
  description: {
    fontSize: '15px',
    lineHeight: '1.6',
    margin: 0,
    fontFamily: theme.typography.fontSans,
    display: '-webkit-box',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  commandBox: {
    padding: '16px 20px',
    borderRadius: '12px',
    fontFamily: 'monospace',
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  cmdPrefix: {
    fontWeight: '700',
  },
  cmdText: {
    fontSize: '14px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  statsGroup: {
    display: 'flex',
    gap: '20px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statIcon: {
    opacity: 0.8,
  },
  statText: {
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: theme.typography.fontSans,
  },
  updated: {
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: theme.typography.fontSans,
  }
};
