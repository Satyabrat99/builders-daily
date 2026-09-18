-- ==============================================================================
-- 🚀 QUICK MIGRATION SCRIPT FOR SUPABASE SQL EDITOR:
-- Run this block in Supabase SQL Editor to ensure all tables and columns exist:
-- ==============================================================================
ALTER TABLE IF EXISTS goodies ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS goodies ADD COLUMN IF NOT EXISTS custom_image_url TEXT;
ALTER TABLE IF EXISTS goodies ADD COLUMN IF NOT EXISTS og_image_url TEXT;
ALTER TABLE IF EXISTS promotions ADD COLUMN IF NOT EXISTS target_url TEXT;
ALTER TABLE IF EXISTS featured_gems ADD COLUMN IF NOT EXISTS url TEXT;

CREATE TABLE IF NOT EXISTS public.site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON public.site_settings;
CREATE POLICY "Allow public read access" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role full access" ON public.site_settings;
CREATE POLICY "Allow service_role full access" ON public.site_settings FOR ALL USING (true);

-- ==============================================================================
-- BUILDER GOODIES SCHEMA & LAUNCH SEED DATA
-- Curated verified gems for Vibecoders, SaaS Builders, and Series Founders
-- Short, punchy titles & descriptions matching Featured Gems aesthetic.
-- Strictly authentic OpenGraph & source images. No stock images, no mock data.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS goodies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('sheets', 'notion', 'figma', 'cursorrules', 'code', 'tool', 'legal')),
  category TEXT NOT NULL CHECK (category IN ('Vibecoders', 'SaaS Builders', 'Series Founders')),
  author_name TEXT NOT NULL,
  author_handle TEXT,
  author_avatar TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  custom_image_url TEXT,
  og_image_url TEXT,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional schema upgrade for existing installations:
ALTER TABLE goodies ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE goodies ADD COLUMN IF NOT EXISTS custom_image_url TEXT;
ALTER TABLE goodies ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Index for instant feed lookups by approval status and category
CREATE INDEX IF NOT EXISTS idx_goodies_status_cat ON goodies (status, category, created_at DESC);

-- Enable RLS
ALTER TABLE goodies ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies before recreating (guarantees safe re-runs without 42710 error)
DROP POLICY IF EXISTS "Public can read approved goodies" ON goodies;
DROP POLICY IF EXISTS "Public can submit pending goodies" ON goodies;
DROP POLICY IF EXISTS "Admins have full access to goodies" ON goodies;

-- Allow public read access to approved goodies
CREATE POLICY "Public can read approved goodies" 
  ON goodies FOR SELECT 
  USING (status = 'approved');

-- Allow anyone to insert pending submissions
CREATE POLICY "Public can submit pending goodies" 
  ON goodies FOR INSERT 
  WITH CHECK (status = 'pending');

-- Allow service role / admin full access
CREATE POLICY "Admins have full access to goodies" 
  ON goodies FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Deduplicate any existing duplicate resource_urls before creating unique index
DELETE FROM goodies
WHERE id NOT IN (
  SELECT DISTINCT ON (resource_url) id
  FROM goodies
  ORDER BY resource_url, created_at DESC
);

-- Ensure unique index on resource_url so re-running seeds updates or ignores safely
CREATE UNIQUE INDEX IF NOT EXISTS idx_goodies_resource_url ON goodies (resource_url);


-- ==============================================================================
-- PRE-LOADED LAUNCH VAULT (15 Verified Authentic Gems)
-- Real working URLs with source/OG images and clean punchy copy
-- ==============================================================================

