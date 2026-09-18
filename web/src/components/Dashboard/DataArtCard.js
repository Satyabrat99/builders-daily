"use client";
import React from 'react';
import { theme } from '@/theme';
import { Clock, MessageSquare, Flame, BarChart2, Share2, Compass, AlertCircle } from 'lucide-react';

// Deterministic helper to get stable colors and values based on the title
function getDeterministicMockData(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  
  // Pick a gradient variant
  const gradients = [
    { bg: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', accent: '#38BDF8', glow: 'rgba(56, 189, 248, 0.15)' }, // Blue/Dark
    { bg: 'linear-gradient(135deg, #1E1B4B 0%, #311042 100%)', accent: '#EC4899', glow: 'rgba(236, 72, 153, 0.15)' }, // Pink/Indigo
    { bg: 'linear-gradient(135deg, #022C22 0%, #064E3B 100%)', accent: '#34D399', glow: 'rgba(52, 211, 153, 0.15)' }, // Teal/Green
    { bg: 'linear-gradient(135deg, #2E1065 0%, #1E1B4B 100%)', accent: '#A78BFA', glow: 'rgba(167, 139, 250, 0.15)' }  // Purple
  ];
  const gradient = gradients[absHash % gradients.length];
  
  // Fake statistics
  const readTime = (absHash % 7) + 3; // 3 to 9 mins
  const points = (absHash % 400) + 95; // 95 to 495
  const comments = (absHash % 120) + 15;
  const ratio = 85 + (absHash % 14); // 85% to 98%
  const hotIndex = (absHash % 5) + 5; // 5 to 9 out of 10
  
  // Domain resolution
  const domains = ['techcrunch.com', 'wired.com', 'medium.com/ai', 'arxiv.org', 'github.com', 'news.ycombinator.com', 'reddit.com/r/ai'];
  const domain = domains[absHash % domains.length];
  
  return { gradient, readTime, points, comments, ratio, hotIndex, domain };
}

export default function DataArtCard({ title, description, type = 'news' }) {
  const { gradient, readTime, points, comments, ratio, hotIndex, domain } = getDeterministicMockData(title);
  
  // Large background monogram (Option 3)
  const monogram = title ? title.trim().charAt(0).toUpperCase() : 'B';

  const renderContent = () => {
    switch (type) {
      case 'hn':
        return (
          <div style={styles.contentContainer}>
            {/* HN Styled top bar */}
            <div style={styles.hnHeader}>
              <span style={styles.hnBadge}>HN PICK</span>
              <span style={styles.domainText}>{domain}</span>
            </div>

            {/* Main Typographic block */}
            <div style={styles.mainContent}>
              <h4 style={styles.cardTitle}>{title}</h4>
              <p style={styles.cardDescription}>{description}</p>
            </div>

            {/* HN retro data grid */}
            <div style={styles.dataGrid}>
              <div style={styles.dataItem}>
                <Flame size={14} style={{ color: '#F97316' }} />
                <span style={styles.dataLabel}>POINTS</span>
                <span style={styles.dataVal}>{points}</span>
              </div>
              <div style={styles.dataItem}>
                <MessageSquare size={14} style={{ color: '#38BDF8' }} />
                <span style={styles.dataLabel}>COMMENTS</span>
                <span style={styles.dataVal}>{comments}</span>
              </div>
              <div style={styles.dataItem}>
                <Clock size={14} style={{ color: '#A78BFA' }} />
                <span style={styles.dataLabel}>READ TIME</span>
                <span style={styles.dataVal}>{readTime}m</span>
              </div>
            </div>
          </div>
        );

      case 'reddit':
        return (
          <div style={styles.contentContainer}>
            {/* Reddit top bar */}
            <div style={styles.redditHeader}>
              <span style={styles.redditBadge}>REDDIT DRAFT</span>
              <span style={styles.domainText}>{domain}</span>
            </div>

            {/* Massive Subreddit Watermark Background */}
            <div style={styles.watermark}>{monogram}</div>

            {/* Main Content */}
            <div style={styles.mainContent}>
              <h4 style={styles.cardTitle}>{title}</h4>
              <p style={styles.cardDescription}>{description}</p>
            </div>

            {/* Reddit upvote indicator */}
            <div style={styles.redditFooter}>
              <div style={styles.upvoteSection}>
                <div style={styles.progressContainer}>
                  <div style={{ ...styles.progressBar, width: `${ratio}%`, backgroundColor: '#FF4500' }}></div>
                </div>
                <span style={styles.ratioText}>{ratio}% Upvoted</span>
              </div>
              <div style={styles.commentsSection}>
                <MessageSquare size={14} style={{ color: '#FFF', opacity: 0.6 }} />
                <span style={styles.commentCount}>{comments} discussions</span>
              </div>
            </div>
          </div>
        );

      case 'news':
      default:
        return (
          <div style={styles.contentContainer}>
            {/* Editorial Header */}
            <div style={styles.newsHeader}>
              <Compass size={16} style={{ color: gradient.accent }} />
              <span style={styles.domainText}>{domain}</span>
            </div>

            {/* Monogram backdrop */}
            <div style={styles.monogramBackdrop}>{monogram}</div>

            {/* Main Content */}
            <div style={styles.mainContent}>
              <h4 style={styles.cardTitle}>{title}</h4>
              <p style={styles.cardDescription}>{description}</p>
            </div>

            {/* Abstract Analytics bar */}
            <div style={styles.newsFooter}>
              <div style={styles.aiTag}>
                <BarChart2 size={12} style={{ color: gradient.accent }} />
                <span>AI ANALYZED</span>
              </div>
              <div style={styles.readBadge}>
                <span>{readTime} MIN READ</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      ...styles.artCard, 
      background: gradient.bg,
      boxShadow: `0 12px 30px -10px ${gradient.glow}`
    }}>
      {/* Decorative scanner line */}
      <div style={{ ...styles.accentLine, backgroundColor: gradient.accent }} />
      {renderContent()}
    </div>
  );
}

const styles = {
  artCard: {
    width: '100%',
    height: '240px', // Matches existing GemCard image container height exactly
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    color: '#FFF',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    zIndex: 2
  },
  contentContainer: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
    zIndex: 1,
    position: 'relative'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: 'auto',
    justifyContent: 'center',
    flex: 1
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#F8FAFC',
    margin: 0,
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardDescription: {
    fontSize: '12px',
    fontWeight: '300',
    color: '#94A3B8',
    margin: 0,
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  // HN Styling
  hnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '10px',
    fontWeight: '600'
  },
  hnBadge: {
    backgroundColor: '#F97316',
    color: '#FFF',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: '800'
  },
  domainText: {
    color: '#64748B',
    fontFamily: 'monospace'
  },
  dataGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    gap: '8px'
  },
  dataItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px'
  },
  dataLabel: {
    color: '#64748B',
    fontWeight: '700',
    fontFamily: 'sans-serif'
  },
  dataVal: {
    color: '#F1F5F9',
    fontWeight: '800',
    fontFamily: 'monospace'
  },
  // Reddit Styling
  redditHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '10px',
    fontWeight: '600'
  },
  redditBadge: {
    backgroundColor: '#FF4500',
    color: '#FFF',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9px',
    fontWeight: '800'
  },
  watermark: {
    position: 'absolute',
    right: '10px',
    top: '30px',
    fontSize: '120px',
    fontWeight: '900',
    fontFamily: 'sans-serif',
    color: 'rgba(255, 255, 255, 0.02)',
    pointerEvents: 'none',
    userSelect: 'none'
  },
  redditFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  upvoteSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  progressContainer: {
    width: '50px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%'
  },
  ratioText: {
    color: '#FF4500',
    fontWeight: '700',
    fontSize: '10px'
  },
  commentsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#94A3B8'
  },
  commentCount: {
    fontSize: '10px',
    fontWeight: '600'
  },
  // News Styling
  newsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '10px',
    fontWeight: '600'
  },
  monogramBackdrop: {
    position: 'absolute',
    right: '0',
    bottom: '-20px',
    fontSize: '150px',
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.025)',
    fontFamily: 'Georgia, serif',
    pointerEvents: 'none',
    userSelect: 'none'
  },
  newsFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '10px'
  },
  aiTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '700',
    color: '#94A3B8'
  },
  readBadge: {
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '9px',
    color: '#FFF',
    letterSpacing: '0.05em'
  }
};
