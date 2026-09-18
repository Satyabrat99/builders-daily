import { supabase } from '../utils/db.js';
import { fetchWithRetry } from '../utils/http.js';

const AI_KEYWORDS = [
  'ai', 'llm', 'gpt', 'claude', 'gemini', 'agent', 'model', 'fine-tune',
  'rag', 'open source', 'ml', 'machine learning', 'neural', 'transformer',
  'embedding', 'langchain', 'ollama', 'huggingface', 'mistral', 'llama',
  'inference', 'prompt'
];

/**
 * Scrape top AI stories from Hacker News (Firebase API)
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export async function scrapeHackerNews() {
  console.log('[HackerNews] Fetching top stories (Daily)...');

  try {
    const hnResponse = await fetchWithRetry('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!hnResponse.ok) throw new Error(`Failed to fetch HN top stories: HTTP ${hnResponse.status}`);

    const allStoryIds = await hnResponse.json();
    const storyIds = allStoryIds.slice(0, 100);

    const stories = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < storyIds.length; i += BATCH_SIZE) {
      const batch = storyIds.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(id =>
        fetchWithRetry(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(res => res.ok ? res.json() : null)
          .catch(err => {
            console.warn(`[HackerNews] Skipping story ${id}:`, err.message);
            return null;
          })
      );

      const batchResults = await Promise.all(batchPromises);
      stories.push(...batchResults.filter(Boolean));
    }

    const aiStories = stories.filter(story => {
      if (!story || story.type !== 'story' || story.score <= 50 || !story.title) return false;

      const lowerTitle = story.title.toLowerCase();
      return AI_KEYWORDS.some(keyword => {
        if (['ai', 'ml', 'llm', 'gpt', 'rag'].includes(keyword)) {
          return new RegExp(`\\b${keyword}\\b`, 'i').test(story.title);
        }
        return lowerTitle.includes(keyword);
      });
    });

    const finalStories = aiStories.slice(0, 15).map(story => ({
      hn_id: story.id.toString(),
      title: story.title,
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      score: story.score,
      author: story.by,
      published_at: new Date(story.time * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }));

    console.log(`[HackerNews] Found ${aiStories.length} AI stories with score > 50; saving top ${finalStories.length}.`);

    if (finalStories.length > 0) {
      const { error } = await supabase
        .from('hn_trending')
        .upsert(finalStories, { onConflict: 'hn_id' });

      if (error) throw error;
      console.log(`[HackerNews] Successfully saved ${finalStories.length} stories to Supabase.`);
    }

    return { success: true, count: finalStories.length };
  } catch (error) {
    console.error('[HackerNews] Ingestion failed:', error.message || error);
    return { success: false, count: 0, error: error.message || String(error) };
  }
}
