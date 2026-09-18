"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-error">
        <div style={styles.iconContainer}>
          <AlertTriangle size={48} style={styles.icon} />
        </div>
        
        <h2 style={styles.title}>System Glitch</h2>
        <p style={styles.text}>
          We encountered an unexpected error while processing your request. 
          Please try again, and if the issue persists, let us know.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div style={styles.devError}>
            <p style={{ margin: 0, fontWeight: '700' }}>Developer Note:</p>
            <code style={{ fontSize: '12px' }}>{error.message}</code>
          </div>
        )}

        <button 
          onClick={() => reset()} 
          style={styles.button}
          className="hover-lift"
        >
          <RefreshCcw size={16} />
          <span>Try Again</span>
        </button>
      </div>

      <style jsx>{`
        .glass-error {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(239, 68, 68, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.25);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: 'var(--bgApp)',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '480px',
    padding: '48px 32px',
    borderRadius: '24px',
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  icon: {
    color: '#ef4444',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--textMain)',
    margin: '0 0 16px 0',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.02em',
  },
  text: {
    fontSize: '15px',
    color: 'var(--textMuted)',
    marginBottom: '32px',
    lineHeight: '1.6',
    fontFamily: 'var(--font-body)',
  },
  devError: {
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '32px',
    color: 'var(--textMuted)',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    fontFamily: 'var(--font-body)',
  },
};
