// Client-side analytics tracker

export async function trackEvent(eventName, metadata = {}) {
  if (typeof window === 'undefined') return;

  try {
    // Read cached user session from localStorage or dynamically fetch
    let userId = null;
    try {
      const authSessionRaw = window.localStorage.getItem('sb-gbjobycsmklevpmzrueq-auth-token');
      if (authSessionRaw) {
        const parsed = JSON.parse(authSessionRaw);
        userId = parsed?.user?.id || null;
      }
    } catch (e) {}

    const payload = {
      event_name: eventName,
      user_id: userId,
      metadata: {
        url: window.location.href,
        referrer: document.referrer || 'direct',
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };

    // Use navigator.sendBeacon if available for non-blocking background submission
    if (typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/track', blob);
    } else {
      // Fallback to fetch
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Failed to send tracking event:', err);
  }
}