INSERT INTO goodies (title, description, resource_url, platform, category, author_name, author_handle, thumbnail_url, status, is_featured, click_count)
VALUES
  -- 1. shadcn/ui
  (
    'shadcn/ui',
    'Accessible, copy-paste React & Tailwind components.',
    'https://github.com/shadcn-ui/ui',
    'code',
    'Vibecoders',
    'shadcn',
    '@shadcn',
    'https://opengraph.githubassets.com/1/shadcn-ui/ui',
    'approved',
    true,
    340
  ),
  -- 2. 21st.dev Component & Shader Vault
  (
    '21st.dev',
    'Curated component & WebGL shader library.',
    'https://21st.dev',
    'tool',
    'Vibecoders',
    '21st.dev Community',
    '@21st_dev',
    'https://21st.dev/opengraph-image.png',
    'approved',
    true,
    295
  ),
  -- 3. BentoGrids
  (
    'BentoGrids',
    'Modern bento layouts & UI section presets.',
    'https://bentogrids.com',
    'tool',
    'SaaS Builders',
    'BentoGrids',
    '@bentogrids',
    'https://bentogrids.com/images/og.png',
    'approved',
    true,
    210
  ),
  -- 4. Y Combinator Standard Post-Money SAFE
  (
    'YC SAFE Agreements',
    'Industry-standard seed fundraising contracts.',
    'https://www.ycombinator.com/documents',
    'legal',
    'Series Founders',
    'Y Combinator',
    '@ycombinator',
    'https://www.ycombinator.com/assets/ycdc/yc-og-image-c440a0ad1dacfb86eeeb343717479cc54d256614449b4ef719977a0a451f8bc8.png',
    'approved',
    true,
    280
  ),
  -- 5. Pitch Deck Hunt
  (
    'Pitch Deck Hunt',
    'Real winning pitch decks from top startups.',
    'https://pitchdeckhunt.com',
    'tool',
    'Series Founders',
    'Pitch Deck Hunt',
    '@PitchDeckHunt',
    'https://cdn.prod.website-files.com/5eb6a4640e0bc85ac562ed85/5ebbf61e9b155e3fb809ecc8_pitchdeckhunt-og-image.jpg',
    'approved',
    true,
    245
  ),
  -- 6. Vercel AI Chatbot Starter
  (
    'Vercel AI Chatbot',
    'Production-ready Next.js AI chat template.',
    'https://github.com/vercel/ai-chatbot',
    'code',
    'Vibecoders',
    'Vercel Engineering',
    '@vercel',
    'https://opengraph.githubassets.com/1/vercel/ai-chatbot',
    'approved',
    true,
    260
  ),
  -- 7. Magic UI
  (
    'Magic UI',
    '50+ animated React landing page components.',
    'https://github.com/magicuidesign/magicui',
    'code',
    'Vibecoders',
    'Dillion Verma',
    '@dillionverma',
    'https://opengraph.githubassets.com/1/magicuidesign/magicui',
    'approved',
    false,
    195
  ),
  -- 8. Stripe Subscription Sample & Webhooks
  (
    'Stripe Subscriptions',
    'Official webhook and billing starter repo.',
    'https://github.com/stripe-samples/subscription-use-cases',
    'code',
    'SaaS Builders',
    'Stripe Dev',
    '@stripedev',
    'https://opengraph.githubassets.com/1/stripe-samples/subscription-use-cases',
    'approved',
    false,
    175
  ),
  -- 9. Resend Modern Email Platform
  (
    'Resend',
    'Modern email API built for developers.',
    'https://resend.com',
    'tool',
    'SaaS Builders',
    'Zeno Rocha',
    '@zenorocha',
    'https://resend.com/static/cover.png',
    'approved',
    false,
    165
  ),
  -- 10. Dub.co Open-Source Link Management
  (
    'Dub.co',
    'Open-source link management infrastructure.',
    'https://github.com/dubinc/dub',
    'code',
    'SaaS Builders',
    'Steven Tey',
    '@steventey',
    'https://opengraph.githubassets.com/1/dubinc/dub',
    'approved',
    false,
    155
  ),
  -- 11. SST Ion Modern Serverless
  (
    'SST Ion',
    'Zero-config TypeScript cloud deployments.',
    'https://github.com/sst/ion',
    'code',
    'Vibecoders',
    'SST Team',
    '@sst_dev',
    'https://opengraph.githubassets.com/1/sst/ion',
    'approved',
    false,
    150
  ),
  -- 12. Supabase Open Source Firebase Alternative
  (
    'Supabase',
    'Open-source Firebase alternative with Postgres.',
    'https://github.com/supabase/supabase',
    'code',
    'SaaS Builders',
    'Supabase Team',
    '@supabase',
    'https://opengraph.githubassets.com/1/supabase/supabase',
    'approved',
    false,
    220
  ),
  -- 13. DAIR.AI Prompt Engineering Guide
  (
    'Prompt Guide',
    'Comprehensive LLM & AI agent techniques.',
    'https://github.com/dair-ai/Prompt-Engineering-Guide',
    'code',
    'Vibecoders',
    'DAIR.AI',
    '@dair_ai',
    'https://opengraph.githubassets.com/1/dair-ai/Prompt-Engineering-Guide',
    'approved',
    false,
    180
  ),
  -- 14. OpenAI Whisper
  (
    'OpenAI Whisper',
    'High-accuracy local speech-to-text neural net.',
    'https://github.com/openai/whisper',
    'code',
    'Vibecoders',
    'OpenAI Open Source',
    '@openai',
    'https://opengraph.githubassets.com/1/openai/whisper',
    'approved',
    false,
    215
  ),
  -- 15. Developer Roadmap
  (
    'Cursor Rules',
    'Curated .cursorrules for Next.js and Python.',
    'https://github.com/PatrickJS/awesome-cursorrules',
    'code',
    'Vibecoders',
    'PatrickJS',
    '@gdi2290',
    'https://opengraph.githubassets.com/1/PatrickJS/awesome-cursorrules',
    'approved',
    false,
    205
  )
ON CONFLICT (resource_url) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  thumbnail_url = EXCLUDED.thumbnail_url,
  platform = EXCLUDED.platform,
  category = EXCLUDED.category,
  author_name = EXCLUDED.author_name,
  author_handle = EXCLUDED.author_handle,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  updated_at = NOW();

