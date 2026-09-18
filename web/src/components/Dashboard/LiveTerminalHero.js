"use client";
import React, { useState, useEffect, useRef } from 'react';
import { theme } from '@/theme';

const LOG_MESSAGES = [
  { text: "❯ Initializing AI Builder Daily Pipeline...", color: '#94a3b8' },
  { text: "❯ Connecting to Supabase cluster...", color: '#94a3b8' },
  { text: "✔ Authentication successful.", color: '#f97316' },
  { text: "❯ Fetching HuggingFace Trending Models...", color: '#38bdf8' },
  { text: "✔ Received 12 fresh models.", color: '#f97316' },
  { text: "❯ Scraping GitHub Trending (since=daily)...", color: '#38bdf8' },
  { text: "⟳ Scanning for 'AI', 'LLM', 'GPT' keywords...", color: '#a78bfa' },
  { text: "✔ Filtered 6 relevant repositories.", color: '#f97316' },
  { text: "❯ Querying ArXiv research database...", color: '#38bdf8' },
  { text: "✔ 4 new papers found today.", color: '#f97316' },
  { text: "❯ Aggregating Reddit Pulse (r/MachineLearning)...", color: '#38bdf8' },
  { text: "✔ Sync complete.", color: '#f97316' },
  { text: "⚡ Launching NVIDIA NIM (Llama-3.3-70B)...", color: '#fcd34d' },
  { text: "⟳ Generating curated daily report...", color: '#a78bfa' },
  { text: "★ Report published to dashboard.", color: '#f97316' },
  { text: "❯ Standing by for next cycle...", color: '#475569' },
];

export default function LiveTerminalHero() {
  const [lines, setLines] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (currentIndex < LOG_MESSAGES.length) {
      const timeout = setTimeout(() => {
        setLines(prev => [...prev, LOG_MESSAGES[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, Math.random() * 800 + 400);
      return () => clearTimeout(timeout);
    } else {
      const restartTimeout = setTimeout(() => {
        setLines([]);
        setCurrentIndex(0);
      }, 5000);
      return () => clearTimeout(restartTimeout);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleMouseMove = (e) => {
    if (!terminalRef.current) return;
    const rect = terminalRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    terminalRef.current.style.setProperty('--x', `${x}px`);
    terminalRef.current.style.setProperty('--y', `${y}px`);
  };

  return (
    <div 
      style={styles.terminal} 
      ref={terminalRef}
      onMouseMove={handleMouseMove}
      className="terminal-window"
    >
      <div style={styles.spotlight}></div>
      <div className="grainy-overlay" />
      
      {/* Window Header */}
      <div style={styles.header}>
        <div style={styles.controls}>
          <div style={{...styles.dot, backgroundColor: '#ff5f57'}}></div>
          <div style={{...styles.dot, backgroundColor: '#febc2e'}}></div>
          <div style={{...styles.dot, backgroundColor: '#28c840'}}></div>
        </div>
        <div style={styles.headerTitle}>bash — ai-pipeline</div>
      </div>

      {/* Terminal Content */}
      <div style={styles.body} ref={scrollRef} className="terminal-body">
        {lines.map((line, i) => (
          <div key={i} style={styles.lineWrapper}>
            <span style={{...styles.lineText, color: line.color}}>{line.text}</span>
          </div>
        ))}
        {currentIndex < LOG_MESSAGES.length && (
          <div style={styles.activeLine}>
            <span style={styles.blinkingCursor}></span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .terminal-window {
          position: relative;
          overflow: hidden;
        }
        .grainy-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
          z-index: 1;
        }
        .terminal-body {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .terminal-body::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .terminal-window {
          position: relative;
          overflow: hidden;
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  terminal: {
    width: '85%',
    height: '300px',
    marginTop: '40px',
    background: 'radial-gradient(circle at 0% 0%, rgba(249, 115, 22, 0.12) 0%, transparent 50%) padding-box, radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.06) 0%, transparent 50%) padding-box, linear-gradient(145deg, rgba(24, 24, 27, 0.4) 0%, rgba(9, 9, 11, 0.6) 100%) padding-box, linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.1) 100%) border-box',
    backgroundColor: 'rgba(9, 9, 11, 0.24)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '24px',
    border: '1px solid transparent',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    pointerEvents: 'auto',
    position: 'relative',
    margin: '40px auto 0',
  },
  spotlight: {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(400px circle at var(--x) var(--y), rgba(255,255,255,0.06), transparent 100%)`,
    pointerEvents: 'none',
    zIndex: 1,
  },
  header: {
    padding: '14px 20px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  controls: {
    display: 'flex',
    gap: '8px',
    position: 'absolute',
    left: '20px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    color: '#a1a1aa',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  body: {
    padding: '24px',
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 2,
    scrollBehavior: 'smooth',
  },
  lineWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  lineText: {
    fontSize: '13.5px',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap',
    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))',
    fontWeight: '400',
    letterSpacing: '0.02em',
  },
  activeLine: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px',
  },
  blinkingCursor: {
    animation: 'blink 1s step-end infinite',
    display: 'inline-block',
    width: '8px',
    height: '16px',
    backgroundColor: '#e4e4e7',
    boxShadow: '0 0 8px #e4e4e7',
    marginLeft: '2px',
  },
};
