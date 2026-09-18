import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'admin@test.com';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseServer = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
  : null;

/**
 * Validates whether an incoming Next.js Request has valid admin privileges.
 * 
 * Supports:
 * 1. Bearer token in Authorization header verified via Supabase Auth (user.email === ADMIN_EMAIL)
 * 2. Secret header (x-admin-secret) matching SUPABASE_SERVICE_ROLE_KEY or ADMIN_SECRET_KEY
 * 
 * @param {Request} request 
 * @returns {Promise<{ authorized: boolean, error?: string, user?: object }>}
 */
export async function verifyAdminRequest(request) {
  try {
    // 1. Direct Secret Check (CLI scripts or automated tasks)
    const adminSecret = request.headers.get('x-admin-secret');
    const expectedSecret = process.env.ADMIN_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (adminSecret && expectedSecret && adminSecret === expectedSecret) {
      return { authorized: true, user: { email: ADMIN_EMAIL, role: 'admin_secret' } };
    }

    // 2. Authorization Bearer Token Check (Supabase Auth)
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.toLowerCase().startsWith('bearer ') && supabaseServer) {
      const token = authHeader.substring(7).trim();
      if (token) {
        const { data: { user }, error } = await supabaseServer.auth.getUser(token);
        if (!error && user && user.email === ADMIN_EMAIL) {
          return { authorized: true, user };
        }
      }
    }

    return {
      authorized: false,
      error: 'Unauthorized: Admin authentication required to perform this action.'
    };
  } catch (err) {
    console.error('[ADMIN_AUTH_EXCEPTION]', err);
    return {
      authorized: false,
      error: 'Authentication failed due to an internal error.'
    };
  }
}
