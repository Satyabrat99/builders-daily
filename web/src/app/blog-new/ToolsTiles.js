'use client';

import { Antigravity, Codex, ClaudeCode, Vercel } from '@lobehub/icons';
import styles from './page.module.css';

function NextjsIcon({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="mask0" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
        <circle cx="90" cy="90" r="90" fill="black"/>
      </mask>
      <g mask="url(#mask0)">
        <circle cx="90" cy="90" r="90" fill="black"/>
        <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0)"/>
        <rect x="115" y="54" width="12" height="72" fill="url(#paint1)"/>
      </g>
      <defs>
        <linearGradient id="paint0" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="paint1" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function ModalIcon({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="56" fill="#1E1E1E"/>
      <text x="128" y="158" textAnchor="middle" fill="white" fontFamily="system-ui, -apple-system, sans-serif" fontSize="110" fontWeight="700" letterSpacing="-4">M</text>
    </svg>
  );
}

const tools = [
  { name: 'Antigravity', ColorIcon: Antigravity.Color, MonoIcon: Antigravity, brandColor: '#FF6B00' },
  { name: 'Next.js', isNextjs: true },
  { name: 'Codex', ColorIcon: Codex.Color, MonoIcon: Codex, brandColor: '#000' },
  { name: 'Vercel', MonoIcon: Vercel, brandColor: '#000' },
  { name: 'Claude Code', ColorIcon: ClaudeCode.Color, MonoIcon: ClaudeCode, brandColor: '#D97757' },
  { name: 'Modal', isModal: true },
];

export default function ToolsTiles() {
  return (
    <div className={styles.toolsTiles}>
      {tools.map((tool) => (
        <div className={styles.toolsTile} key={tool.name} aria-label={tool.name}>
          <div className={styles.toolsTileIcon}>
            {tool.isNextjs && <NextjsIcon size={36} />}
            {tool.isModal && <ModalIcon size={36} />}
            {!tool.isNextjs && !tool.isModal && tool.ColorIcon && <tool.ColorIcon size={36} />}
            {!tool.isNextjs && !tool.isModal && !tool.ColorIcon && tool.MonoIcon && (
              <tool.MonoIcon size={36} style={{ color: tool.brandColor }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
