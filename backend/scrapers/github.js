import * as cheerio from 'cheerio';
import { supabase } from '../utils/db.js';
import { fetchWithRetry, DEFAULT_USER_AGENT } from '../utils/http.js';

const AI_KEYWORDS = [
  'ai', 'llm', 'machine learning', 'gpt', 'stable diffusion', 
  'model', 'agent', 'rag', 'deep learning', 'transformer', 'genai', 'lora'
];

/**
 * Scrape GitHub daily trending repositories related to AI
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export async function scrapeGithub() {
  console.log('[GitHub] Scraping GitHub Trending (Daily)...');

  try {
    const response = await fetchWithRetry('https://github.com/trending?since=daily', {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub trending: HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const repos = [];

    $('article.Box-row').each((_, el) => {
      const titleEl = $(el).find('h2 a');
      const href = titleEl.attr('href');
      const repoName = href ? href.substring(1).trim() : '';

      const description = $(el).find('p.col-9').text().trim();
      const language = $(el).find('span[itemprop="programmingLanguage"]').text().trim();

      const starsTodayText = $(el).find('span.d-inline-block.float-sm-right').text().trim();
      const starsToday = parseInt(starsTodayText.replace(/,/g, '').split(' ')[0], 10) || 0;

      const totalStarsText = $(el).find(`a[href$="/stargazers"]`).text().trim();
      const totalStars = parseInt(totalStarsText.replace(/,/g, ''), 10) || 0;

      if (repoName) {
        repos.push({
          repo_name: repoName,
          url: `https://github.com/${repoName}`,
          description,
          language,
          stars_today: starsToday,
          total_stars: totalStars,
          updated_at: new Date().toISOString()
        });
      }
    });

    // Filter for AI keywords in description or repo name
    const aiRepos = repos.filter(repo => {
      const targetText = `${repo.repo_name} ${repo.description}`.toLowerCase();
      return AI_KEYWORDS.some(keyword => targetText.includes(keyword));
    });

    const finalRepos = aiRepos.slice(0, 25);
    console.log(`[GitHub] Found ${repos.length} trending repos; filtered down to ${finalRepos.length} AI repos.`);

    if (finalRepos.length > 0) {
      const { error } = await supabase
        .from('github_trending')
        .upsert(finalRepos, { onConflict: 'repo_name' });

      if (error) throw error;
      console.log(`[GitHub] Successfully saved ${finalRepos.length} trending repos to Supabase.`);
    } else {
      console.log('[GitHub] No AI-related trending repos found today.');
    }

    return { success: true, count: finalRepos.length };
  } catch (error) {
    console.error('[GitHub] Ingestion failed:', error.message || error);
    return { success: false, count: 0, error: error.message || String(error) };
  }
}
