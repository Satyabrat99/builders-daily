import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail, syncResendContact } from '@/lib/email';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseServer = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
  : null;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request) {
  try {
    // Rate limit: Max 5 subscription requests per 10 minutes per IP
    const rateCheck = checkRateLimit(request, {
      prefix: 'subscribe',
      limit: 5,
      windowMs: 10 * 60 * 1000
    });
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(rateCheck.resetAt);
    }

    const body = await request.json().catch(() => ({}));
    const { 
      email: rawEmail, 
      name = '', 
      type = 'newsletter', 
      source = 'website', 
      metadata = {},
      _gotcha // Bot honeypot
    } = body;

    // 1. Bot Honeypot: If hidden field is filled, silently succeed
    if (_gotcha) {
      return NextResponse.json({ success: true, message: 'Subscribed successfully' });
    }

    // 2. Validate email
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const validTypes = ['newsletter', 'waitlist', 'both'];
    const subscriberType = validTypes.includes(type) ? type : 'newsletter';
    const isWaitlist = subscriberType === 'waitlist';

    let referralCode = '';
    if (isWaitlist) {
      referralCode = `bd_${Math.random().toString(36).substring(2, 8)}`;
    }

    // 3. Persist in Supabase if configured
    let dbSuccess = false;
    let isNewSubscriber = true;

    if (supabaseServer) {
      try {
        // Check if already subscribed
        const { data: existing, error: fetchErr } = await supabaseServer
          .from('subscribers')
          .select('id, status, type, referral_code')
          .eq('email', email)
          .maybeSingle();

        if (fetchErr) {
          console.warn('[SUBSCRIBE_DB_FETCH_WARN]', fetchErr.message);
        }

        if (existing) {
          isNewSubscriber = false;
          referralCode = existing.referral_code || referralCode;

          // Reactivate if unsubscribed or update type if needed
          if (existing.status !== 'active' || (existing.type !== subscriberType && existing.type !== 'both')) {
            const updatedType = existing.type !== subscriberType ? 'both' : existing.type;
            await supabaseServer
              .from('subscribers')
              .update({ 
                status: 'active', 
                type: updatedType,
                updated_at: new Date().toISOString() 
              })
              .eq('id', existing.id);
          }
          dbSuccess = true;
        } else {
          // Insert fresh subscriber
          const { error: insertErr } = await supabaseServer
            .from('subscribers')
            .insert({
              email,
              name: name || null,
              type: subscriberType,
              status: 'active',
              source,
              referral_code: referralCode || null,
              metadata: { ...metadata, userAgent: request.headers.get('user-agent') || '' },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertErr) {
            console.warn('[SUBSCRIBE_DB_INSERT_WARN]', insertErr.message);
          } else {
            dbSuccess = true;
          }
        }
      } catch (dbErr) {
        console.warn('[SUBSCRIBE_DB_EXCEPTION]', dbErr.message);
      }
    } else {
      console.info('[SUBSCRIBE_DB_SKIPPED] Supabase credentials not found in environment');
    }

    // 4. Send Welcome or Confirmation Email via Resend
    // (Only send welcome email for brand new signups to avoid spamming existing subscribers)
    let emailResult = { success: true };
    if (isNewSubscriber) {
      emailResult = await sendWelcomeEmail({
        email,
        name,
        type: subscriberType,
        referralCode
      });

      // Async sync to audience without blocking
      syncResendContact({ email, name, type: subscriberType }).catch(() => {});
    }

    const successMessage = isWaitlist
      ? "You're on the waitlist! Keep an eye on your inbox for your access pass."
      : isNewSubscriber
        ? "Welcome aboard! We've sent a welcome dispatch to your inbox."
        : "You're already subscribed to updates!";

    return NextResponse.json({
      success: true,
      isNewSubscriber,
      dbSaved: dbSuccess,
      emailSent: emailResult.success,
      referralCode: referralCode || undefined,
      message: successMessage
    });
  } catch (error) {
    console.error('[SUBSCRIBE_ROUTE_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing subscription' },
      { status: 500 }
    );
  }
}
