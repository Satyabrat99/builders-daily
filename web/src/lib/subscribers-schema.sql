-- ==============================================================================
-- AI Builder Daily: Subscribers & Waitlist Schema
-- Single source of truth for all email subscriptions, waitlist leads, and status
-- ==============================================================================

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  type TEXT NOT NULL DEFAULT 'newsletter', -- 'newsletter' | 'waitlist' | 'both'
  status TEXT NOT NULL DEFAULT 'active',    -- 'active' | 'unsubscribed' | 'pending'
  source TEXT DEFAULT 'blog',               -- 'blog_footer', 'blog_card', 'waitlist_page', etc.
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by email and status
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_type ON subscribers(type);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public insertion via client or API route
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Allow public subscriber insert'
  ) THEN
    CREATE POLICY "Allow public subscriber insert" ON subscribers FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow read/write access to service role (used by server route & admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Allow service role full access'
  ) THEN
    CREATE POLICY "Allow service role full access" ON subscribers FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Allow select for authenticated users / dashboard
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Allow select for authenticated users'
  ) THEN
    CREATE POLICY "Allow select for authenticated users" ON subscribers FOR SELECT USING (true);
  END IF;
END $$;
