"use client";
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useBookmarks } from '@/context/BookmarkContext';
import { theme } from '@/theme';
import { Bookmark, Inbox } from 'lucide-react';

import GemCard from '@/components/Dashboard/GemCard';
import ContentCard from '@/components/Dashboard/ContentCard';
import FreshLinkCard from '@/components/Dashboard/FreshLinkCard';
import ProductItem from '@/components/Dashboard/ProductItem';
import RepoCard from '@/components/Dashboard/RepoCard';

export default function BookmarksPage() {
  const { bookmarks, loading } = useBookmarks();

  const renderCard = (bookmark) => {
    const { type, card_data } = bookmark;
    const { url, title, description, image, category } = card_data;

    switch (type) {
      case 'repo':
        return (
          <div style={styles.cardWrapper} key={url}>
            <RepoCard url={url} title={title} description={description} />
          </div>
        );
      case 'gem':
      case 'news':
        return (
          <div style={styles.cardWrapper} key={url}>
            <GemCard url={url} title={title} description={description} image={image} showBadge={false} />
          </div>
        );
      case 'link':
        return (
          <div style={styles.cardWrapper} key={url}>
            <FreshLinkCard url={url} title={title} description={description} image={image} category={category} />
          </div>
        );
      case 'product':
        return (
          <div style={styles.cardWrapper} key={url}>
            <ProductItem url={url} name={title} description={description} thumbnail={image} />
          </div>
        );
      default:
        // Treat as ContentCard (tool, model, paper)
        return (
          <div style={styles.cardWrapper} key={url}>
            <ContentCard link={url} itemName={title} tagTitle={description} bgImage={image} />
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <div style={styles.iconWrapper}>
            <Bookmark size={24} color={theme.colors.primary} />
          </div>
          <div>
            <h1 style={styles.title}>Saved Items</h1>
            <p style={styles.subtitle}>Your personal collection of curated AI resources.</p>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div className="spinner"></div>
          </div>
        ) : bookmarks.length > 0 ? (
          <div style={styles.sectionsContainer}>
            {/* Repositories Section */}
            {bookmarks.filter(b => b.type === 'repo').length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Trending Repositories</h2>
                <div style={styles.grid}>
                  {bookmarks.filter(b => b.type === 'repo').map(renderCard)}
                </div>
              </div>
            )}
            
            {/* Standard Cards Section */}
            {bookmarks.filter(b => b.type !== 'product' && b.type !== 'repo').length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Resources & Links</h2>
                <div style={styles.grid}>
                  {bookmarks.filter(b => b.type !== 'product' && b.type !== 'repo').map(renderCard)}
                </div>
              </div>
            )}

            {/* AI Tools Section */}
            {bookmarks.filter(b => b.type === 'product').length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>AI Tools</h2>
                <div style={styles.productGrid}>
                  {bookmarks.filter(b => b.type === 'product').map(renderCard)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <Inbox size={48} strokeWidth={1} color={theme.colors.textMuted} />
            </div>
            <h2 style={styles.emptyTitle}>Nothing saved yet</h2>
            <p style={styles.emptySubtitle}>
              Hover over any card in your dashboard and click the bookmark icon to save it here for later.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

const styles = {
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    paddingBottom: '60px'
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '40px 20px',
    marginTop: '20px'
  },
  iconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: `1px solid rgba(249, 115, 22, 0.2)`,
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: theme.colors.textMain,
    fontFamily: theme.typography.fontSans,
    margin: '0 0 4px 0',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '15px',
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontSans,
    margin: 0,
    fontWeight: '500',
  },
  sectionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    padding: '0 20px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: theme.colors.textMain,
    fontFamily: theme.typography.fontSans,
    margin: 0,
    paddingLeft: '4px',
    borderLeft: `4px solid ${theme.colors.primary}`,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
  },
  cardWrapper: {
    display: 'flex',
    height: '100%'
  },
  loadingContainer: {
    padding: '100px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    backgroundColor: theme.colors.bgCard,
    borderRadius: '24px',
    border: `1px dashed ${theme.colors.border}`,
    margin: '0 20px',
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: theme.colors.bgApp,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: theme.colors.textMain,
    margin: 0,
    fontFamily: theme.typography.fontSans,
  },
  emptySubtitle: {
    fontSize: '15px',
    color: theme.colors.textMuted,
    maxWidth: '400px',
    margin: 0,
    lineHeight: '1.5',
  }
};
