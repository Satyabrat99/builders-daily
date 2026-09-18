"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import DashboardFeedSlot from '@/components/Dashboard/slots/DashboardFeedSlot';
import DashboardSkeleton from '@/components/Dashboard/DashboardSkeleton';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ArchiveReportPage({ params }) {
  const resolvedParams = React.use(params);
  const { date } = resolvedParams;
  
  const { user, loading: authLoading } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && date) {
      fetchArchivedReport();
    }
  }, [user, authLoading, date]);

  const fetchArchivedReport = async () => {
    // 1. Instant sessionStorage cache lookup for immutable archives
    try {
      const cached = sessionStorage.getItem(`bd_archive_${date}`);
      if (cached) {
        setReport(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch (e) {}

    setLoading(true);

    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('report_date', date)
      .eq('status', 'published')
      .single();

    if (!error && data) {
      // Calculate the real Issue Number
      const { count } = await supabase
        .from('daily_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .lte('report_date', data.report_date);
        
      data.issueNumber = count || 1;
      setReport(data);

      try {
        sessionStorage.setItem(`bd_archive_${date}`, JSON.stringify(data));
      } catch (e) {}
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <MainLayout>
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const { content_json } = report || {};

  return (
    <MainLayout>
      <div style={styles.content}>
        {/* Navigation / Header bar for Archive issue */}
        <div style={styles.banner} onClick={() => router.push('/archive')} className="click-effect">
          <ArrowLeft size={18} color={theme.colors.primary} />
          <div style={styles.bannerText}>
            <span>Historical Issue #{report?.issueNumber || '...'}</span>
            <span style={{ opacity: 0.4, margin: '0 8px' }}>•</span>
            <span style={{ color: theme.colors.primary, fontWeight: '700' }}>{date}</span>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : report ? (
          <DashboardFeedSlot contentJson={content_json} />
        ) : (
          <div style={styles.stateContainer}>
            <h2>Archive Not Found</h2>
            <p>We couldn't find a published report for {date}.</p>
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
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
    border: `1px solid rgba(249, 115, 22, 0.1)`,
    borderRadius: '16px',
    margin: '20px 20px 0 20px',
    cursor: 'pointer',
    width: 'fit-content',
    transition: 'all 0.2s ease',
  },
  bannerText: {
    color: theme.colors.primary,
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: theme.typography.fontSans,
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
