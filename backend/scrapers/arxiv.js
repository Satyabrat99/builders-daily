import { XMLParser } from 'fast-xml-parser';
import { supabase } from '../utils/db.js';
import { fetchWithRetry } from '../utils/http.js';

/**
 * Fetch top recent AI research papers from ArXiv API
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export async function scrapeArxiv() {
  console.log('[ArXiv] Fetching recent AI research papers...');

  try {
    const url = 'http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=15';
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ArXiv: HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const jsonObj = parser.parse(xmlText);

    let entries = jsonObj.feed?.entry || [];
    if (!Array.isArray(entries)) entries = [entries];

    // Look back 3 days to account for ArXiv weekend publication pauses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentPapers = entries.filter(entry => {
      const publishedDate = new Date(entry.published);
      return publishedDate >= threeDaysAgo;
    });

    const finalPapers = recentPapers.slice(0, 10).map(entry => {
      let authors = entry.author || [];
      if (!Array.isArray(authors)) authors = [authors];
      const authorNames = authors.slice(0, 2).map(a => a.name).join(', ');

      const arxivId = entry.id.split('/abs/')[1]?.split('v')[0] || entry.id;

      return {
        arxiv_id: arxivId,
        title: entry.title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
        summary: entry.summary.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
        authors: authorNames,
        url: entry.id,
        published_at: entry.published,
        updated_at: new Date().toISOString()
      };
    });

    console.log(`[ArXiv] Processed ${recentPapers.length} papers; saving top ${finalPapers.length}.`);

    if (finalPapers.length > 0) {
      const { error } = await supabase
        .from('arxiv_trending')
        .upsert(finalPapers, { onConflict: 'arxiv_id' });

      if (error) throw error;
      console.log(`[ArXiv] Successfully saved ${finalPapers.length} papers to Supabase.`);
    }

    return { success: true, count: finalPapers.length };
  } catch (error) {
    console.error('[ArXiv] Ingestion failed:', error.message || error);
    return { success: false, count: 0, error: error.message || String(error) };
  }
}
