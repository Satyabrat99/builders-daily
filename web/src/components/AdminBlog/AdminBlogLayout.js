"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BookOpen, Layers, Plus, RefreshCw } from 'lucide-react';
import AccessDenied from '@/components/Admin/AccessDenied';
import { styles } from './adminBlogStyles';
import { useAdminBlog } from './AdminBlogContext';

export default function AdminBlogLayout({ children }) {
  const pathname = usePathname();
  const { 
    user, 
    authLoading, 
    isWriter, 
    isAdmin, 
    counts, 
    bundles, 
    handleOpenNewBundleModal 
  } = useAdminBlog();

  const isBundles = pathname?.includes('/admin-blog/bundles');

  if (authLoading) {
    return (
      <div style={styles.loadingState}>
        <RefreshCw className="spin" size={24} color="var(--primary)" />
        <span style={styles.loadingText}>Loading editorial studio...</span>
      </div>
    );
  }

  if (!user || !isWriter) {
    return <AccessDenied user={user} />;
  }

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        {/* Navigation Breadcrumb */}
        <div style={styles.navBar}>
          {isAdmin ? (
            <Link href="/admin" style={styles.backLink}>
              <ArrowLeft size={14} />
              <span>Back to Admin Hub</span>
            </Link>
          ) : (
            <Link href="/blog" style={styles.backLink}>
              <ArrowLeft size={14} />
              <span>Back to Blog</span>
            </Link>
          )}
        </div>

        {/* Studio Header */}
        <header style={styles.header}>
          <div style={styles.headerTitleGroup}>
            <div style={styles.titleRow}>
              <h1 style={styles.title}>
                {isBundles ? 'Collections & Bundles' : 'Articles'}
              </h1>
              <span style={styles.countBadge}>
                {isBundles ? bundles.length : counts.total}
              </span>
            </div>
            <p style={styles.subtitle}>
              {isBundles
                ? 'Group articles into thematic series, multi-part guides, and starter bundles.'
                : 'Manage long-form editorial writeups, research experiments, and builder logs.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {isBundles ? (
              <button onClick={handleOpenNewBundleModal} style={styles.newButton}>
                <Plus size={16} />
                <span>New bundle</span>
              </button>
            ) : (
              <Link href="/admin-blog/new" style={styles.newButton}>
                <Plus size={16} />
                <span>New story</span>
              </Link>
            )}
          </div>
        </header>

        {/* Main Section Switcher Tabs: Stories vs Bundles */}
        <div style={styles.mainTabPillGroup}>
          <Link
            href="/admin-blog/stories"
            style={{
              ...styles.mainTabPill,
              backgroundColor: !isBundles ? 'var(--bgCardHover)' : 'transparent',
              color: !isBundles ? 'var(--textMain)' : 'var(--textMuted)',
              borderColor: !isBundles ? 'var(--borderDark)' : 'transparent',
              textDecoration: 'none',
            }}
          >
            <BookOpen size={15} color={!isBundles ? 'var(--primary)' : 'currentColor'} />
            <span>Stories</span>
            <span style={styles.pillCountSmall}>{counts.total}</span>
          </Link>

          <Link
            href="/admin-blog/bundles"
            style={{
              ...styles.mainTabPill,
              backgroundColor: isBundles ? 'var(--bgCardHover)' : 'transparent',
              color: isBundles ? 'var(--textMain)' : 'var(--textMuted)',
              borderColor: isBundles ? 'var(--borderDark)' : 'transparent',
              textDecoration: 'none',
            }}
          >
            <Layers size={15} color={isBundles ? 'var(--primary)' : 'currentColor'} />
            <span>Collections & Bundles</span>
            <span style={styles.pillCountSmall}>{bundles.length}</span>
          </Link>
        </div>

        {/* Active Sub-Route Content */}
        {children}
      </div>
    </div>
  );
}
