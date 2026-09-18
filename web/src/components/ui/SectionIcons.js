import React from 'react';

/**
 * Clean, authentic, bespoke vector icons for digest sections.
 * Inspired by high-craft developer platforms (Designer Daily, Linear, Raycast).
 * Strictly NO 3D balloon emojis, NO neon glare, NO stock wireframes.
 */

export function FreshLinksIcon({ size = 22, color = "#ff5a12" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M9.5 14.5L14.5 9.5" 
        stroke={color} 
        strokeWidth="2.4" 
        strokeLinecap="round" 
      />
      <path 
        d="M13 7.5L14.7929 5.70711C16.355 4.14502 18.8876 4.14502 20.4497 5.70711C22.0118 7.2692 22.0118 9.80186 20.4497 11.364L18.6569 13.1569C17.0948 14.7189 14.5621 14.7189 13 13.1569" 
        stroke={color} 
        strokeWidth="2.4" 
        strokeLinecap="round" 
      />
      <path 
        d="M11 16.5L9.20711 18.2929C7.64502 19.855 5.11236 19.855 3.55027 18.2929C1.98818 16.7308 1.98818 14.1981 3.55027 12.636L5.34315 10.8431C6.90524 9.28105 9.4379 9.28105 11 10.8431" 
        stroke={color} 
        strokeWidth="2.4" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

export function AiToolsIcon({ size = 22, color = "#818cf8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Primary 4-point geometric intelligence spark */}
      <path
        d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z"
        fill={color}
      />
      {/* Companion accent spark */}
      <path
        d="M19 2C19 3.8 17.8 5 16 5C17.8 5 19 6.2 19 8C19 6.2 20.2 5 22 5C20.2 5 19 3.8 19 2Z"
        fill={color}
        fillOpacity="0.8"
      />
    </svg>
  );
}

export function FeaturedGemsIcon({ size = 22, color = "#a855f7" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top crown facets */}
      <polygon points="6,3 18,3 21.5,9 2.5,9" fill={color} fillOpacity="0.35" />
      <polygon points="6,3 9,9 15,9 18,3" fill={color} fillOpacity="0.75" />
      <polygon points="9,3 15,3 14,9 10,9" fill="#ffffff" fillOpacity="0.35" />
      {/* Lower pavilion facets */}
      <polygon points="2.5,9 12,21.5 21.5,9" fill={color} fillOpacity="0.5" />
      <polygon points="9,9 12,21.5 15,9" fill={color} fillOpacity="0.9" />
      {/* Facet structural cut lines */}
      <path
        d="M6 3L2.5 9L12 21.5L21.5 9L18 3H6ZM6 3L9 9L12 21.5L15 9L18 3M2.5 9H21.5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ProductHuntIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#DA552F" />
      <path
        d="M22.667 19.333H16.667V13.333H22.667C24.324 13.333 25.667 14.676 25.667 16.333C25.667 17.99 24.324 19.333 22.667 19.333ZM22.667 9.333H12.667V30.667H16.667V23.333H22.667C26.533 23.333 29.667 20.199 29.667 16.333C29.667 12.467 26.533 9.333 22.667 9.333Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function HackerNewsIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#FF6600" />
      <path 
        d="M9.5 8.5L14.7 18V24.5H17.3V18L22.5 8.5H19.6L16 15.6L12.4 8.5H9.5Z" 
        fill="#FFFFFF" 
      />
    </svg>
  );
}

export function GoodiesIcon({ size = 28 }) {
  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none'
      }}
      className="celebratory-goodies-icon"
    >
      <style>{`
        @keyframes festiveGiftFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-1.5px) rotate(-1.8deg);
          }
          75% {
            transform: translateY(1px) rotate(1.8deg);
          }
        }
        @keyframes festiveSparkleA {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.7) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.3) rotate(20deg);
          }
        }
        @keyframes festiveSparkleB {
          0%, 100% {
            opacity: 0.9;
            transform: scale(1.2) rotate(-15deg);
          }
          50% {
            opacity: 0.25;
            transform: scale(0.65) rotate(0deg);
          }
        }
        @keyframes festiveAuraPulse {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.1);
          }
        }
        .celebratory-gift-group {
          transform-origin: 18px 20px;
          animation: festiveGiftFloat 3.4s ease-in-out infinite;
        }
        .celebratory-sparkle-1 {
          transform-origin: 30.5px 5.5px;
          animation: festiveSparkleA 2.2s ease-in-out infinite;
        }
        .celebratory-sparkle-2 {
          transform-origin: 5.5px 7px;
          animation: festiveSparkleB 2.6s ease-in-out infinite 0.7s;
        }
        .celebratory-aura {
          transform-origin: 18px 18px;
          animation: festiveAuraPulse 3.4s ease-in-out infinite;
        }
      `}</style>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 36 36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ambient festive golden aura */}
          <radialGradient id="festiveAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* Glossy top lid facet */}
          <linearGradient id="lidTopGrad" x1="7" y1="3" x2="29" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff597b" />
            <stop offset="60%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>

          {/* Left box face */}
          <linearGradient id="bodyLeftGrad" x1="7" y1="10" x2="18" y2="29" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>

          {/* Right box face (rich shaded depth) */}
          <linearGradient id="bodyRightGrad" x1="18" y1="14" x2="29" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="60%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Left lid rim (lip) */}
          <linearGradient id="lidRimLeft" x1="7" y1="8" x2="18" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>

          {/* Right lid rim (lip) */}
          <linearGradient id="lidRimRight" x1="18" y1="12" x2="29" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#700d2b" />
          </linearGradient>

          {/* Shiny metallic gold ribbon */}
          <linearGradient id="ribbonGoldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="70%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Ribbon loop highlight */}
          <linearGradient id="bowGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Specular highlight */}
          <linearGradient id="specularShine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Ambient background celebratory glow */}
        <circle cx="18" cy="18" r="14" fill="url(#festiveAura)" className="celebratory-aura" />

        {/* Celebratory Floating Gift Group */}
        <g className="celebratory-gift-group">
          {/* Main Box Body Faces */}
          {/* Left face */}
          <polygon points="7.5,12 18,16.5 18,29 7.5,24.5" fill="url(#bodyLeftGrad)" />
          {/* Right face */}
          <polygon points="18,16.5 28.5,12 28.5,24.5 18,29" fill="url(#bodyRightGrad)" />

          {/* Vertical Ribbons on Body */}
          {/* Left face ribbon */}
          <polygon points="11.8,13.8 14.2,14.8 14.2,27.4 11.8,26.4" fill="url(#ribbonGoldGrad)" />
          {/* Right face ribbon */}
          <polygon points="21.8,14.8 24.2,13.8 24.2,26.4 21.8,27.4" fill="url(#ribbonGoldGrad)" />

          {/* Lid Overhang / Rim */}
          {/* Left rim */}
          <polygon points="6.5,9.5 18,14.2 18,16.2 6.5,11.5" fill="url(#lidRimLeft)" />
          {/* Right rim */}
          <polygon points="18,14.2 29.5,9.5 29.5,11.5 18,16.2" fill="url(#lidRimRight)" />

          {/* Top Lid Face */}
          <polygon points="18,4.8 29.5,9.5 18,14.2 6.5,9.5" fill="url(#lidTopGrad)" />

          {/* Lid Front Edge Specular Highlight */}
          <polyline points="6.5,9.5 18,14.2 29.5,9.5" stroke="url(#specularShine)" strokeWidth="0.8" strokeLinecap="round" />

          {/* Ribbons Across Top Lid */}
          <polygon points="11.2,6.7 13.6,5.7 24.8,12.3 22.4,13.3" fill="url(#ribbonGoldGrad)" />
          <polygon points="22.4,5.7 24.8,6.7 13.6,13.3 11.2,12.3" fill="url(#ribbonGoldGrad)" />

          {/* 3D Volumetric Bow Loops */}
          {/* Left bow loop */}
          <path 
            d="M18 9 C16 4 10 3 10.5 6 C11 8.5 15.5 8.5 18 9.2 Z" 
            fill="url(#bowGoldGrad)" 
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.25))"
          />
          <path 
            d="M16 6.8 C14 5.2 12 5.5 12.2 6.8 C12.5 8 15 7.8 16 6.8 Z" 
            fill="#a16207" 
            opacity="0.6"
          />

          {/* Right bow loop */}
          <path 
            d="M18 9 C20 4 26 3 25.5 6 C25 8.5 20.5 8.5 18 9.2 Z" 
            fill="url(#bowGoldGrad)" 
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.25))"
          />
          <path 
            d="M20 6.8 C22 5.2 24 5.5 23.8 6.8 C23.5 8 21 7.8 20 6.8 Z" 
            fill="#a16207" 
            opacity="0.6"
          />

          {/* Ribbon Tails */}
          <path 
            d="M17 9.5 C15 11 13.5 12.5 12 14.5 C13 14.2 15 13 17.5 10.5 Z" 
            fill="url(#ribbonGoldGrad)" 
          />
          <path 
            d="M19 9.5 C21 11 22.5 12.5 24 14.5 C23 14.2 21 13 18.5 10.5 Z" 
            fill="url(#ribbonGoldGrad)" 
          />

          {/* Center Bow Knot */}
          <ellipse cx="18" cy="9.2" rx="2.5" ry="2" fill="url(#ribbonGoldGrad)" />
          <ellipse cx="18" cy="8.6" rx="1.4" ry="0.9" fill="#ffffff" opacity="0.65" />
        </g>

        {/* Celebratory Sparkle Star 1 (Top-Right) */}
        <g className="celebratory-sparkle-1">
          <path 
            d="M30.5 2.5 C30.5 4.5 31.5 5.5 33.5 5.5 C31.5 5.5 30.5 6.5 30.5 8.5 C30.5 6.5 29.5 5.5 27.5 5.5 C29.5 5.5 30.5 4.5 30.5 2.5 Z" 
            fill="#facc15" 
          />
          <circle cx="30.5" cy="5.5" r="0.8" fill="#ffffff" />
        </g>

        {/* Celebratory Sparkle Star 2 (Top-Left) */}
        <g className="celebratory-sparkle-2">
          <path 
            d="M5.5 4 C5.5 5.5 6.3 6.5 7.8 6.5 C6.3 6.5 5.5 7.5 5.5 9 C5.5 7.5 4.7 6.5 3.2 6.5 C4.7 6.5 5.5 5.5 5.5 4 Z" 
            fill="#fbbf24" 
          />
          <circle cx="5.5" cy="6.5" r="0.6" fill="#ffffff" />
        </g>

        {/* Mini Twinkle (Bottom Right) */}
        <circle cx="31.5" cy="23" r="1.1" fill="#fde047" opacity="0.75" />
      </svg>
    </div>
  );
}


