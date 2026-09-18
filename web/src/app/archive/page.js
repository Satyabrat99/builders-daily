"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { theme } from '@/theme';
import { Archive, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ArchivePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    // 1. Instant sessionStorage cache lookup
    try {
      const cached = sessionStorage.getItem('bd_archives_list_cache');
      if (cached) {
        setReports(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {}

    // 2. Fetch fresh
    const { data, error } = await supabase
      .from('daily_reports')
      .select('report_date, content_json')
      .eq('status', 'published')
      .order('report_date', { ascending: true });

    if (!error && data) {
      // Add issue numbers (index + 1)
      const processed = data.map((report, index) => ({
        ...report,
        issueNumber: index + 1
      }));
      const reversed = processed.reverse();
      setReports(reversed);
      try {
        sessionStorage.setItem('bd_archives_list_cache', JSON.stringify(reversed));
      } catch (e) {}
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <MainLayout>
      <div style={styles.content}>
        <div style={styles.pageHeader}>
          <div style={styles.iconWrapper}>
            <Archive size={24} color={theme.colors.primary} />
          </div>
          <div>
            <h1 style={styles.title}>Archive</h1>
            <p style={styles.subtitle}>Browse past issues of the Daily AI Report.</p>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div className="spinner"></div>
          </div>
        ) : reports.length > 0 ? (
          <div style={styles.contentWrapper}>
            {/* Coming Soon Overlay */}
            <div style={styles.comingSoonOverlay}>
              <div style={styles.comingSoonBadge}>COMING SOON</div>
              <h2 style={styles.comingSoonTitle}>The Time Machine is Building</h2>
              <p style={styles.comingSoonText}>
                We are curating the archives. Soon you'll be able to travel back in time to read every single issue of Builders Daily.
              </p>
            </div>
            
            {/* Blurred out actual content */}
            <div style={styles.blurredGrid}>
              {reports.map((report) => (
                <div 
                  key={report.report_date} 
                  style={styles.card}
                  // onClick={() => router.push(`/archive/${report.report_date}`)} // Disabled for now
                  className="hover-card"
                >
                  <div style={styles.cardTop}>
                    <div style={styles.issueBadge}>Issue #{report.issueNumber}</div>
                    <div style={styles.dateRow}>
                      <Calendar size={14} color={theme.colors.textMuted} />
                      <span style={styles.dateText}>{formatDate(report.report_date)}</span>
                    </div>
                  </div>
                  
                  <h3 style={styles.cardTitle}>
                    {report.content_json?.dailyReport?.headline || 'Daily AI Roundup'}
                  </h3>
                  
                  <p style={styles.cardPreview}>
                    {report.content_json?.dailyReport?.summary || 'Catch up on the latest models, tools, and trends in the AI space.'}
                  </p>

                  <div style={styles.cardBottom}>
                    <span style={styles.readMore}>Read Issue</span>
                    <ArrowRight size={16} color={theme.colors.primary} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <Archive size={48} color={theme.colors.textMuted} opacity={0.5} />
            <h2 style={styles.emptyTitle}>No Archives Yet</h2>
            <p style={styles.emptySubtitle}>There are no published reports to show.</p>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
    padding: '0 20px',
  },
  contentWrapper: {
    position: 'relative',
    minHeight: '400px',
  },
  blurredGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
    padding: '0 20px',
    filter: 'blur(8px)',
    opacity: 0.4,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  comingSoonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    textAlign: 'center',
    padding: '40px',
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.primary,
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
  },
  comingSoonTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: theme.colors.textMain,
    margin: '0 0 16px 0',
    fontFamily: theme.typography.fontSans,
  },
  comingSoonText: {
    fontSize: '16px',
    color: theme.colors.textMuted,
    maxWidth: '500px',
    lineHeight: '1.6',
    margin: 0,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  issueBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    color: theme.colors.primary,
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dateText: {
    fontSize: '13px',
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: theme.colors.textMain,
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  cardPreview: {
    fontSize: '14px',
    color: theme.colors.textMuted,
    lineHeight: '1.6',
    margin: '0 0 24px 0',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    flex: 1,
  },
  cardBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: 'auto',
  },
  readMore: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.primary,
  },
  loadingContainer: {
    padding: '100px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: '100px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: theme.colors.textMain,
    margin: 0,
  },
  emptySubtitle: {
    fontSize: '15px',
    color: theme.colors.textMuted,
    margin: 0,
  }
};
