
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Environment variables provided by Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
