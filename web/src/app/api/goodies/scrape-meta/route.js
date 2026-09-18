import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    const trimmedUrl = url.trim();

    // 1. Detect platform from URL structure
    let platform = 'tool';
    const lowerUrl = trimmedUrl.toLowerCase();
    if (lowerUrl.includes('docs.google.com/spreadsheets')) platform = 'sheets';
    else if (lowerUrl.includes('notion.so') || lowerUrl.includes('notion.site')) platform = 'notion';
    else if (lowerUrl.includes('figma.com')) platform = 'figma';
    else if (lowerUrl.includes('cursorrules') || lowerUrl.includes('.mdc') || lowerUrl.includes('cursor.directory')) platform = 'cursorrules';
    else if (lowerUrl.includes('github.com') || lowerUrl.includes('gist.github.com')) platform = 'code';

    // 2. Default metadata
    let title = '';
    let description = '';
    let image = '';
    let author = '';

    // Check for GitHub repository pattern
    const githubMatch = trimmedUrl.match(/^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/\?#]+)/i);
    if (githubMatch && githubMatch[1] && githubMatch[2]) {
      platform = 'code';
      const owner = githubMatch[1];
      const repo = githubMatch[2].replace(/\.git$/i, '');
      image = `https://opengraph.githubassets.com/1/${owner}/${repo}`;
      author = owner;
      title = `${owner}/${repo}`;
    }

    // If Twitter/X URL, use free Twitter oEmbed
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
      try {
        const oembedRes = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(trimmedUrl)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (oembedRes.ok) {
          const tweetData = await oembedRes.json();
          author = tweetData.author_name || '';
          title = tweetData.html ? tweetData.html.replace(/<[^>]*>?/gm, '').slice(0, 80) : 'Shared Resource from X';
        }
      } catch (e) {
        console.warn('Twitter oEmbed failed:', e);
      }
    }

    // Otherwise fetch HTML and parse OpenGraph tags
    if (!image || !title || !description) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const res = await fetch(trimmedUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const html = await res.text();

          // Match og:title or <title>
          const ogTitleMatch = html.match(/<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:title["']/i);
          const titleTagMatch = html.match(/<title>(.*?)<\/title>/i);
          if (!title) {
            title = ogTitleMatch ? ogTitleMatch[1] : (titleTagMatch ? titleTagMatch[1] : '');
          }

          // Match og:description or meta description
          const ogDescMatch = html.match(/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:description|description)["']/i);
          if (!description) {
            description = ogDescMatch ? ogDescMatch[1] : '';
          }

          // Match og:image or twitter:image
          if (!image) {
            const ogImageMatch = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)
              || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
            image = ogImageMatch ? ogImageMatch[1] : '';
          }

          // Clean up HTML entities
          if (title) title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          if (description) description = description.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          if (image) image = image.replace(/&amp;/g, '&');
        }
      } catch (fetchErr) {
        console.warn('Scraping HTML failed:', fetchErr.message);
      }
    }

    // Resolve relative image URLs
    if (image && !image.startsWith('http')) {
      try {
        image = new URL(image, trimmedUrl).href;
      } catch (e) {}
    }

    // Fallback to real OG endpoint
    if (!image) {
      image = `/api/og-image?url=${encodeURIComponent(trimmedUrl)}`;
    }

    // Clean up title
    if (!title) {
      try {
        const parsed = new URL(trimmedUrl);
        title = parsed.pathname.split('/').filter(Boolean).pop() || parsed.hostname;
        title = title.replace(/[-_]/g, ' ');
      } catch {
        title = 'Curated Builder Resource';
      }
    }

    // Auto-suggest category based on keywords
    let suggestedCategory = 'SaaS Builders';
    const textCorpus = `${title} ${description} ${lowerUrl}`.toLowerCase();
    if (textCorpus.includes('cursor') || textCorpus.includes('prompt') || textCorpus.includes('vibe') || textCorpus.includes('tailwind') || textCorpus.includes('shader') || textCorpus.includes('component')) {
      suggestedCategory = 'Vibecoders';
    } else if (textCorpus.includes('investor') || textCorpus.includes('angel') || textCorpus.includes('pitch') || textCorpus.includes('deck') || textCorpus.includes('fundrais') || textCorpus.includes('cap table') || textCorpus.includes('safe')) {
      suggestedCategory = 'Series Founders';
    }

    return NextResponse.json({
      title: title.slice(0, 100),
      description: description.slice(0, 220),
      thumbnail_url: image,
      image: image,
      resource_url: trimmedUrl,
      platform,
      category: suggestedCategory,
      author_name: author || 'Community Curator'
    });
  } catch (err) {
    console.error('Error in /api/goodies/scrape-meta:', err);
    return NextResponse.json({ error: 'Failed to extract metadata' }, { status: 500 });
  }
}
