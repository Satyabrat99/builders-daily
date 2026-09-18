"use client";
import KnowledgeSphere from './KnowledgeSphere';
import { theme } from '@/theme';
import DynamicHeading from '../ui/DynamicHeading';

export default function Header({ reportDate, issueNumber }) {
  // Use the report's date if available, otherwise fallback to today
  const targetDate = reportDate ? new Date(reportDate) : new Date();
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(targetDate);

  const displayIssue = issueNumber || 1;

  return (
    <div style={styles.container}>
      <div style={styles.leftContent}>
        <div style={styles.topMeta}>
          <span style={styles.metaText}>
            {formattedDate}
            <span style={{ margin: '0 12px', opacity: 0.5 }}>•</span>
            Issue #{displayIssue}
          </span>
        </div>

        <div style={styles.branding}>
          <DynamicHeading />
        </div>

        <p style={styles.subtitle}>YOUR DAILY DIGEST FOR AI DEVELOPERS</p>
      </div>

      <div style={styles.rightContent} className="header-right">
        <KnowledgeSphere />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    padding: 'var(--header-padding, 40px 0 60px 0)',
    position: 'relative',
  },
  leftContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    zIndex: 2,
  },
  topMeta: {
    marginBottom: '10px',
  },
  metaText: {
    fontSize: '13px',
    fontWeight: '500',
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontSans,
  },
  branding: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '0.9',
  },
  title: {
    fontSize: '110px',
    fontWeight: '700',
    color: theme.colors.textMain,
    margin: 0,
    padding: 0,
    fontFamily: theme.typography.fontSerif,
    letterSpacing: '-2px',
  },
  subtitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: '0.15em',
    fontFamily: theme.typography.fontSans,
    marginTop: '6px',
  },
  rightContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    right: '-2%',
    top: '20px',
    width: '50%',
    pointerEvents: 'none',
  },
};
