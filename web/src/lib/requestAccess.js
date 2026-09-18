import { supabase } from './supabase';

export async function requestWriterAccess(userId) {
  if (!userId) return { error: 'User is not logged in.' };

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'blog_access_requests')
      .single();

    let currentRequests = [];
    if (!error && data) {
      try {
        currentRequests = JSON.parse(data.value || '[]');
      } catch (parseErr) {
        console.error("Error parsing requests JSON:", parseErr);
      }
    }

    if (currentRequests.includes(userId)) {
      return { success: true, alreadyRequested: true };
    }

    const newRequests = [...currentRequests, userId];

    const { error: upsertErr } = await supabase
      .from('site_settings')
      .upsert({
        key: 'blog_access_requests',
        value: JSON.stringify(newRequests),
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (upsertErr) {
      return { error: upsertErr.message };
    }

    return { success: true, alreadyRequested: false };
  } catch (err) {
    console.error("Error in requestWriterAccess:", err);
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function checkRequestStatus(userId) {
  if (!userId) return false;
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'blog_access_requests')
      .single();
    if (!error && data) {
      const currentRequests = JSON.parse(data.value || '[]');
      return currentRequests.includes(userId);
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}
