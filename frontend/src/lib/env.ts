// Environment helper for frontend
export const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const VITE_SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function ensureEnv(): void {
  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
    // eslint-disable-next-line no-console
    console.warn(
      'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Check .env'
    );
  }
}
