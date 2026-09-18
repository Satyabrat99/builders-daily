-- Grant UPDATE permission to authenticated users (admins) on daily_reports
GRANT ALL ON TABLE public.daily_reports TO authenticated;
GRANT ALL ON TABLE public.daily_reports TO service_role;
GRANT ALL ON TABLE public.daily_reports TO anon;

-- Alternatively, just disable RLS for testing, or add a specific policy:
ALTER TABLE public.daily_reports DISABLE ROW LEVEL SECURITY;
