"use client";
import { useState } from 'react';
import { Copy, Users } from 'lucide-react';
import { theme } from '@/theme';

import { trackEvent } from '@/lib/analytics';

export default function ShareCard() {
  const [copied, setCopied] = useState(false);
  const displayUrl = "buildersdaily.com";

  const handleCopy = () => {
    const urlToCopy = typeof window !== 'undefined' ? window.location.origin : "https://buildersdaily.com";
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    trackEvent('share_link_copied', { url: urlToCopy });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <div className="card">
        <div className="grainy-overlay" />
        <div style={styles.content}>
          {/* Column 1: Brand & Headline */}
          <div style={styles.columnLeft}>
            <div style={styles.iconBox}>
              <Users size={22} color="#f97316" strokeWidth={2.5} />
            </div>
            <div style={styles.textGroup}>
              <span style={styles.labelSmall}>PASS THE ALPHA</span>
              <h2 style={styles.heading}>Help your build squad stay ahead.</h2>
            </div>
          </div>

          <div className="divider" />

          {/* Column 2: Action Area */}
          <div style={styles.columnMiddle}>
            <p style={styles.description}>
              Drop the link in your dev group chats, discord circles, and to fellow vibecoders shipping their next SaaS.
            </p>
            <div style={styles.actionGroup}>
              <div style={styles.urlBox}>
                {displayUrl}
              </div>
              <button onClick={handleCopy} style={styles.copyBtn} className="click-effect">
                <Copy size={14} />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          <div className="divider" />

          {/* Column 3: Stats */}
          <div style={styles.columnRight}>
            <span style={styles.labelSmall}>DAILY CURATION</span>
            <div style={styles.statsArea}>
              <div style={styles.statsValue}>500+</div>
              <span style={styles.statsSub}>Models, repos &amp; tools analyzed daily</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          width: 100%;
          background: radial-gradient(circle at 5% 50%, rgba(154, 52, 18, 0.6) 0%, rgba(9, 9, 11, 0) 70%) padding-box,
                      linear-gradient(90deg, #18181b 0%, #121215 45%, #050507 75%, #000000 100%) padding-box,
                      linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.04) 100%) border-box;
          background-color: #000000;
          border-radius: 32px;
          padding: var(--sharecard-padding, 48px 60px);
          position: relative;
          overflow: hidden;
          border: 1px solid transparent;
        }
        .grainy-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
          background-size: 150px 150px;
          background-repeat: repeat;
          mix-blend-mode: screen;
          z-index: 2;
        }
        .divider {
          width: var(--sharecard-divider-width, 1px);
          height: var(--sharecard-divider-height, 120px);
          border-left: var(--sharecard-divider-border-left, 1px dashed rgba(255, 255, 255, 0.1));
          border-top: var(--sharecard-divider-border-top, none);
          margin: var(--sharecard-divider-margin, 0 10px);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1210px',
    margin: 'var(--sharecard-container-margin, 40px auto 100px)',
    padding: '0 20px',
  },
  content: {
    display: 'flex',
    flexDirection: 'var(--sharecard-flex-direction, row)',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--sharecard-gap, 20px)',
    position: 'relative',
    zIndex: 3,
  },
  columnLeft: {
    flex: '1 1 40%',
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    width: '100%',
  },
  iconBox: {
    width: '56px',
    height: '56px',
    minWidth: '56px',
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid rgba(249, 115, 22, 0.18)',
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  labelSmall: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    color: '#d4d4d8',
    opacity: 0.6,
    fontFamily: 'var(--font-body)',
  },
  heading: {
    fontSize: 'var(--sharecard-heading-font-size, 30px)',
    fontWeight: '500',
    color: '#fff',
    lineHeight: '1.2',
    margin: 0,
    fontFamily: 'var(--font-heading)',
    maxWidth: '320px',
  },
  columnMiddle: {
    flex: '1 1 40%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },
  description: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#a1a1aa',
    maxWidth: '400px',
    margin: 0,
    fontFamily: 'var(--font-body)',
  },
  actionGroup: {
    display: 'flex',
    flexDirection: 'var(--sharecard-action-direction, row)',
    alignItems: 'center',
    gap: '12px',
    border: 'var(--sharecard-action-border, 1px solid rgba(255, 255, 255, 0.08))',
    borderRadius: 'var(--sharecard-action-radius, 14px)',
    padding: 'var(--sharecard-action-padding, 4px)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    width: '100%',
  },
  urlBox: {
    padding: 'var(--sharecard-url-padding, 0 16px)',
    fontSize: '13px',
    color: '#e4e4e7',
    flex: 1,
    fontFamily: 'monospace',
    opacity: 0.8,
    textAlign: 'var(--sharecard-url-align, left)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#f97316',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 'var(--sharecard-btn-radius, 10px)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
    fontFamily: 'var(--font-body)',
    width: 'var(--sharecard-btn-width, auto)',
    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.08)',
  },
  columnRight: {
    flex: '1 1 20%',
    display: 'flex',
    flexDirection: 'var(--sharecard-right-flex-direction, column)',
    alignItems: 'var(--sharecard-right-align, flex-start)',
    justifyContent: 'var(--sharecard-right-justify, flex-start)',
    gap: 'var(--sharecard-right-gap, 12px)',
    padding: 'var(--sharecard-right-padding, 0px)',
    backgroundColor: 'var(--sharecard-right-bg, transparent)',
    border: 'var(--sharecard-right-border, none)',
    borderRadius: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  statsArea: {
    display: 'flex',
    flexDirection: 'var(--sharecard-stats-area-direction, column)',
    gap: 'var(--sharecard-stats-area-gap, 4px)',
    alignItems: 'var(--sharecard-stats-area-align, flex-start)',
  },
  statsValue: {
    fontSize: 'var(--sharecard-stats-value-size, 52px)',
    fontWeight: '700',
    color: '#f9d3a1',
    lineHeight: '1',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
  },
  statsSub: {
    fontSize: '14px',
    color: '#d4d4d8',
    opacity: 0.8,
    fontFamily: 'var(--font-body)',
  }
};
