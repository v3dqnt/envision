'use client';

import React, { useEffect, useState } from 'react';
import { UserCog, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, type Profile } from '@/lib/profile';

const LANGUAGES = ['English', 'Simple English', 'Spanish', 'Tamil', 'Hindi', 'Telugu', 'Bengali', 'French', 'Arabic', 'Chinese'];
const INCOME_BANDS = ['Prefer not to say', 'Under $1,500/mo', '$1,500–3,000/mo', '$3,000–5,000/mo', 'Over $5,000/mo'];
const SITUATIONS = ['Have children', 'Pregnant', 'Unemployed', 'Senior (65+)', 'Disability', 'Veteran', 'Student', 'Recently immigrated', 'Primary caregiver'];

export default function AccountPage() {
  const { user, configured, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState<Partial<Profile>>({});
  const [situations, setSituations] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        location: profile.location ?? '',
        preferred_language: profile.preferred_language ?? 'English',
        household_size: profile.household_size ?? undefined,
        income_band: profile.income_band ?? '',
        about: profile.about ?? '',
      });
      setSituations(profile.situations ?? []);
    }
  }, [profile]);

  const set = (k: keyof Profile, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSit = (s: string) => setSituations((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const { error } = await updateProfile({
      ...form,
      household_size: form.household_size ? Number(form.household_size) : null,
      situations,
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
      refreshProfile();
      setTimeout(() => setSaved(false), 2500);
    }
  };

  if (!configured || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12">
        <p className="text-sm text-ink/60 font-sans">Sign in to manage your details.</p>
      </div>
    );
  }

  const label = "text-2xs font-semibold uppercase tracking-wider text-ink/60 font-sans";
  const input = "mt-1.5 w-full bg-paper dark:bg-paper rounded-2xl px-4 py-3 text-sm text-ink dark:text-ink font-sans focus:outline-none focus:ring-1 focus:ring-calm-sage placeholder:text-ink/40";

  return (
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12 font-sans text-ink dark:text-ink animate-fade-in">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="font-serif text-4xl font-medium text-deep-pine dark:text-calm-sage mb-2">Your details</h1>
          <p className="text-sm text-ink dark:text-ink opacity-80 max-w-lg">
            Share a little about your situation and ENVIS can tailor its help — localizing prices and laws, and finding the right programs and support near you.
          </p>
        </div>

        {/* Privacy note — responsible-AI: user owns + controls their data */}
        <div className="flex items-start gap-3 rounded-2xl bg-calm-sage/10 p-4">
          <ShieldCheck className="w-5 h-5 text-calm-sage flex-shrink-0 mt-0.5" />
          <p className="text-xs text-ink/80 dark:text-ink/80 font-sans leading-relaxed">
            Every field is optional and private to your account. We never ask for sensitive IDs or exact medical history.
            You can edit or clear any of this anytime — it's used only to personalize your help.
          </p>
        </div>

        <div className="bg-surface dark:bg-surface rounded-3xl shadow-calm p-6 md:p-8 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={label}>Your name</label>
              <input className={input} value={form.full_name ?? ''} onChange={(e) => set('full_name', e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <label className={label}>Where you live</label>
              <input className={input} value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} placeholder="City, State / Country" />
            </div>
            <div>
              <label className={label}>Preferred language</label>
              <select className={input} value={form.preferred_language ?? 'English'} onChange={(e) => set('preferred_language', e.target.value)}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>People in your household</label>
              <input type="number" min={1} className={input} value={form.household_size ?? ''} onChange={(e) => set('household_size', e.target.value)} placeholder="e.g. 3" />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Rough monthly income (optional)</label>
              <select className={input} value={form.income_band ?? ''} onChange={(e) => set('income_band', e.target.value)}>
                <option value="">Select…</option>
                {INCOME_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Anything that applies to you</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SITUATIONS.map((s) => {
                const on = situations.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSit(s)}
                    className={`text-xs font-semibold rounded-full px-3.5 py-1.5 transition-all font-sans ${
                      on ? 'bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine shadow-calm' : 'bg-paper dark:bg-paper text-ink/70 hover:bg-warm-sand dark:hover:bg-mist'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={label}>Anything else we should know? (optional)</label>
            <textarea className={input} rows={3} value={form.about ?? ''} onChange={(e) => set('about', e.target.value)} placeholder="e.g. I care for an elderly parent and work part-time." />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine font-semibold py-3.5 rounded-2xl shadow-calm hover:shadow-calm-hover hover:opacity-90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 font-sans text-sm"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? <><Check className="w-4 h-4" /> Saved</> : <><UserCog className="w-4 h-4" /> Save my details</>}
          </button>
        </div>
      </div>
    </div>
  );
}
