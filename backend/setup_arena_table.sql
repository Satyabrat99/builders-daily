-- SQL Script to create the arena_leaderboard table in Supabase
-- This table is designed to keep historical data (a snapshot each day)

-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.arena_leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    rank INTEGER NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    model_provider VARCHAR(100),
    model_icon_url TEXT,
    elo_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, category, model_name)
);

-- Ensure columns exist (if table was created in a previous run)
ALTER TABLE public.arena_leaderboard ADD COLUMN IF NOT EXISTS model_provider VARCHAR(100);
ALTER TABLE public.arena_leaderboard ADD COLUMN IF NOT EXISTS model_icon_url TEXT;

-- Enable Row Level Security (RLS)
ALTER TABLE public.arena_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (just like other trending tables)
-- We use DO block to avoid error if policy already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'arena_leaderboard' AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON public.arena_leaderboard FOR SELECT USING (true);
    END IF;
END
$$;
