'use client';

import { supabase } from './supabase/client';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  location: string | null;
  preferred_language: string | null;
  household_size: number | null;
  income_band: string | null;
  situations: string[] | null;
  about: string | null;
}

export async function getProfile(): Promise<Profile | null> {
  // maybeSingle: returns null (not an error) when the profile row doesn't
  // exist yet — it's created on the user's first save via updateProfile.
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) {
    console.error('getProfile failed:', error.message);
    return null;
  }
  return (data as Profile) ?? null;
}

export async function updateProfile(fields: Partial<Profile>): Promise<{ error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const id = userData.user?.id;
  if (!id) return { error: 'Not signed in' };
  // Upsert so it works even if the profile row wasn't created by the trigger.
  const { error } = await supabase.from('profiles').upsert({ id, ...fields });
  return { error: error?.message ?? null };
}

// A short, human summary the AI can use to localize and personalize — built
// only from what the user chose to share. Empty string if nothing useful.
export function profileSummary(p: Profile | null): string {
  if (!p) return '';
  const bits: string[] = [];
  if (p.location) bits.push(`Location: ${p.location}`);
  if (p.household_size) bits.push(`Household size: ${p.household_size}`);
  if (p.situations && p.situations.length) bits.push(`Circumstances: ${p.situations.join(', ')}`);
  if (p.income_band) bits.push(`Rough income: ${p.income_band}`);
  if (p.preferred_language && p.preferred_language !== 'English') bits.push(`Preferred language: ${p.preferred_language}`);
  if (p.about) bits.push(`Notes: ${p.about}`);
  return bits.join('. ');
}
