-- SQL Migration to create the blog_bundles table in Supabase

CREATE TABLE IF NOT EXISTS public.blog_bundles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    cover_image TEXT,
    article_ids JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_bundles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to bundles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'blog_bundles' AND policyname = 'Allow public read access to blog_bundles'
    ) THEN
        CREATE POLICY "Allow public read access to blog_bundles" 
        ON public.blog_bundles FOR SELECT USING (true);
    END IF;
END
$$;

-- Allow authenticated users full management access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'blog_bundles' AND policyname = 'Allow authenticated full access to blog_bundles'
    ) THEN
        CREATE POLICY "Allow authenticated full access to blog_bundles" 
        ON public.blog_bundles FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- Allow service_role full access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'blog_bundles' AND policyname = 'Allow service_role full access to blog_bundles'
    ) THEN
        CREATE POLICY "Allow service_role full access to blog_bundles" 
        ON public.blog_bundles FOR ALL USING (true);
    END IF;
END
$$;
