"use client";
import FreshLinkCard from './FreshLinkCard';
import ProductItem from './ProductItem';
import { theme } from '@/theme';
import Link from 'next/link';
import { FreshLinksIcon, AiToolsIcon } from '@/components/ui/SectionIcons';

export default function DualFeedSection({ links, products }) {
  if (!links && !products) return null;
  const freshLinks = links || [];
  const aiProducts = products || [];

  return (
    <div style={styles.container}>
      {/* Left Column (70%) */}
      <div style={styles.leftCol}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <div style={styles.iconBox}>
              <div style={{
                ...styles.iconWrapper, 
                backgroundColor: 'rgba(255, 90, 18, 0.08)',
                borderColor: 'rgba(255, 90, 18, 0.22)'
              }}>
                <FreshLinksIcon size={22} color="#ff5a12" />
              </div>
            </div>
            <div style={styles.titleStack}>
              <h2 style={styles.sectionTitle}>Fresh Links</h2>
              <span style={styles.sectionSubtitle}>Curated technical insights & news</span>
            </div>
          </div>
          <button style={styles.moreBtn}>•••</button>
        </div>

        <div style={styles.linkGrid}>
          {freshLinks.map((link, i) => (
            <div key={i} className="stagger-entry">
              <FreshLinkCard {...link} />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column (30%) */}
      <div style={styles.rightCol}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <div style={styles.iconBox}>
              <div style={{
                ...styles.iconWrapper, 
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                borderColor: 'rgba(99, 102, 241, 0.22)'
              }}>
                <AiToolsIcon size={22} color="#818cf8" />
              </div>
            </div>
            <div style={styles.titleStack}>
              <h2 style={styles.sectionTitle}>Ai Tools</h2>
              <span style={styles.sectionSubtitle}>Tools Launching Today</span>
            </div>
          </div>
          <button style={styles.moreBtn}>•••</button>
        </div>

        <div style={styles.productList}>
          {(products || []).map((product, i) => (
            <ProductItem key={i} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'var(--dualfeed-flex-direction, row)',
    gap: 'var(--dualfeed-gap, 60px)',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    padding: 'var(--dualfeed-container-padding, 40px 0 100px 0)',
  },
  leftCol: {
    flex: '1',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  rightCol: {
    flex: 'var(--dualfeed-right-col-flex, 0 0 320px)',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    padding: '0 var(--grid-header-padding-horizontal, 0px)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleStack: {
    display: 'flex',
    flexDirection: 'column',
  },
  iconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid var(--borderDark, rgba(255,255,255,0.08))',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 'var(--section-title-font-size, 32px)',
    fontWeight: '800',
    color: theme.colors.textMain,
    margin: 0,
    fontFamily: theme.typography.fontSerif,
    letterSpacing: '-0.02em',
    lineHeight: '1',
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: theme.colors.textMuted,
    marginTop: '6px',
    fontWeight: '600',
    opacity: 0.7,
  },
  moreBtn: {
    background: 'none',
    border: 'none',
    color: theme.colors.textMuted,
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    opacity: 0.4,
    transition: 'opacity 0.2s ease',
  },
  linkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
    gap: '32px',
  },
  productList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }
};
