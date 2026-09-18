"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [toggleStyle, setToggleStyle] = useState('classic');

  useEffect(() => {
    // 1. Check query param or localStorage on mount for theme
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const queryTheme = params?.get('theme');
    const savedTheme = (queryTheme === 'light' || queryTheme === 'dark')
      ? queryTheme
      : localStorage.getItem('builder_daily_theme');

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // 2. Check localStorage for toggleStyle
    const savedToggleStyle = localStorage.getItem('builder_daily_toggle_style');
    if (savedToggleStyle) {
      setToggleStyle(savedToggleStyle);
    }

    // 3. Listen for live style changes dispatched from admin or other components
    const handleStyleChange = (e) => {
      if (e?.detail) {
        setToggleStyle(e.detail);
      }
    };
    const handleStorage = (e) => {
      if (e.key === 'builder_daily_toggle_style' && e.newValue) {
        setToggleStyle(e.newValue);
      }
    };
    window.addEventListener('builder_toggle_style_change', handleStyleChange);
    window.addEventListener('storage', handleStorage);

    // 4. Fetch latest from database
    const fetchGlobalToggleStyle = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'theme_toggle_style')
        .single();
      if (!error && data?.value) {
        setToggleStyle(data.value);
        localStorage.setItem('builder_daily_toggle_style', data.value);
      }
    };
    fetchGlobalToggleStyle();

    return () => {
      window.removeEventListener('builder_toggle_style_change', handleStyleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('builder_daily_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, toggleStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
