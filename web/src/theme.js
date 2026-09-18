/**
 * AI Builder Daily - JavaScript Design Token System
 * 
 * Provides typed, structured access to design tokens for React components,
 * inline styles, and dynamic JS runtime evaluation while staying 100% in sync
 * with CSS custom properties in `src/styles/tokens.css`.
 */

export const theme = {
  colors: {
    /* Surfaces */
    bgApp: 'var(--bgApp)',
    bgSidebar: 'var(--bgSidebar)',
    bgCard: 'var(--bgCard)',
    bgCardHover: 'var(--bgCardHover)',
    bgContentCard: 'var(--bgContentCard)',
    bgContentCardHover: 'var(--bgContentCardHover)',
    mobileDrawerBg: 'var(--mobile-drawer-bg)',

    /* Borders */
    border: 'var(--border)',
    borderDark: 'var(--borderDark)',
    borderSubtle: 'var(--borderSubtle)',

    /* Text */
    textMain: 'var(--textMain)',
    textHeading: 'var(--textHeading, var(--textMain))',
    textMuted: 'var(--textMuted)',
    textInverse: 'var(--textInverse)',

    /* Brand */
    primary: 'var(--primary)',
    primaryHover: 'var(--primaryHover)',
    primaryTint: 'var(--primaryTint)',
    accent: 'var(--accent)',
    accentHover: 'var(--accentHover)',
    accentTint: 'var(--accentTint)',

    /* Glassmorphism */
    glass: {
      bg: 'var(--glassBg)',
      border: 'var(--glassBorder)',
      blur: 'var(--glassBlur, blur(16px))',
    }
  },

  /* Semantic Status Tokens (Badges, Alerts, Action Chips) */
  status: {
    success: {
      color: 'var(--statusSuccess)',
      bg: 'var(--statusSuccessBg)',
      border: 'var(--statusSuccessBorder)',
    },
    danger: {
      color: 'var(--statusDanger)',
      bg: 'var(--statusDangerBg)',
      border: 'var(--statusDangerBorder)',
    },
    warning: {
      color: 'var(--statusWarning)',
      bg: 'var(--statusWarningBg)',
      border: 'var(--statusWarningBorder)',
    },
    neutral: {
      color: 'var(--statusNeutral)',
      bg: 'var(--statusNeutralBg)',
      border: 'var(--statusNeutralBorder)',
    },
    info: {
      color: 'var(--statusInfo)',
      bg: 'var(--statusInfoBg)',
      border: 'var(--statusInfoBorder)',
    }
  },

  /* Typography Scale */
  typography: {
    fontSerif: 'var(--font-heading), "Playfair Display", Georgia, serif',
    fontSans: 'var(--font-body), "Inter", system-ui, -apple-system, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace',
    
    sizes: {
      xs: '11px',
      sm: '12px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '32px',
    },
    
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    }
  },

  /* Shadow Scale */
  shadows: {
    sm: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04))',
    card: 'var(--shadow-card, 0 4px 12px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.04))',
    hover: 'var(--shadow-hover, 0 10px 25px rgba(0,0,0,0.05))',
    soft: 'var(--shadow-soft, 0 20px 40px rgba(0,0,0,0.06))',
    floating: 'var(--shadow-floating, 0 20px 40px -15px rgba(0, 0, 0, 0.05))',
    spotlight: 'var(--shadow-spotlight, 0 0 20px rgba(99, 102, 241, 0.15))',
  },

  /* Radius Scale */
  radius: {
    xs: 'var(--radius-xs, 4px)',
    sm: 'var(--radius-sm, 8px)',
    md: 'var(--radius-md, 12px)',
    lg: 'var(--radius-lg, 16px)',
    xl: 'var(--radius-xl, 20px)',
    '2xl': 'var(--radius-2xl, 24px)',
    '3xl': 'var(--radius-3xl, 32px)',
    full: 'var(--radius-full, 9999px)',
  },

  /* Spacing Scale (4px Base Grid) */
  spacing: {
    1: 'var(--space-1, 4px)',
    2: 'var(--space-2, 8px)',
    3: 'var(--space-3, 12px)',
    4: 'var(--space-4, 16px)',
    5: 'var(--space-5, 20px)',
    6: 'var(--space-6, 24px)',
    7: 'var(--space-7, 28px)',
    8: 'var(--space-8, 32px)',
    10: 'var(--space-10, 40px)',
    12: 'var(--space-12, 48px)',
    16: 'var(--space-16, 64px)',
  },

  /* Motion & Transitions */
  motion: {
    fast: 'var(--transition-fast, 0.15s ease)',
    normal: 'var(--transition-normal, 0.3s ease)',
    slow: 'var(--transition-slow, 0.5s ease)',
    smooth: 'var(--transition-smooth, 0.4s cubic-bezier(0.23, 1, 0.32, 1))',
    standard: 'var(--motion-standard, 0.3s cubic-bezier(0.4, 0, 0.2, 1))',
  },

  /* Layering & Z-Index */
  zIndex: {
    base: 'var(--z-base, 0)',
    card: 'var(--z-card, 1)',
    sticky: 'var(--z-sticky, 100)',
    dock: 'var(--z-dock, 500)',
    drawer: 'var(--z-drawer, 900)',
    modal: 'var(--z-modal, 1000)',
    popover: 'var(--z-popover, 1100)',
    toast: 'var(--z-toast, 1200)',
  }
};

/* Provide `radii` alias for styled-system ergonomic standard */
theme.radii = theme.radius;

export default theme;
