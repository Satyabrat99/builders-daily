"use client";
import { useState, useEffect } from 'react';
import { theme } from '@/theme';

import { useSiteSettings } from '@/context/SiteSettingsContext';

const DEFAULT_FONTS = [
  'Space Grotesk',
  'JetBrains Mono',
  'Playfair Display',
  'Bebas Neue',
  'Caveat',
  'Oswald'
];

const TEXT_LINE_1 = "Builders";
const TEXT_LINE_2 = "Daily";

const TYPING_SPEED = 150;
const ERASING_SPEED = 50;
const PAUSE_END = 10000;
const PAUSE_START = 500;

export default function DynamicHeading() {
  const { getSetting } = useSiteSettings();
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [fontIndex, setFontIndex] = useState(0);
  const [activeFonts, setActiveFonts] = useState(DEFAULT_FONTS);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  // Phase: 0 = typing line 1, 1 = typing line 2, 2 = paused, 3 = erasing line 2, 4 = erasing line 1, 5 = paused start
  const [phase, setPhase] = useState(5); 

  // Read fonts from site settings
  useEffect(() => {
    const val = getSetting('hero_fonts');
    if (val) {
      try {
        const parsed = typeof val === 'string' ? JSON.parse(val) : val;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveFonts(parsed);
        }
      } catch (e) {}
    }
  }, [getSetting]);

  // Dynamically inject Google Fonts link
  useEffect(() => {
    if (activeFonts.length > 0) {
      const families = activeFonts.map(f => `family=${f.replace(/ /g, '+')}`).join('&');
      const url = `https://fonts.googleapis.com/css2?${families}&display=swap`;
      
      const existing = document.getElementById('dynamic-hero-fonts');
      if (existing) {
        if (existing.getAttribute('href') === url) {
          setFontsLoaded(true);
          return;
        }
        existing.remove();
      }

      const link = document.createElement('link');
      link.id = 'dynamic-hero-fonts';
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
      setFontsLoaded(true);
    }
  }, [activeFonts]);

  useEffect(() => {
    let timeout;

    if (phase === 5) {
      // Paused at the very start before typing
      timeout = setTimeout(() => {
        setPhase(0);
      }, PAUSE_START);
    } 
    else if (phase === 0) {
      // Typing Line 1
      if (text1.length < TEXT_LINE_1.length) {
        timeout = setTimeout(() => {
          setText1(TEXT_LINE_1.slice(0, text1.length + 1));
        }, TYPING_SPEED);
      } else {
        setPhase(1);
      }
    } 
    else if (phase === 1) {
      // Typing Line 2
      if (text2.length < TEXT_LINE_2.length) {
        timeout = setTimeout(() => {
          setText2(TEXT_LINE_2.slice(0, text2.length + 1));
        }, TYPING_SPEED);
      } else {
        setPhase(2);
      }
    } 
    else if (phase === 2) {
      // Paused at the end
      timeout = setTimeout(() => {
        setPhase(3);
      }, PAUSE_END);
    } 
    else if (phase === 3) {
      // Erasing Line 2
      if (text2.length > 0) {
        timeout = setTimeout(() => {
          setText2(TEXT_LINE_2.slice(0, text2.length - 1));
        }, ERASING_SPEED);
      } else {
        setPhase(4);
      }
    } 
    else if (phase === 4) {
      // Erasing Line 1
      if (text1.length > 0) {
        timeout = setTimeout(() => {
          setText1(TEXT_LINE_1.slice(0, text1.length - 1));
        }, ERASING_SPEED);
      } else {
        // Switch font and go back to pause start
        setFontIndex((prev) => (prev + 1) % activeFonts.length);
        setPhase(5);
      }
    }

    return () => clearTimeout(timeout);
  }, [text1, text2, phase]);

  // Determine where the cursor should be
  const showCursorLine1 = phase === 0 || (phase === 4 && text1.length > 0) || (phase === 5 && text1.length === 0);
  const showCursorLine2 = phase === 1 || phase === 2 || phase === 3 || (phase === 4 && text1.length === TEXT_LINE_1.length && text2.length === 0);

  return (
    <div style={styles.container}>
      <h1 style={{ ...styles.title, fontFamily: `"${activeFonts[fontIndex]}", sans-serif` }}>
        {text1}
        <span style={{ color: theme.colors.primary, visibility: showCursorLine1 ? 'visible' : 'hidden', animation: 'blink 1s step-end infinite' }}>_</span>
      </h1>
      <h1 style={{ ...styles.title, fontFamily: `"${activeFonts[fontIndex]}", sans-serif` }}>
        {text2}
        <span style={{ color: theme.colors.primary, visibility: showCursorLine2 ? 'visible' : 'hidden', animation: 'blink 1s step-end infinite' }}>_</span>
      </h1>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}} />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '0.9',
    minHeight: 'var(--hero-container-min-height, 210px)',
  },
  title: {
    fontSize: 'var(--hero-title-font-size, 110px)',
    fontWeight: '700',
    color: theme.colors.textMain,
    margin: 0,
    padding: 0,
    letterSpacing: '-2px',
    display: 'flex',
    alignItems: 'center',
    transition: 'font-family 0.3s ease',
  }
};
