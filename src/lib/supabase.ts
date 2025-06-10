
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { env } from './env';

// Use environment variables with fallback to existing values for backward compatibility
const supabaseUrl = env.supabase.url;
const supabaseAnonKey = env.supabase.anonKey;

// If environment variables aren't set, provide instructions
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. Make sure to add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
    'to your environment variables.'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
