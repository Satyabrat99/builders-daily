"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const SiteSettingsContext = createContext({
  settings: {},
  getSetting: (key, defaultValue = null) => defaultValue,
  loading: false,
  refreshSettings: async () => {},
});

const CACHE_KEY = 'builder_daily_site_settings';

export function SiteSettingsProvider({ children }) {
  // Synchronously initialize settings from localStorage for 0ms initial render
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn("Failed to parse cached site settings:", e);
      }
    }
    return {};
  });

  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (!error && data) {
        const mapped = {};
        for (const item of data) {
          mapped[item.key] = item.value;
        }
        setSettings(mapped);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
        } catch (e) {
          console.warn("Failed to write site settings cache:", e);
        }
      }
    } catch (err) {
      console.error("Error fetching site settings in batch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Single batch fetch in the background on mount
    fetchSettings();

    // Listen for cross-tab or admin storage updates
    const handleStorage = (e) => {
      if (e.key === CACHE_KEY && e.newValue) {
        try {
          setSettings(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [fetchSettings]);

  const getSetting = useCallback((key, defaultValue = null) => {
    if (settings && Object.prototype.hasOwnProperty.call(settings, key)) {
      return settings[key];
    }
    return defaultValue;
  }, [settings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, getSetting, loading, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
