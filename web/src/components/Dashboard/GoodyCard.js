"use client";
import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  PenTool, 
  Terminal, 
  Code2, 
  Scale, 
  ExternalLink,
  Check,
  Copy
} from 'lucide-react';
import BookmarkButton from '@/components/ui/BookmarkButton';
import { theme } from '@/theme';

const PLATFORM_CONFIG = {
  sheets: {
    label: 'Google Sheet',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    icon: FileSpreadsheet,
    action: 'Open Sheet'
  },
  notion: {
    label: 'Notion OS',
    color: 'var(--textMain)',
    bgColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'var(--borderDark)',
    icon: FileText,
    action: 'Duplicate'
  },
  figma: {
    label: 'Figma Kit',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.25)',
    icon: PenTool,
    action: 'Open Figma'
  },
  cursorrules: {
    label: 'Cursor Rules',
    color: '#ff5a12',
    bgColor: 'rgba(255, 90, 18, 0.1)',
    borderColor: 'rgba(255, 90, 18, 0.25)',
    icon: Terminal,
    action: 'View Rules'
  },
  code: {
    label: 'Open Source',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    icon: Code2,
    action: 'View Repo'
  },
  legal: {
    label: 'Legal Doc',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    icon: Scale,
    action: 'Get Template'
  },
  tool: {
    label: 'Free Tool',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.25)',
    icon: ExternalLink,
    action: 'Explore'
  }
};

const AUDIENCE_COLORS = {
  'Vibecoders': { color: '#818cf8', bg: 'rgba(99, 102, 241, 0.1)' },
  'SaaS Builders': { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
  'Series Founders': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
};

export default function GoodyCard({
  id,
  title,
  description,
  resource_url,
  platform = 'tool',
  category = 'SaaS Builders',
  author_name = 'Curator',
  author_handle,
  is_featured
}) {
  const [copied, setCopied] = useState(false);
  const cfg = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.tool;
  const PlatformIcon = cfg.icon;
  const audCfg = AUDIENCE_COLORS[category] || AUDIENCE_COLORS['SaaS Builders'];

  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(resource_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <a 
      href={resource_url} 
      target="_blank" 
      rel="noopener noreferrer" 
      style={styles.cardLink}
    >
      <div style={styles.card} className="premium-card">
        <div className="spotlight-border"></div>
        
        {/* Bookmark Button */}
        <BookmarkButton 
          itemData={{ 
            url: resource_url, 
            title, 
            description, 
            type: 'goody',
            category 
          }} 
        />

        {/* Top Meta Header: Platform Badge + Audience Tag */}
        <div style={styles.topHeader}>
          <div style={{
            ...styles.platformBadge,
            backgroundColor: cfg.bgColor,
            borderColor: cfg.borderColor,
            color: cfg.color
          }}>
            <PlatformIcon size={13} strokeWidth={2.4} />
            <span>{cfg.label}</span>
          </div>

          <span style={{
            ...styles.audienceBadge,
            backgroundColor: audCfg.bg,
            color: audCfg.color
          }}>
            {category}
          </span>
        </div>

        {/* Title & Description */}
        <div style={styles.body}>
          <h3 style={styles.title}>{title}</h3>
          {description && <p style={styles.description}>{description}</p>}
        </div>

        {/* Footer: Author Attribution & Action CTA */}
        <div style={styles.footer}>
          <div style={styles.authorGroup}>
            <span style={styles.byText}>By</span>
            <span style={styles.authorName}>
              {author_name}
            </span>
            {author_handle && (
              <span style={styles.authorHandle}>
                {author_handle}
              </span>
            )}
          </div>

          <div style={styles.actionGroup}>
            <button 
              onClick={handleCopyLink} 
              style={styles.copyBtn} 
              title="Copy link"
              className="click-effect"
            >
              {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
            </button>

            <span style={styles.actionBtn}>
              <span>{cfg.action}</span>
              <ExternalLink size={12} />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

const styles = {
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    height: '100%'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    padding: '20px 22px',
    backgroundColor: 'var(--bgCard)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
    position: 'relative',
    boxSizing: 'border-box',
    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease',
    overflow: 'hidden'
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
    paddingRight: '36px' // clearance for bookmark button
  },
  platformBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.02em',
    fontFamily: 'inherit'
  },
  audienceBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '6px',
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap'
  },
  body: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '18px'
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--textMain)',
    margin: 0,
    lineHeight: '1.4',
    fontFamily: theme.typography.fontSans,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  description: {
    fontSize: '13px',
    color: 'var(--textMuted)',
    margin: 0,
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid var(--border)',
    gap: '12px'
  },
  authorGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--textMuted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: '1',
    minWidth: 0
  },
  byText: {
    opacity: 0.6
  },
  authorName: {
    fontWeight: '600',
    color: 'var(--textMain)',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  authorHandle: {
    opacity: 0.5,
    fontSize: '11px'
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0
  },
  copyBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--textMuted)',
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.2s ease',
    backgroundColor: 'var(--bgApp)'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.02em',
    boxShadow: '0 2px 6px rgba(255, 90, 18, 0.25)',
    transition: 'opacity 0.2s ease'
  }
};
