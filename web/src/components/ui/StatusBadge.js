"use client";

export default function StatusBadge({ status, pulse = false, label }) {
  const normalized = (status || '').toLowerCase();
  
  const getColors = () => {
    switch (normalized) {
      case 'published':
      case 'live':
      case 'active':
        return {
          bg: 'var(--statusSuccessBg)',
          border: 'var(--statusSuccessBorder)',
          text: 'var(--statusSuccess)',
          dot: 'var(--statusSuccess)'
        };
      case 'draft':
      case 'inactive':
        return {
          bg: 'var(--statusNeutralBg)',
          border: 'var(--statusNeutralBorder)',
          text: 'var(--statusNeutral)',
          dot: 'var(--statusNeutral)'
        };
      case 'pending':
      case 'warning':
        return {
          bg: 'var(--statusWarningBg)',
          border: 'var(--statusWarningBorder)',
          text: 'var(--statusWarning)',
          dot: 'var(--statusWarning)'
        };
      case 'error':
      case 'revoked':
        return {
          bg: 'var(--statusDangerBg)',
          border: 'var(--statusDangerBorder)',
          text: 'var(--statusDanger)',
          dot: 'var(--statusDanger)'
        };
      default:
        return {
          bg: 'var(--bgCardHover)',
          border: 'var(--borderDark)',
          text: 'var(--textMuted)',
          dot: 'var(--textMuted)'
        };
    }
  };

  const colors = getColors();

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      color: colors.text,
      lineHeight: '1.2'
    }}>
      {pulse && (
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: colors.dot,
        }} />
      )}
      {label || status}
    </span>
  );
}
