import process from 'process';
import { scrapeHuggingFace } from './scrapers/huggingface.js';
import { scrapeGithub } from './scrapers/github.js';
import { scrapeHackerNews } from './scrapers/hackernews.js';
import { scrapeProductHunt } from './scrapers/producthunt.js';
import { scrapeArxiv } from './scrapers/arxiv.js';
import { scrapeReddit } from './scrapers/reddit.js';

const PIPELINES = {
  huggingface: { name: 'HuggingFace', run: scrapeHuggingFace },
  github: { name: 'GitHub Trending', run: scrapeGithub },
  hackernews: { name: 'HackerNews', run: scrapeHackerNews },
  producthunt: { name: 'ProductHunt', run: scrapeProductHunt },
  arxiv: { name: 'ArXiv Papers', run: scrapeArxiv },
  reddit: { name: 'Reddit Discussions', run: scrapeReddit }
};

/**
 * Resilient Orchestrator for all ingestion pipelines
 */
async function main() {
  const args = process.argv.slice(2);
  const sourceArg = args.find(a => a.startsWith('--source=') || a.startsWith('-s='));
  const targetSource = sourceArg ? sourceArg.split('=')[1]?.toLowerCase() : null;

  const startTime = Date.now();

  // If running an isolated scraper via CLI (e.g., node pipeline.js --source=reddit)
  if (targetSource) {
    const pipeline = PIPELINES[targetSource];
    if (!pipeline) {
      console.error(`Unknown source "${targetSource}". Available sources: ${Object.keys(PIPELINES).join(', ')}`);
      process.exit(1);
    }

    console.log(`\n======================================================`);
    console.log(`🚀 Running Isolated Ingestion: ${pipeline.name}`);
    console.log(`======================================================\n`);

    const result = await pipeline.run();
    console.log(`\nFinished in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log(`Result: ${result.success ? 'SUCCESS' : 'FAILED'} (${result.count || 0} items saved)\n`);
    process.exit(result.success ? 0 : 1);
  }

  // Full Daily Pipeline Run (with Promise.allSettled resilience)
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Builder Daily Ingestion Orchestrator`);
  console.log(`======================================================\n`);

  const pipelineKeys = Object.keys(PIPELINES);
  const pipelinePromises = pipelineKeys.map(async (key) => {
    const pipe = PIPELINES[key];
    const itemStart = Date.now();
    try {
      const res = await pipe.run();
      return {
        key,
        name: pipe.name,
        success: res.success,
        count: res.count || 0,
        duration: ((Date.now() - itemStart) / 1000).toFixed(1) + 's',
        error: res.error || null
      };
    } catch (err) {
      return {
        key,
        name: pipe.name,
        success: false,
        count: 0,
        duration: ((Date.now() - itemStart) / 1000).toFixed(1) + 's',
        error: err.message || String(err)
      };
    }
  });

  // Use Promise.allSettled so no single scraper failure crashes the run
  const settled = await Promise.allSettled(pipelinePromises);

  const results = settled.map(s => s.status === 'fulfilled' ? s.value : {
    name: 'Unknown',
    success: false,
    count: 0,
    duration: '0s',
    error: s.reason?.message || 'Unexpected rejection'
  });

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const successCount = results.filter(r => r.success).length;

  console.log(`\n======================================================`);
  console.log(`📊 INGESTION SUMMARY REPORT (${totalDuration}s total)`);
  console.log(`======================================================`);

  const summaryTable = results.map(r => ({
    Source: r.name,
    Status: r.success ? '✅ SUCCESS' : '❌ FAILED',
    'Items Saved': r.count,
    Duration: r.duration,
    Notes: r.error ? `Error: ${r.error.substring(0, 40)}` : 'OK'
  }));

  console.table(summaryTable);
  console.log(`Result: ${successCount}/${pipelineKeys.length} pipelines succeeded.`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('Fatal orchestrator error:', err);
  process.exit(1);
});
