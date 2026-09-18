"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDailyReport } from '@/hooks/useDailyReport';
import { trackEvent } from '@/lib/analytics';
import LoginForm from '@/components/Auth/LoginForm';
import MainLayout from '@/components/Layout/MainLayout';
import Header from '@/components/Dashboard/Header';
import DashboardSkeleton from '@/components/Dashboard/DashboardSkeleton';
import DashboardFeedSlot from '@/components/Dashboard/slots/DashboardFeedSlot';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { report, loading } = useDailyReport(user, authLoading);

  useEffect(() => {
    trackEvent('view_dashboard');
  }, []);

  if (authLoading) {
    return (
      <MainLayout>
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  const isPreview = typeof window !== 'undefined' && window.location.search.includes('preview');

  if (!user && !isPreview) {
    return (
      <main style={styles.main}>
        <LoginForm />
      </main>
    );
  }

  return (
    <MainLayout>
      <div style={styles.content}>
        <Header reportDate={report?.report_date} issueNumber={report?.issueNumber} />
        
        {loading ? (
          <DashboardSkeleton />
        ) : report ? (
          <DashboardFeedSlot contentJson={report.content_json} />
        ) : (
          <div style={styles.stateContainer}>
            <h2>No published report found today.</h2>
            <p>The builder is still curating the latest AI trends.</p>
          </div>
        )}
      </div>

      {report && (
        <Link href="/blog" style={styles.floatingBlogBtn} className="floating-blog-btn click-effect">
          <BookOpen size={14} />
          <span>Read our Blogs</span>
        </Link>
      )}
    </MainLayout>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  stateContainer: {
    padding: '100px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    textAlign: 'center',
    color: '#64748b'
  },
  floatingBlogBtn: {
    position: 'fixed',
    bottom: 'var(--blog-btn-bottom, 32px)',
    right: 'var(--blog-btn-right, 32px)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
    cursor: 'pointer',
    fontFamily: 'var(--font-body), system-ui, sans-serif',
  }
};
