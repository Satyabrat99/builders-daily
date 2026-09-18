"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useDailyReport(user, authLoading) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isPreview = typeof window !== 'undefined' && window.location.search.includes('preview');
    if (!authLoading && (user || isPreview)) {
      fetchLatestReport();
    }
  }, [user, authLoading]);

  const fetchLatestReport = async () => {
    const CACHE_KEY = 'builder_daily_report_cache';
    const TS_KEY = 'builder_daily_report_ts';

    // 1. Try to load from cache first for instant UI
    let cachedReport = null;
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      const storedTs = localStorage.getItem(TS_KEY);
      const now = Date.now();

      if (stored) {
        cachedReport = JSON.parse(stored);
        setReport(cachedReport);
      }
    } catch (e) {
      console.warn("Cache read failed:", e);
    }

    // 2. Background Revalidation (or Initial Load)
    if (!cachedReport) setLoading(true);

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
        }
      }
    } catch (err) {
      console.error("fetchLatestReport failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return { report, loading, refresh: fetchLatestReport };
}
