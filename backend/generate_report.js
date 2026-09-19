import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import process from 'process';
import { z } from 'zod';
import sharp from 'sharp';

const ReportSchema = z.object({
  dailyReport: z.object({
    modelOfTheDay: z.object({ name: z.string().default(''), url: z.string().default('') }).optional(),
    toolOfTheDay: z.object({ name: z.string().default(''), url: z.string().default('') }).optional(),
    repoOfTheDay: z.object({ name: z.string().default(''), url: z.string().default('') }).optional(),
    paperOfTheDay: z.object({ name: z.string().default(''), url: z.string().default('') }).optional()
  }),
  gems: z.array(z.object({ title: z.string(), description: z.string(), image: z.string().nullable().optional(), url: z.string().nullable().optional() })),
  repos: z.array(z.object({ title: z.string(), description: z.string(), image: z.string().nullable().optional(), url: z.string().nullable().optional() })),
  hn: z.array(z.object({ title: z.string(), description: z.string(), image: z.string().nullable().optional(), url: z.string().nullable().optional() })),
  reddit: z.array(z.object({ title: z.string(), description: z.string(), image: z.string().nullable().optional(), url: z.string().nullable().optional() })),
  freshLinks: z.array(z.object({ title: z.string(), category: z.string().nullable().optional(), image: z.string().nullable().optional(), url: z.string().nullable().optional(), description: z.string().nullable().optional() })),
  phPicks: z.array(z.object({ name: z.string(), description: z.string(), thumbnail: z.string().nullable().optional(), url: z.string().nullable().optional() })),
  aiTools: z.array(z.object({ name: z.string(), description: z.string(), thumbnail: z.string().nullable().optional(), url: z.string().nullable().optional() })),
  modelIconMapping: z.record(z.string(), z.string()).optional()
}).passthrough();

dotenv.config();

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables!");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize APIs
const geminiApiKey = process.env.GEMINI_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;
const cerebrasApiKey = process.env.CEREBRAS_API_KEY;
const nvidiaApiKey = process.env.NVIDIA_API_KEY;
const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!geminiApiKey && !groqApiKey && !cerebrasApiKey && !nvidiaApiKey) {
  console.error("Missing all API keys in .env file! Skipping report generation.");
  process.exit(1);
}

