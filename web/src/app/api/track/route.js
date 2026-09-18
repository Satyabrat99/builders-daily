import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
  try {
    // Rate limit: Max 60 analytics events per minute per IP
    const rateCheck = checkRateLimit(request, {
      prefix: 'track',
      limit: 60,
      windowMs: 60 * 1000
    });
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(rateCheck.resetAt);
    }

    const { event_name, user_id, metadata } = await request.json();
    
    if (!event_name) {
      return NextResponse.json({ error: 'event_name is required' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
    }

    // Initialize with service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const key = `event_${timestamp}_${randomSuffix}`;
    const value = JSON.stringify({
      event_name,
      user_id: user_id || null,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    });

    const { error } = await supabase
      .from('site_settings')
      .insert({ key, value });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, key });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
