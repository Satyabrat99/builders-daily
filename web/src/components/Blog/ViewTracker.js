"use client";
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

import { trackEvent } from '@/lib/analytics';

export default function ViewTracker({ slug }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !slug) return;
    tracked.current = true;

    const trackView = async () => {
      // Call the Supabase RPC to increment the views safely
      const { error } = await supabase.rpc('increment_blog_view', { blog_slug: slug });
      trackEvent('view_blog_post', { slug });
      if (error) {
        console.warn('Failed to increment view:', error);
      }
    };

    trackView();
  }, [slug]);

  return null; // Invisible tracking component
}
