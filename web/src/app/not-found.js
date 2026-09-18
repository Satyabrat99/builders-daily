"use client";

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.errorContainer}>
          <h1 className="glitch-text" style={styles.title} data-text="404">404</h1>
        </div>
        
        <h2 style={styles.subtitle}>Lost in Space</h2>
        <p style={styles.text}>
          The page you're looking for seems to have drifted into the void.
        </p>
        
        <Link href="/" style={styles.button} className="hover-lift">
          <Home size={18} />
          <span>Return Home</span>
        </Link>
      </div>

      <style jsx>{`
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3);
        }
        
        .glitch-text {
          position: relative;
          color: var(--textMain);
          animation: float 6s ease-in-out infinite;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0.8;
        }
        
        .glitch-text::before {
          animation: glitch-color 3s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translate(-2px, 1px);
          color: var(--accent, #6366f1);
          z-index: -1;
        }
        
        .glitch-text::after {
          animation: glitch-color 4s infinite alternate-reverse;
          clip-path: polygon(0 80%, 100% 20%, 100% 100%, 0 100%);
          transform: translate(2px, -1px);
          color: var(--primary, #f97316);
          z-index: -2;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes glitch-color {
          0% { opacity: 0.8; transform: translate(-2px, 1px); }
          25% { opacity: 0.4; transform: translate(2px, -1px); }
          50% { opacity: 0.9; transform: translate(-1px, 2px); }
          75% { opacity: 0.3; transform: translate(1px, -2px); }
          100% { opacity: 0.8; transform: translate(-2px, 1px); }
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
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '500px',
  },
  errorContainer: {
    position: 'relative',
    marginBottom: '24px',
  },
  title: {
    fontSize: '120px',
    fontWeight: '900',
    margin: 0,
    lineHeight: '1',
    letterSpacing: '-0.04em',
    fontFamily: 'var(--font-heading)',
  },
  subtitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--textMain)',
    margin: '0 0 16px 0',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '-0.02em',
  },
  text: {
    fontSize: '16px',
    color: 'var(--textMuted)',
    marginBottom: '40px',
    lineHeight: '1.6',
    fontFamily: 'var(--font-body)',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    fontFamily: 'var(--font-body)',
  },
};
