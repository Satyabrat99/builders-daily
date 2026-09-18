# AI Builder Data Pipeline Context

## Project Overview
This project acts as the backend data ingestion engine for an AI Developer Chrome Extension. Its purpose is to fetch, aggregate, filter, and structure the absolute best, trending artificial intelligence resources on the internet on a daily basis.

The entire pipeline runs through a single Node.js script (`pipeline.js`) utilizing ES Modules, environment variables (`.env`), and Supabase (PostgreSQL) as the central database.

---

## 🏗 Technology Stack
- **Environment**: Node.js (ES module format, `"type": "module"` in package.json)
- **Database**: Supabase
- **Key Dependencies**: 
  - `@supabase/supabase-js` (Database interactions)
  - `dotenv` (Environment variable management)
  - `cheerio` (HTML Scraping for GitHub)
  - `fast-xml-parser` (Parsing ArXiv Atom feeds)

---

## 🔑 Environment Variables Required
The script strictly requires the following keys in a `.env` file to function:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_for_bypassing_rls
PRODUCTHUNT_API_KEY=your_producthunt_developer_token_v2
NVIDIA_API_KEY=your_nvidia_api_key
```

---

## 📡 Data Sources & Logic Architecture

The pipeline currently processes **5 independent data streams**. All of them use a standard `upsert` mechanism in Supabase to either insert new daily records or update existing ones (based on their unique IDs). 

### 1. 🤗 HuggingFace (`hf_models`, `hf_datasets`, `hf_spaces`)
- **Endpoints:** Hits the official HuggingFace API for `/models`, `/datasets`, and `/spaces`.
- **Logic:** Queries using `sort=trendingScore` and explicitly expands fields to include `downloads`, `likes`, `tags`, `lastModified`, and `pipeline_tag`.
- **Output:** 
  - **10** Trending Models (saved to `hf_models`)
  - **5** Trending Datasets (saved to `hf_datasets`)
  - **5** Trending Spaces (saved to `hf_spaces`)
- **Key Columns extracted:** hf_id, url, type, likes, downloads, tags, description, pipeline_tag (models only), last_modified.

### 2. 🐙 GitHub Trending (`github_trending`)
- **Endpoint:** Scrapes `https://github.com/trending?since=daily` directly.
- **Logic:** We parse the raw HTML using Cheerio, extract the repo metadata, and then strictly filter the array ensuring that the repository description or name contains specific **AI Keywords** (e.g., ai, llm, gpt, claude, rag, machine learning, transformer, etc.).
- **Output:** Keeps a strict maximum of **10** AI-related repositories.
- **Key Columns extracted:** repo_name, url, description, language, stars_today, total_stars.

### 3.  HackerNews (`hn_trending`)
- **Endpoints:** Uses the free Firebase API: `topstories.json` and `/auto/item/{id}.json`.
- **Logic:** Fetches the top 100 hot stories. Concurrent fetching resolves their details. It filters keeping ONLY items where:
  - `type` is exactly "story"
  - `score` is strictly > 50
  - The `title` contains case-insensitive AI Keywords (using strict regex boundaries for acronyms like 'ai', 'ml', 'gpt').
- **Output:** Limits to a max of **15** items. 
- **Key Columns extracted:** hn_id, title, url, score, author, published_at.

### 4. 😸 Product Hunt (`ph_trending`)
- **Endpoint:** Queries the GraphQL v2 API (`https://api.producthunt.com/v2/api/graphql`).
- **Logic:** It fetches the very top 50 apps launching *today* globally (`order: RANKING`), overriding their standard topic filters. It then scans the name, tagline, and description against our dense AI keyword list. 
- **Output:** Returns exactly the top **10** AI applications from the current day's homepage. It also successfully resolves nested graph edges to extract the `thumbnail_url` for use as an app icon.
- **Key Columns extracted:** ph_id, name, tagline, description, url, thumbnail_url, votes_count, published_at.

### 5. 📚 ArXiv Papers (`arxiv_trending`)
- **Endpoint:** Queries `http://export.arxiv.org/api/query`.
- **Logic:** Requests Computer Science AI schemas (`cat:cs.AI OR cat:cs.LG OR cat:cs.CL`), sequenced by `submittedDate`. Parses the returning XML/Atom feed with `fast-xml-parser`. Imposes a strict date-block, discarding any paper not submitted strictly **Today** or **Yesterday**.
- **Output:** Extracts a maximum of **10** fresh AI/ML research papers. It resolves the top 2 authors as a joined string and extracts a clean URL.
- **Key Columns extracted:** arxiv_id, title, summary, authors, url, published_at.

### 6. 👽 Reddit (`reddit_trending`)
- **Endpoint:** Queries `.json` endpoints for `r/LocalLLaMA`, `r/MachineLearning`, `r/SideProject`, and `r/artificial`.
- **Logic:** Fetches the top 8 posts of the day (`t=day&limit=8`) using a custom `User-Agent`. Consolidates all posts, strictly filters the `SideProject` subreddit for AI/LLM keywords in the title, and then aggregates everything.
- **Output:** Sorts the consolidated array globally by `score` and strictly keeps the absolute top **20** posts across the four communities.
- **Key Columns extracted:** reddit_id, title, subreddit, url, score, num_comments, published_at.

### 7. 🤖 Daily Digest Generator (`generate_report.js`)
- **Backend**: Uses **NVIDIA NIM** to access **Llama 3.3 70B** (`meta/llama-3.3-70b-instruct`).
- **Logic**: Aggregates the latest data from all 6 sources into a unified prompt. The LLM acts as an "AI Developer Advocate", curating the raw array data into a strict JSON payload that matches the exact structure required by the frontend layout (mockFeed schema).
- **ProductHunt Split**: Specifically provides the LLM with two distinct Product Hunt data sets: a 24-hour pool for the top `phPicks`, and an extended 3-day pool for `aiTools` to guarantee volume on slow launch days.
- **Output**: Generates a valid JSON object with arrays for gems, repos, hn, reddit, freshLinks, and products.
- **Storage**: Upserts the JSON payload into the `content_json` column of the `daily_reports` table, indexed by the current date.

---

## 🔒 Supabase Security Configuration
All tables mentioned above are initialized in the `public` schema. 
1. The Node script uses the `SUPABASE_SERVICE_ROLE_KEY` to insert data. This bypasses all security rules natively.
2. Every table has **Row Level Security (RLS)** ENABLED.
3. Every table has a strict policy allowing ONLY `SELECT` (read) queries for the `public` role. This means your Chrome Extension frontend will be able to query the database anonymously, but no one can anonymously modify the aggregated data. 

## ⏭ Next Steps & Future Work
[ ] Set up GitHub Actions or a Cron Server to execute `node pipeline.js` automatically every 24 hours.
[ ] Begin scaffolding the Chrome Extension (Frontend) that will query the `public` datasets configured above.
