import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Rate limit: Max 30 OG scraper requests per minute per IP
  const rateCheck = checkRateLimit(request, {
    prefix: 'og-image',
    limit: 30,
    windowMs: 60 * 1000
  });
  if (!rateCheck.allowed) {
    return rateLimitExceededResponse(rateCheck.resetAt);
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  const trimmed = targetUrl.trim();

  // Validate URL and enforce SSRF protections
  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: 'Only HTTP and HTTPS protocols are permitted' }, { status: 400 });
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isDisallowedHost = 
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '169.254.169.254' ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

  if (isDisallowedHost) {
    return NextResponse.json(
      { error: 'Access to private or local network hosts is forbidden' },
      { status: 403 }
    );
  }

  // 1. GitHub Repositories: GitHub provides official OpenGraph social cards
  const githubMatch = trimmed.match(/^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/\?#]+)/i);
  if (githubMatch && githubMatch[1] && githubMatch[2]) {
    const owner = githubMatch[1];
    const repo = githubMatch[2].replace(/\.git$/i, '');
    const ghOgUrl = `https://opengraph.githubassets.com/1/${owner}/${repo}`;
    return NextResponse.redirect(ghOgUrl, 307);
  }

  // 2. Fetch live HTML and extract og:image or twitter:image
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(trimmed, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      const match = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i);

      if (match && match[1]) {
        let ogImg = match[1].replace(/&amp;/g, '&');
        if (!ogImg.startsWith('http')) {
          try {
            ogImg = new URL(ogImg, trimmed).href;
          } catch (e) {}
        }
        return NextResponse.redirect(ogImg, 307);
      }
    }
  } catch (err) {
    // Network or abort error
  }

  // 3. Fallback to domain screenshot / microlink OG if no meta tag found
  const microlinkFallback = `https://api.microlink.io/?url=${encodeURIComponent(trimmed)}&screenshot=true&meta=false&embed=screenshot.url`;
  return NextResponse.redirect(microlinkFallback, 307);
}
