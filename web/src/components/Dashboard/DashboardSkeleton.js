"use client";

import Skeleton from 'react-loading-skeleton';
import AppSkeleton from '@/components/ui/AppSkeleton';
import Divider from '@/components/ui/Divider';

export default function DashboardSkeleton() {
  return (
    <AppSkeleton>
      <div style={styles.container}>
        {/* Header Skeleton */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <Skeleton circle width={50} height={50} />
            <div style={styles.headerText}>
              <Skeleton width={200} height={32} />
              <Skeleton width={150} height={20} />
            </div>
          </div>
          <div style={styles.headerActions}>
            <Skeleton width={100} height={40} borderRadius={20} />
          </div>
        </div>

        {/* Daily Report Skeleton */}
        <div style={styles.reportCard}>
          <Skeleton width="40%" height={28} style={{ marginBottom: 16 }} />
          <Skeleton count={4} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" />
        </div>

        <Divider />

        {/* Dual Feed Skeleton */}
        <div style={styles.dualFeed}>
          <div style={styles.column}>
            <Skeleton width={150} height={24} style={{ marginBottom: 16 }} />
            <div style={styles.feedList}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={60} borderRadius={12} style={{ marginBottom: 12 }} />
              ))}
            </div>
          </div>
          <div style={styles.column}>
            <Skeleton width={150} height={24} style={{ marginBottom: 16 }} />
            <div style={styles.feedList}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={60} borderRadius={12} style={{ marginBottom: 12 }} />
              ))}
            </div>
          </div>
        </div>

        <Divider />

        {/* Slider Skeleton */}
        <div>
          <Skeleton width={180} height={28} style={{ marginBottom: 16 }} />
          <div style={styles.sliderRow}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={styles.slideItem}>
                <Skeleton height={200} borderRadius={16} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppSkeleton>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingBottom: '40px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  reportCard: {
    padding: '24px',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  dualFeed: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  column: {
    flex: '1 1 300px',
  },
  feedList: {
    display: 'flex',
    flexDirection: 'column',
  },
  sliderRow: {
    display: 'flex',
    gap: '16px',
    overflow: 'hidden',
  },
  slideItem: {
    flex: '1 1 33.333%',
  }
};
