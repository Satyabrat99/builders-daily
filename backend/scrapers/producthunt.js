import process from 'process';
import { supabase } from '../utils/db.js';
import { fetchWithRetry } from '../utils/http.js';

const AI_KEYWORDS = [
  'ai', 'llm', 'gpt', 'claude', 'gemini', 'agent', 'model', 'fine-tune',
  'rag', 'ml', 'machine learning', 'neural', 'transformer',
  'embedding', 'langchain', 'ollama', 'huggingface', 'mistral', 'llama',
  'inference', 'prompt', 'artificial intelligence'
];

/**
 * Scrape top AI launches from Product Hunt (GraphQL API)
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export async function scrapeProductHunt() {
  console.log('[ProductHunt] Fetching top AI posts (Daily)...');

  const apiKey = process.env.PRODUCTHUNT_API_KEY;
  if (!apiKey) {
    console.warn('[ProductHunt] Missing PRODUCTHUNT_API_KEY in .env. Skipping.');
    return { success: true, count: 0, skipped: true };
  }

  try {
    const query = `
      {
        posts(order: RANKING, first: 50) {
          edges {
            node {
              id
              name
              tagline
              description
              url
              votesCount
              createdAt
              thumbnail {
                url
              }
            }
          }
        }
      }
    `;

    const response = await fetchWithRetry('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Product Hunt: HTTP ${response.status}`);
    }

    const json = await response.json();
    const edges = json?.data?.posts?.edges || [];

    const aiEdges = edges.filter(edge => {
      const node = edge.node;
      const targetText = `${node.name} ${node.tagline} ${node.description}`.toLowerCase();

      return AI_KEYWORDS.some(keyword => {
        if (['ai', 'ml', 'llm', 'gpt', 'rag'].includes(keyword)) {
          return new RegExp(`\\b${keyword}\\b`, 'i').test(targetText);
        }
        return targetText.includes(keyword);
      });
    });

    const finalPosts = aiEdges.slice(0, 25).map(edge => {
      const node = edge.node;
      return {
        ph_id: node.id.toString(),
        name: node.name,
        tagline: node.tagline,
        description: node.description,
        url: node.url,
        thumbnail_url: node.thumbnail?.url || null,
        votes_count: node.votesCount,
        published_at: node.createdAt,
        updated_at: new Date().toISOString()
      };
    });

    console.log(`[ProductHunt] Found ${aiEdges.length} AI products; saving top ${finalPosts.length}.`);

    if (finalPosts.length > 0) {
      const { error } = await supabase
        .from('ph_trending')
        .upsert(finalPosts, { onConflict: 'ph_id' });

      if (error) throw error;
      console.log(`[ProductHunt] Successfully saved ${finalPosts.length} products to Supabase.`);
    }

    return { success: true, count: finalPosts.length };
  } catch (error) {
    console.error('[ProductHunt] Ingestion failed:', error.message || error);
    return { success: false, count: 0, error: error.message || String(error) };
  }
}
