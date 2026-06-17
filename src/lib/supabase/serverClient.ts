import { createClient } from '@supabase/supabase-js';

// Create a Supabase client scoped to a specific user via their access token.
// RLS then sees auth.uid() = that user, so server routes can write the user's
// own rows safely. Returns null if Supabase isn't configured or no token.
export function createUserClient(accessToken?: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !accessToken) return null;

  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
