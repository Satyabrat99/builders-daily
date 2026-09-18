-- SQL Script to create the featured_gems and site_settings tables in Supabase

-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_settings' AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON public.site_settings FOR SELECT USING (true);
    END IF;
END
$$;

-- Allow service role to perform all actions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_settings' AND policyname = 'Allow service_role full access'
    ) THEN
        CREATE POLICY "Allow service_role full access" ON public.site_settings FOR ALL USING (true);
    END IF;
END
$$;

-- Allow authenticated users to perform all actions (for Admin panel client writes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_settings' AND policyname = 'Allow authenticated full access'
    ) THEN
        CREATE POLICY "Allow authenticated full access" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- Insert default visibility setting
INSERT INTO public.site_settings (key, value)
VALUES ('featured_gems_visible', 'true')
ON CONFLICT (key) DO NOTHING;


-- 2. Create featured_gems table
CREATE TABLE IF NOT EXISTS public.featured_gems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for featured_gems
ALTER TABLE public.featured_gems ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active featured gems
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'featured_gems' AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON public.featured_gems FOR SELECT USING (true);
    END IF;
END
$$;

-- Allow service role to perform all actions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'featured_gems' AND policyname = 'Allow service_role full access'
    ) THEN
        CREATE POLICY "Allow service_role full access" ON public.featured_gems FOR ALL USING (true);
    END IF;
END
$$;

-- Allow authenticated users to perform all actions (for Admin panel client writes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'featured_gems' AND policyname = 'Allow authenticated full access'
    ) THEN
        CREATE POLICY "Allow authenticated full access" ON public.featured_gems FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END
$$;
