"use client";
import { theme } from '@/theme';

export default function PremiumCard({ children, style, onClick, innerRef, onMouseMove }) {
  return (
    <div 
      className="premium-card" 
      style={{ ...styles.card, ...style }}
      onClick={onClick}
      ref={innerRef}
      onMouseMove={onMouseMove}
    >
      {children}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    overflow: 'hidden',
    boxShadow: theme.shadows.card,
    transition: 'all 0.3s ease',
  }
};
