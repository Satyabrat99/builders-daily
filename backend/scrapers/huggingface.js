import { supabase } from '../utils/db.js';
import { fetchWithRetry } from '../utils/http.js';

const HUGGINGFACE_API = 'https://huggingface.co/api';

/**
 * Ingest trending Models, Datasets, and Spaces from Hugging Face
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export async function scrapeHuggingFace() {
  console.log('[HuggingFace] Fetching trending profiles...');

  try {
    const [modelsRes, datasetsRes, spacesRes] = await Promise.all([
      fetchWithRetry(`${HUGGINGFACE_API}/models?sort=trendingScore&limit=10&direction=-1&expand[]=downloads&expand[]=likes&expand[]=tags&expand[]=lastModified&expand[]=pipeline_tag`),
      fetchWithRetry(`${HUGGINGFACE_API}/datasets?sort=trendingScore&limit=5&direction=-1&expand[]=downloads&expand[]=likes&expand[]=tags&expand[]=lastModified`),
      fetchWithRetry(`${HUGGINGFACE_API}/spaces?sort=trendingScore&limit=5&direction=-1&expand[]=likes&expand[]=tags&expand[]=lastModified`)
    ]);

    if (!modelsRes.ok || !datasetsRes.ok || !spacesRes.ok) {
      throw new Error(`Failed response - Models: ${modelsRes.status}, Datasets: ${datasetsRes.status}, Spaces: ${spacesRes.status}`);
    }

    const models = await modelsRes.json();
    const datasets = await datasetsRes.json();
    const spaces = await spacesRes.json();

    const extractFields = (item, type) => {
      let url = 'https://huggingface.co/';
      if (type === 'dataset') url += 'datasets/';
      if (type === 'space') url += 'spaces/';
      url += item.id;

      return {
        hf_id: item.id,
        url,
        type,
        likes: item.likes || 0,
        downloads: item.downloads || 0,
        tags: item.tags || [],
        description: item.description || '',
        last_modified: item.lastModified || new Date().toISOString(),
        pipeline_tag: item.pipeline_tag || null,
        updated_at: new Date().toISOString()
      };
    };

    const topModels = models.slice(0, 10).map(m => extractFields(m, 'model'));
    const topDatasets = datasets.slice(0, 5).map(d => extractFields(d, 'dataset'));
    const topSpaces = spaces.slice(0, 5).map(s => extractFields(s, 'space'));

    const promises = [];
    if (topModels.length > 0) {
      promises.push(supabase.from('hf_models').upsert(topModels, { onConflict: 'hf_id' }));
    }
    if (topDatasets.length > 0) {
      promises.push(supabase.from('hf_datasets').upsert(topDatasets, { onConflict: 'hf_id' }));
    }
    if (topSpaces.length > 0) {
      promises.push(supabase.from('hf_spaces').upsert(topSpaces, { onConflict: 'hf_id' }));
    }

    const results = await Promise.all(promises);
    for (const res of results) {
      if (res.error) throw res.error;
    }

    const totalCount = topModels.length + topDatasets.length + topSpaces.length;
    console.log(`[HuggingFace] Successfully saved ${totalCount} trending items (${topModels.length} models, ${topDatasets.length} datasets, ${topSpaces.length} spaces).`);

    return { success: true, count: totalCount };
  } catch (error) {
    console.error('[HuggingFace] Ingestion failed:', error.message || error);
    return { success: false, count: 0, error: error.message || String(error) };
  }
}
