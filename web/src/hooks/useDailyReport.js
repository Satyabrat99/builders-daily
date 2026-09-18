"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const CACHE_KEY = 'builder_daily_report_cache';
const TS_KEY = 'builder_daily_report_ts';

export function useDailyReport(user, authLoading) {
  // 1. Synchronously initialize from localStorage for 0ms initial render
  const [report, setReport] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn("Cache read failed:", e);
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) return false;
      } catch (e) {}
    }
    return true;
  });

  const fetchLatestReport = useCallback(async () => {
    let cachedReport = null;
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        cachedReport = JSON.parse(stored);
      }
    } catch (e) {}

    // Only set loading to true if we have no cached data to display
    if (!cachedReport) {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('status', 'published')
        .order('report_date', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const newReport = data[0];
        
        const isNewer = !cachedReport || 
                        newReport.report_date !== cachedReport.report_date || 
                        new Date(newReport.updated_at) > new Date(cachedReport.updated_at);

        if (isNewer) {
          const { count } = await supabase
            .from('daily_reports')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published')
            .lte('report_date', newReport.report_date);
            
          newReport.issueNumber = count || 1;

          setReport(newReport);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(newReport));
            localStorage.setItem(TS_KEY, Date.now().toString());
          } catch (e) {
            console.warn("Cache write failed:", e);
          }
        } else if (cachedReport) {
          setReport(cachedReport);
        }
      }
    } catch (err) {
      console.error("fetchLatestReport failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Start fetching immediately without waiting for auth session check
    fetchLatestReport();
  }, [fetchLatestReport]);

  return { report, loading, refresh: fetchLatestReport };
}

