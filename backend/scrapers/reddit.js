import process from 'process';
import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import { supabase } from '../utils/db.js';
import { fetchWithRetry, DEFAULT_USER_AGENT, sleep } from '../utils/http.js';

export const DEFAULT_SUBREDDITS = [
  'LocalLLaMA',
  'hermesagent',
  'OpenAI',
  'vibecoding',
  'MachineLearning'
];

const AI_KEYWORDS = [
  'ai', 'llm', 'gpt', 'claude', 'gemini', 'agent', 'model', 'fine-tune',
  'rag', 'ml', 'machine learning', 'neural', 'transformer',
  'embedding', 'langchain', 'ollama', 'huggingface', 'mistral', 'llama',
  'inference', 'prompt', 'artificial intelligence', 'vibe', 'hermes'
];

/**
 * Retrieve configured ScrapingAnt API keys pool
 * @returns {string[]}
 */
function getScrapingAntKeys() {
  const keysStr = process.env.SCRAPINGANT_API_KEYS || process.env.SCRAPINGANT_API_KEY || '';
  return keysStr
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
}

/**
 * Mask key for secure logging (e.g. ce59...8633)
 */
function maskKey(key) {
  if (!key || key.length < 8) return '****';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

/**
 * Build fetch URL for Reddit RSS, routing through ScrapingAnt proxy if key is provided
 */
function buildProxyUrl(subreddit, limit = 15, apiKey) {
  const redditRssUrl = `https://www.reddit.com/r/${subreddit}/top.rss?t=day&limit=${limit}`;
  if (apiKey) {
    return `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(redditRssUrl)}&x-api-key=${apiKey}&proxy_type=residential`;
  }
  return redditRssUrl;
}

/**
 * Unwraps XML content if ScrapingAnt headless browser wrapped it in <pre> tags
 */
function unwrapXml(raw) {
  if (!raw) return '';
  if (raw.includes('<pre') && raw.includes('</pre>')) {
    try {
      const $ = cheerio.load(raw);
      const preText = $('pre').text();
      if (preText && (preText.includes('<?xml') || preText.includes('<feed'))) {
        return preText.trim();
      }
    } catch (_) {}
  }
  return raw.trim();
}

/**
 * Extract image URL from Atom entry (media:thumbnail or embedded HTML content)
 */
function extractImageUrl(entry) {
  // 1. Direct media:thumbnail tag
  const mediaThumb = entry['media:thumbnail']?.['@_url'];
  if (mediaThumb && mediaThumb.startsWith('http')) {
    return mediaThumb.replace(/&amp;/g, '&');
  }

  // 2. Parse HTML content for <img> tag
  const rawContent = typeof entry.content === 'string' 
    ? entry.content 
    : entry.content?.['#text'] || '';

  if (rawContent) {
    try {
      const $ = cheerio.load(rawContent);
      const imgSrc = $('img').first().attr('src');
      if (imgSrc && imgSrc.startsWith('http')) {
        return imgSrc.replace(/&amp;/g, '&');
      }
    } catch (_) {}
  }

  return null;
}

/**
 * Scrape top daily AI discussions across niche subreddits with key rotation & fallback
 * @param {string[]} [subreddits] - Optional list of subreddits to scrape
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export async function scrapeReddit(subreddits = DEFAULT_SUBREDDITS) {
  const antKeys = getScrapingAntKeys();
  const hasProxies = antKeys.length > 0;

  console.log(`[Reddit] Ingesting top posts across ${subreddits.length} subreddits (${hasProxies ? `${antKeys.length} rotating ScrapingAnt proxy keys active` : 'direct connection'})...`);

  const parser = new XMLParser({ 
    ignoreAttributes: false, 
    attributeNamePrefix: '@_',
    processEntities: false 
  });

  const allPosts = [];
  const limitPerSub = 10;
  let currentKeyIdx = 0;

  for (let i = 0; i < subreddits.length; i++) {
    const sub = subreddits[i];
    let fetchSuccess = false;
    let xmlText = '';

    // Attempt through rotating ScrapingAnt keys with automatic fallback
    if (hasProxies) {
      const startIdx = currentKeyIdx;
      for (let attempt = 0; attempt < antKeys.length; attempt++) {
        const key = antKeys[(startIdx + attempt) % antKeys.length];
        const proxyUrl = buildProxyUrl(sub, limitPerSub, key);

        try {
          const response = await fetchWithRetry(proxyUrl, {
            headers: {
              'User-Agent': DEFAULT_USER_AGENT,
              'Accept': 'application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8'
            }
          }, 1, 1000);

          if (response && response.ok) {
            const rawBody = await response.text();
            xmlText = unwrapXml(rawBody);
            if (xmlText && xmlText.length >= 50) {
              fetchSuccess = true;
              currentKeyIdx = (startIdx + attempt + 1) % antKeys.length; // rotate to next key for next subreddit
              break;
            }
          }

          console.warn(`[Reddit] Proxy key [${maskKey(key)}] received HTTP ${response?.status || 'ERR'} for r/${sub}. Rotating to next key...`);
        } catch (err) {
          console.warn(`[Reddit] Proxy key [${maskKey(key)}] failed for r/${sub}: ${err.message}. Rotating...`);
        }
      }
    }

    // Fallback to direct fetch if proxies are not configured or all failed
    if (!fetchSuccess) {
      try {
        const directUrl = buildProxyUrl(sub, limitPerSub, null);
        const response = await fetchWithRetry(directUrl, {
          headers: {
            'User-Agent': DEFAULT_USER_AGENT,
            'Accept': 'application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8'
          }
        }, 1, 1000);

        if (response && response.ok) {
          const rawBody = await response.text();
          xmlText = unwrapXml(rawBody);
          if (xmlText && xmlText.length >= 50) {
            fetchSuccess = true;
          }
        }
      } catch (_) {}
    }

    if (!fetchSuccess || !xmlText) {
      console.warn(`[Reddit] Skipped r/${sub}: could not fetch feed`);
      continue;
    }

    try {
      const jsonObj = parser.parse(xmlText);
      let entries = jsonObj.feed?.entry || [];
      if (!Array.isArray(entries)) entries = [entries];

      let subCount = 0;
      entries.forEach((entry, index) => {
        const title = (entry.title?.['#text'] || entry.title || '').trim();
        const link = entry.link?.['@_href'] || entry.link || '';
        const redditId = entry.id || link;
        const publishedAt = entry.published || new Date().toISOString();

        if (!title || !link) return;

        // Apply keyword check for broad subreddits like 'SideProject'
        if (sub.toLowerCase() === 'sideproject') {
          const targetText = title.toLowerCase();
          const isAi = AI_KEYWORDS.some(k => targetText.includes(k));
          if (!isAi) return;
        }

        const imageUrl = extractImageUrl(entry);
        const rankScore = Math.max(100, (limitPerSub - index) * 100);

        allPosts.push({
          reddit_id: redditId,
          title,
          subreddit: sub,
          url: link,
          image_url: imageUrl,
          score: rankScore,
          num_comments: 0,
          published_at: publishedAt,
          updated_at: new Date().toISOString()
        });
        subCount++;
      });

      console.log(`[Reddit] r/${sub}: Ingested ${subCount} posts`);
    } catch (parseErr) {
      console.warn(`[Reddit] Parse error for r/${sub}:`, parseErr.message);
    }
  }

  console.log(`[Reddit] Ingested ${allPosts.length} total posts across all subreddits.`);

  if (allPosts.length === 0) {
    console.log('[Reddit] No new posts collected today.');
    return { success: true, count: 0 };
  }

  // Soft verification of image URLs to prevent broken images
  console.log('[Reddit] Verifying image accessibility...');
  const verifiedPosts = await Promise.all(allPosts.map(async (post) => {
    if (!post.image_url) return post;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetchWithRetry(post.image_url, {
        method: 'HEAD',
        headers: { 'User-Agent': DEFAULT_USER_AGENT },
        signal: controller.signal
      }, 1, 500);

      clearTimeout(timeoutId);
      return res && res.ok ? post : { ...post, image_url: null };
    } catch (_) {
      return { ...post, image_url: null };
    }
  }));

  // Keep top 35 unique posts across all 12 subreddits
  const finalPosts = verifiedPosts.slice(0, 35);

  try {
    const { error } = await supabase
      .from('reddit_trending')
      .upsert(finalPosts, { onConflict: 'reddit_id' });

    if (error) throw error;
    console.log(`[Reddit] Successfully saved ${finalPosts.length} top posts to Supabase.`);
    return { success: true, count: finalPosts.length };
  } catch (error) {
    console.error('[Reddit] Database upsert failed:', error.message || error);
    return { success: false, count: 0, error: error.message || String(error) };
  }
}
