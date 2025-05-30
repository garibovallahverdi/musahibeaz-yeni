import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qptyvfmlusdnrrofcqkx.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdHl2Zm1sdXNkbnJyb2ZjcWt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUzOTMxNiwiZXhwIjoyMDY0MTE1MzE2fQ.i1AMQHAdt5u7AHYsaYV3k6jJwu-tKf1uYEYHY6OL1dc";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is not defined in environment variables.');
}

export const createSupabaseServiceRoleClient = () => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};