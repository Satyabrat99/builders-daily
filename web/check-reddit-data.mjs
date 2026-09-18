import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRedditData() {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('status', 'published')
    .order('report_date', { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Reddit data:", JSON.stringify(data?.[0]?.content_json?.reddit, null, 2));
  }
}

checkRedditData();
