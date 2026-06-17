'use client';

import { createBrowserClient } from '@supabase/ssr';

// True when env keys are present, so the UI can fall back gracefully if not.
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Single browser Supabase client for auth + data access (RLS-protected).
// Keys are public anon keys — safe to expose to the browser. When the env
// vars aren't set yet, we pass harmless placeholders so module load doesn't
// throw at build time; the client is never actually used while unconfigured
// (auth is gated behind isSupabaseConfigured).
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
);
