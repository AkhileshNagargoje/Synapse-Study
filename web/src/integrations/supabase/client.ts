import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Auth-backed features will stay in fallback mode until .env is configured.");
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder-project.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export function hasSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}