async function generateDailyReport() {
  console.log("Generating Daily AI Report with Gemini 3.5 Flash & Multi-Model Fallbacks...");

  try {
    // Define intervals for filtering fresh content
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Calculate current week boundary (Monday 00:00:00 UTC)
    // Ensures weekend reports use unseen papers from this week only ("no pool from previous week")
    const now = new Date();
    const currentDay = now.getUTCDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    const diffToMonday = (currentDay + 6) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - diffToMonday);
    startOfWeek.setUTCHours(0, 0, 0, 0);
    const startOfWeekIso = startOfWeek.toISOString();
    const startOfWeekDateStr = startOfWeekIso.split('T')[0];
    const todayDateStr = now.toISOString().split('T')[0];

    const normalizeTitle = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const extractArxivId = (urlOrId) => {
      if (!urlOrId) return '';
      const match = String(urlOrId).match(/(\d{4}\.\d{4,5})/);
      return match ? match[1] : String(urlOrId).toLowerCase().trim();
    };

    // Fetch reports from current week (excluding today if re-running) to collect already published papers
    const { data: weekReports } = await supabase
      .from('daily_reports')
      .select('report_date, content_json')
      .gte('report_date', startOfWeekDateStr)
      .lt('report_date', todayDateStr);

    const publishedPaperIds = new Set();
    const publishedTitles = new Set();

    if (weekReports) {
      for (const report of weekReports) {
        const fresh = report.content_json?.freshLinks || [];
        for (const link of fresh) {
          if (link.url) publishedPaperIds.add(extractArxivId(link.url));
          if (link.title) publishedTitles.add(normalizeTitle(link.title));
        }
        const potd = report.content_json?.dailyReport?.paperOfTheDay;
        if (potd) {
          if (potd.url) publishedPaperIds.add(extractArxivId(potd.url));
          if (potd.name) publishedTitles.add(normalizeTitle(potd.name));
        }
      }
    }

    // 1. Fetch Today's Data (strictly this week's papers for ArXiv)
    const [
      { data: hfModelsRaw },
      { data: githubReposRaw },
      { data: hnStoriesRaw },
      { data: phPostsRaw24h },
      { data: phPostsRaw3d },
      { data: arxivPapersRaw },
      { data: redditPostsRaw }
    ] = await Promise.all([
      supabase.from('hf_models').select('hf_id,description,url,likes,downloads').gte('updated_at', twentyFourHoursAgo).order('likes', { ascending: false }).limit(14),
      supabase.from('github_trending').select('repo_name,description,url,stars_today').gte('updated_at', twentyFourHoursAgo).order('stars_today', { ascending: false }).limit(30),
      supabase.from('hn_trending').select('title,url,score').gte('updated_at', twentyFourHoursAgo).order('score', { ascending: false }).limit(14),
      supabase.from('ph_trending').select('name,tagline,description,url,votes_count,thumbnail_url').gte('updated_at', twentyFourHoursAgo).order('votes_count', { ascending: false }).limit(14),
      supabase.from('ph_trending').select('name,tagline,description,url,votes_count,thumbnail_url').gte('updated_at', threeDaysAgo).order('votes_count', { ascending: false }).limit(40),
      supabase.from('arxiv_trending').select('arxiv_id,title,summary,authors,url,published_at').gte('published_at', startOfWeekIso).order('published_at', { ascending: false }).limit(60),
      supabase.from('reddit_trending').select('title,subreddit,url,score,image_url,updated_at').gte('updated_at', sevenDaysAgo).order('score', { ascending: false }).limit(40)
    ]);

    // Cleanup and truncate: Only send essential info and reduce text bloat
    const truncate = (str, len = 200) => (str && str.length > len) ? str.substring(0, len) + "..." : str;
    
    const hfModels = (hfModelsRaw || []).map(item => ({ ...item, description: truncate(item.description) }));
    const shuffledReposRaw = (githubReposRaw || []).sort(() => 0.5 - Math.random()).slice(0, 15);
    const githubRepos = shuffledReposRaw.map(item => ({
      repo_name: item.repo_name,
      url: item.url,
      stars_today: item.stars_today,
      description: truncate(item.description, 100)
    }));
    const hnStories = hnStoriesRaw || [];
    const phPosts24h = (phPostsRaw24h || []).map(item => ({ ...item, tagline: truncate(item.tagline), description: truncate(item.description) }));
    const phPosts3d = (phPostsRaw3d || []).map(item => ({ ...item, tagline: truncate(item.tagline), description: truncate(item.description) }));
    
    // Filter ArXiv papers: Exclude any paper that has already appeared in this week's reports
    const unseenWeekPapers = (arxivPapersRaw || []).filter(paper => {
      const pId = extractArxivId(paper.arxiv_id || paper.url);
      const pTitle = normalizeTitle(paper.title);
      if (pId && publishedPaperIds.has(pId)) return false;
      if (pTitle && publishedTitles.has(pTitle)) return false;
      return true;
    });

    console.log(`[ArXiv Curation] Current week start: ${startOfWeekDateStr}. Already published this week: ${publishedPaperIds.size} paper(s). Candidates from this week: ${(arxivPapersRaw || []).length}. Unseen candidates: ${unseenWeekPapers.length}.`);

    const arxivPapers = unseenWeekPapers.slice(0, 15).map(item => ({
      title: item.title,
      url: item.url,
      summary: truncate(item.summary, 100)
    }));
    
    // Sort and prioritize Reddit posts:
    // Group 0: Today's posts with images
    // Group 1: Today's posts without images
    // Group 2: Past posts with images
    // Group 3: Past posts without images
    const sortedReddit = (redditPostsRaw || []).sort((a, b) => {
      const aIsToday = new Date(a.updated_at) >= new Date(twentyFourHoursAgo);
      const bIsToday = new Date(b.updated_at) >= new Date(twentyFourHoursAgo);
      const aHasImg = !!a.image_url;
      const bHasImg = !!b.image_url;

      let aGroup = 3;
      if (aIsToday && aHasImg) aGroup = 0;
      else if (aIsToday && !aHasImg) aGroup = 1;
      else if (!aIsToday && aHasImg) aGroup = 2;

      let bGroup = 3;
      if (bIsToday && bHasImg) bGroup = 0;
      else if (bIsToday && !bHasImg) bGroup = 1;
      else if (!bIsToday && bHasImg) bGroup = 2;

      if (aGroup !== bGroup) {
        return aGroup - bGroup;
      }
      return b.score - a.score;
    });
    const redditPosts = sortedReddit.slice(0, 15);

    // 2. Format the Mega Prompt
    const prompt = `
You are an expert AI Developer Advocate. Your job is to curate today's trending AI data across the internet and compile it into a strictly formatted JSON object.
Do NOT output any markdown, only valid JSON. 

Here is the raw data collected today:

<HuggingFace Models>
${JSON.stringify(hfModels, null, 2)}
</HuggingFace Models>

<GitHub Trending AI Repos>
${JSON.stringify(githubRepos, null, 2)}
</GitHub Trending AI Repos>

<HackerNews AI Stories>
${JSON.stringify(hnStories, null, 2)}
</HackerNews AI Stories>

<ProductHunt Recent Launches (Last 24 Hours)>
${JSON.stringify(phPosts24h, null, 2)}
</ProductHunt Recent Launches>

<ProductHunt Extended Tools (Last 3 Days)>
${JSON.stringify(phPosts3d, null, 2)}
</ProductHunt Extended Tools>

<ArXiv AI Papers>
${JSON.stringify(arxivPapers, null, 2)}
</ArXiv AI Papers>

<Reddit AI Discussions>
${JSON.stringify(redditPosts, null, 2)}
</Reddit AI Discussions>



INSTRUCTIONS:
Craft a polished, engaging daily digest with the EXACT JSON structure below. 
1. Use the raw data provided above to curate the absolute best items for each array.
2. TARGET ITEM COUNTS:
   - 'gems' (HF Models): 6 items
   - 'repos' (GitHub): 9 items
   - 'hn' (HackerNews): 6 items
   - 'reddit' (Reddit): Up to 6 items (If there are fewer than 6 Reddit posts in the raw data, just return the number of items that exist. DO NOT hallucinate, invent, or pad with duplicate posts under any circumstances).
   - 'phPicks' (ProductHunt): 6 items (The absolute highest voted tools from <ProductHunt Recent Launches (Last 24 Hours)>)
   - 'aiTools' (ProductHunt): 7 items (Highly rated hidden gems from <ProductHunt Extended Tools (Last 3 Days)>, MUST NOT overlap with phPicks. Every tool must be completely unique)
   - 'freshLinks' (ArXiv Papers): 4 items (MUST be selected exclusively from <ArXiv AI Papers>. Each paper must be unique and from this list)
3. For descriptions:
   - For the FIRST item in the ProductHunt 'phPicks' array ONLY (which is featured in a large spotlight card), you may write a slightly longer description (an extra couple of words, 15-25 words max).
   - For ALL OTHER items across all arrays, descriptions MUST be STRICTLY ONE VERY SHORT SENTENCE MAX (under 10 words). The UI lists are small, so be extremely concise. AVOID repetitive phrasing like "A post about..." or "A new...". Jump straight to the point with punchy, action-oriented phrasing.
4. For GitHub Repos, prioritize NOVEL, newer, or lesser-known repositories over massive frameworks unless they had a major release today.
5. FORMATTING RULE: Do NOT use hyphens between words in titles or names (e.g., write "DeepSeek V4 Pro" instead of "DeepSeek-V4-Pro", and "performance to place" instead of "performance-to-place"). Only use spaces, as it looks cleaner in the UI.
6. Under dailyReport, highlight the single absolute best item of the day for each subcategory using these STRICT mappings:
   - 'modelOfTheDay': Must be selected from <HuggingFace Models>.
   - 'toolOfTheDay': Must be selected from <ProductHunt Recent Launches (Last 24 Hours)>.
   - 'repoOfTheDay': Must be selected from <GitHub Trending AI Repos>.
   - 'paperOfTheDay': Must be selected from <ArXiv AI Papers>.
7. IMAGE/THUMBNAIL RULE:
   - For 'phPicks' and 'aiTools', ALWAYS use the 'thumbnail_url' provided in the raw ProductHunt data.
   - For 'reddit', ALWAYS use the real 'image_url' provided in the raw Reddit data. If the post does not have an 'image_url' (or it is null), return null for the image field. Do NOT invent image URLs or copy another post's image URL. Prioritize selecting Reddit posts that have valid image URLs.
   - For other sections (gems, repos, hn, freshLinks), if there is no real image URL in the raw data, you may use themed placeholders like:
     - "/gem_1.png", "/gem_2.png" for gems/models.
     - "/repo_1.png", "/repo_2.png" for repos.
     - "/news_1.png" for HN.
     - "/fresh_link_1.png" for freshLinks.
   - BUT for Product Hunt products and Reddit posts, do NOT use placeholders. Use the real 'thumbnail_url' or 'image_url'.
   - ALWAYS include the URL links where applicable.


EXPECTED JSON SCHEMA:
{
  "dailyReport": {
    "modelOfTheDay": { "name": "...", "url": "..." },
    "toolOfTheDay": { "name": "...", "url": "..." },
    "repoOfTheDay": { "name": "...", "url": "..." },
    "paperOfTheDay": { "name": "...", "url": "..." }
  },
  "gems": [ { "title": "...", "description": "...", "image": "...", "url": "..." } ],
  "repos": [ { "title": "...", "description": "...", "image": "...", "url": "..." } ],
  "hn": [ { "title": "...", "description": "...", "image": "...", "url": "..." } ],
  "reddit": [ { "title": "...", "description": "...", "image": "...", "url": "..." } ],
  "freshLinks": [ { "title": "...", "category": "...", "image": "...", "url": "...", "description": "..." } ],
  "phPicks": [ { "name": "...", "description": "...", "thumbnail": "...", "url": "..." } ],
  "aiTools": [ { "name": "...", "description": "...", "thumbnail": "...", "url": "..." } ],
  "modelIconMapping": { "Model Name": "lobehub-icon-id" }
}

Return ONLY the JSON object.
`;

    // 3. Call APIs with Cascading Fallback and Retries
    let parsedJson = null;

    const makeGeminiProvider = (modelName) => ({
      name: `Gemini (${modelName})`,
      key: geminiApiKey,
      call: async () => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.5,
              topP: 1,
              responseMimeType: "application/json",
            }
          })
        });

        if (!response.ok) {
          let errorText = await response.text().catch(() => "");
          throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }
    });

    const providers = [
      makeGeminiProvider("gemini-3.5-flash"),
      makeGeminiProvider("gemini-2.5-flash"),
      {
        name: "Groq (openai/gpt-oss-120b)",
        key: groqApiKey,
        call: async () => {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": "openai/gpt-oss-120b",
              "messages": [{ "role": "user", "content": prompt }],
              "temperature": 0.3,
              "response_format": { "type": "json_object" }
            })
          });

          if (!response.ok) {
            let errorText = await response.text().catch(() => "");
            throw new Error(`Groq API error (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          return data.choices[0].message.content;
        }
      },
      {
        name: "Groq (qwen/qwen3.8-27b)",
        key: groqApiKey,
        call: async () => {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": "qwen/qwen3.8-27b",
              "messages": [{ "role": "user", "content": prompt }],
              "temperature": 0.3,
              "response_format": { "type": "json_object" }
            })
          });

          if (!response.ok) {
            let errorText = await response.text().catch(() => "");
            throw new Error(`Groq API error (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          return data.choices[0].message.content;
        }
      },
      {
        name: "NVIDIA NIM (nemotron-3.5-lightning-30b-a3b)",
        key: nvidiaApiKey,
        call: async () => {
          const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${nvidiaApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": "nvidia/nemotron-3.5-lightning-30b-a3b",
              "messages": [{ "role": "user", "content": prompt + "\n\nCRITICAL: Output ONLY valid JSON according to the schema. Do not output any thought process or markdown." }],
              "temperature": 0.2,
              "max_tokens": 4096
            })
          });

          if (!response.ok) {
            let errorText = await response.text().catch(() => "");
            throw new Error(`NVIDIA NIM API error (${response.status}): ${errorText}`);
          }

          const data = await response.json();
          let content = data.choices[0].message.content || "";
          content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          return content;
        }
      },
      {
        name: "Cerebras (gpt-oss-120b)",
        key: cerebrasApiKey,
        call: async () => {
          const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${cerebrasApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": "gpt-oss-120b",
              "messages": [{ "role": "user", "content": prompt }],
              "temperature": 0.3,
              "response_format": { "type": "json_object" }
            })
          });

          if (!response.ok) {
            let errorText = await response.text().catch(() => "");
            throw new Error(`Cerebras API error (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          return data.choices[0].message.content;
        }
      }
    ];

    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts && !parsedJson) {
      attempt++;
      console.log(`\n--- Attempt ${attempt} of ${maxAttempts} ---`);
      
      for (const provider of providers) {
        if (!provider.key) {
          console.log(`Skipping ${provider.name} due to missing API key.`);
          continue;
        }
        
        console.log(`Sending prompt to ${provider.name}...`);
        try {
          const rawContent = await provider.call();
          
          // Clean up potential markdown code blocks and thoughts
          let cleanContent = rawContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
          cleanContent = cleanContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          
          // Robust JSON extraction between first '{' and last '}'
          const firstBrace = cleanContent.indexOf('{');
          const lastBrace = cleanContent.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
          }
          
          // Parse and validate
          const jsonObject = JSON.parse(cleanContent);
          parsedJson = ReportSchema.parse(jsonObject);
          console.log(`[Success] LLM output from ${provider.name} successfully parsed and validated by Zod!`);
          break; // successfully parsed, break providers loop
        } catch (error) {
          console.error(`Validation/Parsing for ${provider.name} failed:`, error.message);
          console.log(`[Fallback] ${provider.name} failed. Moving to next provider...`);
        }
      }
      
      if (!parsedJson && attempt < maxAttempts) {
        console.log("All providers failed on this attempt. Waiting 2 seconds before full retry...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!parsedJson) {
      throw new Error(`CRITICAL: All providers failed to generate a valid report after ${maxAttempts} attempts.`);
    }

    // 3.4 Guarantee 4 distinct unseen papers in freshLinks and paperOfTheDay from this week
    if (parsedJson.freshLinks && unseenWeekPapers.length >= 4) {
      const usedIdsThisRun = new Set();
      const sanitizedFreshLinks = [];

      for (const link of parsedJson.freshLinks) {
        const linkId = extractArxivId(link.url);
        const linkTitle = normalizeTitle(link.title);

        const isAlreadyPublished = publishedPaperIds.has(linkId) || publishedTitles.has(linkTitle);
        const isDuplicateInRun = usedIdsThisRun.has(linkId) || usedIdsThisRun.has(linkTitle);
        const matchesCandidate = unseenWeekPapers.some(p => extractArxivId(p.arxiv_id || p.url) === linkId || normalizeTitle(p.title) === linkTitle);

        if (!isAlreadyPublished && !isDuplicateInRun && matchesCandidate) {
          sanitizedFreshLinks.push(link);
          if (linkId) usedIdsThisRun.add(linkId);
          if (linkTitle) usedIdsThisRun.add(linkTitle);
        }
      }

      // If any paper was rejected (duplicate or already published), backfill from unseenWeekPapers
      if (sanitizedFreshLinks.length < 4) {
        console.log(`[ArXiv Curation] Backfilling ${4 - sanitizedFreshLinks.length} paper(s) from unseen pool...`);
        for (const candidate of unseenWeekPapers) {
          if (sanitizedFreshLinks.length >= 4) break;
          const cId = extractArxivId(candidate.arxiv_id || candidate.url);
          const cTitle = normalizeTitle(candidate.title);
          if (!usedIdsThisRun.has(cId) && !usedIdsThisRun.has(cTitle)) {
            sanitizedFreshLinks.push({
              title: candidate.title,
              category: 'AI Research',
              image: '/fresh_link_1.png',
              url: candidate.url,
              description: truncate(candidate.summary, 60)
            });
            if (cId) usedIdsThisRun.add(cId);
            if (cTitle) usedIdsThisRun.add(cTitle);
          }
        }
      }

      parsedJson.freshLinks = sanitizedFreshLinks.slice(0, 4);

      // Validate paperOfTheDay
      const potd = parsedJson.dailyReport?.paperOfTheDay;
      const potdId = extractArxivId(potd?.url);
      const potdTitle = normalizeTitle(potd?.name);
      if (publishedPaperIds.has(potdId) || publishedTitles.has(potdTitle) || !unseenWeekPapers.some(p => extractArxivId(p.arxiv_id || p.url) === potdId || normalizeTitle(p.title) === potdTitle)) {
        const fallbackPaper = sanitizedFreshLinks[0] || unseenWeekPapers[0];
        if (fallbackPaper && parsedJson.dailyReport) {
          console.log(`[ArXiv Curation] Setting paperOfTheDay to unseen candidate: "${fallbackPaper.title}"`);
          parsedJson.dailyReport.paperOfTheDay = {
            name: fallbackPaper.title,
            url: fallbackPaper.url
          };
        }
      }
    }

    // 3.5 Generate AI thumbnails for Fresh Links
    if (parsedJson.freshLinks && parsedJson.freshLinks.length > 0) {
      console.log("Generating AI thumbnails for Fresh Links...");
      const hfToken = process.env.HF_TOKEN;
      if (!hfToken) {
        console.warn("HF_TOKEN missing in .env, skipping AI image generation for freshLinks.");
      } else {
        for (let i = 0; i < parsedJson.freshLinks.length; i++) {
          const link = parsedJson.freshLinks[i];
          try {
            // Prevent hitting Gemini API rate limits on free tier
            if (i > 0) {
                console.log("Sleeping 2s to respect API rate limits...");
                await new Promise(r => setTimeout(r, 2000));
            }
            
            // 1. Get Visual Concept from Gemini with Fallback Models
            const conceptPrompt = `You are an art director designing a unique modern bohemian art illustration for a research paper cover.
Paper Title: "${link.title}"
Category: "${link.category || 'Artificial Intelligence'}"
Summary: "${link.description || 'AI research paper'}"

Task: Invent a SINGLE, highly unique physical or geometrical visual metaphor tailored specifically to this paper's core theme:
- If Robotics / Embodied AI: sleek minimalist robotic humanoid or limb contours navigating architectural archways
- If LLMs / Safety / Alignment: harmoniously balanced zen stones, delicate celestial arcs, or organic scales of equilibrium
- If Embeddings / Math / Vectors: multidimensional stacked ceramic arches, topographical contour planes, or radiant geometric sunbursts
- If Vision / Memory / Architecture: cascading organic stone silhouettes, memory chambers, or botanical branches climbing clay hills
- Other: fluid organic ceramic vases, sculptural arches, and celestial spheres

Rule: Output ONLY the visual metaphor description (under 12 words). Do not include words, text, letters, or numbers.`;
            
            let concept = `premium abstract conceptual visualization of ${link.title}`;
            let conceptGenerated = false;

            const conceptProviders = [
              {
                name: "gemini-3.5-flash-lite",
                call: async () => {
                  if (!geminiApiKey) throw new Error("Missing Gemini key");
                  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiApiKey}`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: conceptPrompt }] }], generationConfig: { temperature: 0.7, topP: 0.9 } })
                  });
                  if (!res.ok) throw new Error(await res.text());
                  const data = await res.json();
                  return data.candidates[0].content.parts[0].text.trim();
                }
              },
              {
                name: "gemini-3.5-flash",
                call: async () => {
                  if (!geminiApiKey) throw new Error("Missing Gemini key");
                  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: conceptPrompt }] }], generationConfig: { temperature: 0.7, topP: 0.9 } })
                  });
                  if (!res.ok) throw new Error(await res.text());
                  const data = await res.json();
                  return data.candidates[0].content.parts[0].text.trim();
                }
              },
              {
                name: "gemini-2.5-flash",
                call: async () => {
                  if (!geminiApiKey) throw new Error("Missing Gemini key");
                  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: conceptPrompt }] }], generationConfig: { temperature: 0.7, topP: 0.9 } })
                  });
                  if (!res.ok) throw new Error(await res.text());
                  const data = await res.json();
                  return data.candidates[0].content.parts[0].text.trim();
                }
              },
              {
                name: "groq (openai/gpt-oss-120b)",
                call: async () => {
                  if (!groqApiKey) throw new Error("Missing Groq key");
                  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST", headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: conceptPrompt }], temperature: 0.7, top_p: 0.9 })
                  });
                  if (!res.ok) throw new Error(await res.text());
                  const data = await res.json();
                  return data.choices[0].message.content.trim();
                }
              },
              {
                name: "cerebras (gpt-oss-120b)",
                call: async () => {
                  if (!cerebrasApiKey) throw new Error("Missing Cerebras key");
                  const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
                    method: "POST", headers: { "Authorization": `Bearer ${cerebrasApiKey}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: "gpt-oss-120b", messages: [{ role: "user", content: conceptPrompt }], temperature: 0.7, top_p: 0.9 })
                  });
                  if (!res.ok) throw new Error(await res.text());
                  const data = await res.json();
                  return data.choices[0].message.content.trim();
                }
              }
            ];

            for (const cp of conceptProviders) {
              try {
                concept = await cp.call();
                conceptGenerated = true;
                break;
              } catch (e) {
                console.warn(`Concept generation with ${cp.name} failed for link ${i}:`, e.message);
              }
            }

            if (!conceptGenerated) {
              console.warn(`All models failed for concept generation of link ${i}. Using default fallback concept.`);
            }

            // 2. Generate Image with Cloudflare Workers AI (FLUX.1-schnell with SDXL fallback)
            const bohoPalettes = [
              "terracotta, sage green, desert sand, and burnt sienna",
              "warm ochre, raw linen, dusty mustard, and terracotta",
              "deep olive green, blush clay, desert sand, and brass accents",
              "burnt umber, soft cream, slate-taupe, and warm terracotta"
            ];
            const chosenPalette = bohoPalettes[i % bohoPalettes.length];

            const imagePrompt = `modern bohemian abstract art illustration of ${concept}, fluid organic ceramic shapes, architectural arches, textured canvas, earthy tones of ${chosenPalette}, contemporary boho aesthetic, minimalist gallery wall art, no text, no letters`;
            console.log(`Generating Cloudflare AI cover for Fresh Link ${i+1}: ${concept} [Palette: ${chosenPalette}]`);
            
            let rawBuffer = null;

            if (cloudflareAccountId && cloudflareApiToken) {
              // Primary: Cloudflare FLUX.1-schnell
              try {
                const cfFluxRes = await fetch(
                  `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${cloudflareApiToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt: imagePrompt, steps: 4 })
                  }
                );

                if (cfFluxRes.ok) {
                  const cfData = await cfFluxRes.json();
                  if (cfData.result && cfData.result.image) {
                    rawBuffer = Buffer.from(cfData.result.image, 'base64');
                  }
                } else {
                  console.warn(`Cloudflare FLUX error (${cfFluxRes.status}):`, await cfFluxRes.text());
                }
              } catch (cfErr) {
                console.warn(`Cloudflare FLUX request failed:`, cfErr.message);
              }

              // Fallback: Cloudflare SDXL Base
              if (!rawBuffer) {
                try {
                  console.log(`Falling back to Cloudflare SDXL for Fresh Link ${i+1}...`);
                  const cfSdxlRes = await fetch(
                    `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
                    {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${cloudflareApiToken}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ prompt: imagePrompt, num_steps: 20 })
                    }
                  );

                  if (cfSdxlRes.ok) {
                    const arrayBuffer = await cfSdxlRes.arrayBuffer();
                    rawBuffer = Buffer.from(arrayBuffer);
                  } else {
                    console.warn(`Cloudflare SDXL error (${cfSdxlRes.status}):`, await cfSdxlRes.text());
                  }
                } catch (sdxlErr) {
                  console.warn(`Cloudflare SDXL fallback failed:`, sdxlErr.message);
                }
              }
            }

            if (!rawBuffer) {
              throw new Error("All image generation providers failed");
            }

            // 3. Compress to 640x360 JPEG with sharp to keep Supabase storage < 30 KB
            const compressedBuffer = await sharp(rawBuffer)
              .resize(640, 360, { fit: 'cover' })
              .jpeg({ quality: 75, mozjpeg: true })
              .toBuffer();
              
            console.log(`Image compressed with sharp: ${(compressedBuffer.length / 1024).toFixed(1)} KB`);

            // 4. Upload to Supabase Storage
            const todayStr = new Date().toISOString().split('T')[0];
            const timestamp = Date.now();
            const fileName = `${todayStr}-fresh-${i}-${timestamp}.jpg`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('report_images')
              .upload(fileName, compressedBuffer, {
                contentType: 'image/jpeg',
                upsert: true
              });
              
            if (uploadError) {
              console.error(`Error uploading image ${fileName}:`, uploadError);
            } else {
              const { data: publicUrlData } = supabase.storage.from('report_images').getPublicUrl(fileName);
              link.image = publicUrlData.publicUrl;
              console.log(`Successfully uploaded ${fileName} to Supabase! URL: ${link.image}`);
            }
          } catch (err) {
             console.error(`Failed to generate image for fresh link ${i}:`, err.message);
          }
        }
      }
    }

    // 4. Save to Supabase
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Saving JSON report to Supabase for ${today}...`);
    const { error } = await supabase
      .from('daily_reports')
      .upsert({ 
        report_date: today, 
        content_json: parsedJson,
        content_md: '', 
        status: 'published',
        updated_at: new Date().toISOString()
      }, { onConflict: 'report_date' });
      
    if (error) {
      console.error("Error saving daily report:", error);
    } else {
      console.log("Successfully saved today's LLM JSON report to Supabase!");
    }

  } catch (error) {
    console.error("Report Generation failed:", error);
  }
}

generateDailyReport();
