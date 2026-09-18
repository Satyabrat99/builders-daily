/**
 * In-memory sliding-window rate limiter.
 * Zero external infrastructure required.
 * Protects public endpoints from bot floods, email quota exhaustion, and SSRF spam.
 */

// Key format: `${prefix}:${ip}` -> { count: number, resetAt: number }
const ipStore = new Map();

// Periodic garbage collection: Clean up expired rate limit buckets every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipStore.entries()) {
      if (now > record.resetAt) {
        ipStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Extract client IP from incoming Next.js Request
 */
export function getClientIp(request) {
  if (!request) return '127.0.0.1';
  
  // Try common proxy headers in priority order
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return request.ip || '127.0.0.1';
}

/**
 * Check if a request exceeds rate limits.
 * 
 * @param {Request} request 
 * @param {Object} options
 * @param {string} options.prefix - Unique identifier for the endpoint (e.g. 'subscribe', 'og-image')
 * @param {number} options.limit - Max allowed requests within windowMs
 * @param {number} options.windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(request, { prefix = 'default', limit = 10, windowMs = 60 * 1000 }) {
  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = ipStore.get(key);

  if (!record || now > record.resetAt) {
    // New or expired window
    const newRecord = { count: 1, resetAt: now + windowMs };
    ipStore.set(key, newRecord);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: newRecord.resetAt
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetAt: record.resetAt
  };
}

/**
 * Helper to generate a standardized HTTP 429 Too Many Requests response
 */
export function rateLimitExceededResponse(resetAt) {
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Too many requests. Please slow down and try again shortly.',
      retryAfterSeconds
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds)
      }
    }
  );
}
