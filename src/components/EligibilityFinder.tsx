'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ExternalLink, RefreshCw, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface EligibilityFinderProps {
  documentText: string | null;
  analysis: string;
  category: string;
}

interface Program {
  name: string;
  helpsWith: string;
  likelihood: 'likely' | 'maybe' | 'check';
  why: string;
  howToApply: string;
  url: string;
}

const SITUATIONS = ['Have children', 'Pregnant', 'Unemployed', 'Senior (65+)', 'Disability', 'Very low income', 'Veteran', 'Student'];

const LIKELIHOOD: Record<Program['likelihood'], { label: string; bg: string; fg: string }> = {
  likely: { label: 'Likely eligible', bg: '#EAF3DE', fg: '#3B6D11' },
  maybe: { label: 'Maybe', bg: '#FAEEDA', fg: '#854F0B' },
  check: { label: 'Worth checking', bg: '#E6F1FB', fg: '#185FA5' },
};

export default function EligibilityFinder({ documentText, analysis, category }: EligibilityFinderProps) {
  const { profile } = useAuth();
  const [region, setRegion] = useState('');
  const [situations, setSituations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [detectedRegion, setDetectedRegion] = useState('');

  // Prefill from the user's saved profile so they don't re-enter it.
  useEffect(() => {
    if (profile?.location) setRegion((r) => r || profile.location || '');
    if (profile?.situations?.length) setSituations((s) => (s.length ? s : profile.situations || []));
  }, [profile]);

  const toggle = (s: string) =>
    setSituations((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText,
          analysis,
          region,
          situations,
          householdSize: profile?.household_size ?? undefined,
          incomeBand: profile?.income_band ?? undefined,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.programs)) {
        setPrograms(data.programs);
        setDetectedRegion(data.region || '');
      }
    } catch (err) {
      console.error('Eligibility check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface dark:bg-surface rounded-3xl shadow-calm p-5 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-calm-sage/20 flex items-center justify-center">
          <BadgeCheck className="w-4 h-4 text-deep-pine dark:text-calm-sage" />
        </div>
        <div>
          <p className="font-serif font-bold text-sm text-deep-pine dark:text-calm-sage">What support can you get?</p>
          <p className="text-2xs font-sans text-ink dark:text-ink opacity-70">
            {detectedRegion ? `Programs for ${detectedRegion}` : 'Programs you may qualify for'}
          </p>
        </div>
      </div>

      {!programs && (
        <div className="space-y-4">
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink/60 font-sans">Where are you? (optional)</label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="State / country — helps me match the right programs"
              className="mt-1.5 w-full bg-paper dark:bg-paper rounded-2xl px-4 py-2.5 text-sm text-ink dark:text-ink font-sans focus:outline-none focus:ring-1 focus:ring-calm-sage placeholder:text-ink/40"
            />
          </div>
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider text-ink/60 font-sans">Anything that applies? (optional)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SITUATIONS.map((s) => {
                const on = situations.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    className={`text-xs font-semibold rounded-full px-3.5 py-1.5 transition-all font-sans ${
                      on
                        ? 'bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine shadow-calm'
                        : 'bg-paper dark:bg-paper text-ink/70 hover:bg-warm-sand dark:hover:bg-mist'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="w-full bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine font-semibold py-3 rounded-2xl shadow-calm hover:shadow-calm-hover hover:opacity-90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 font-sans text-sm"
          >
            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Finding programs…</> : <><Sparkles className="w-4 h-4" /> Find programs I may qualify for</>}
          </button>
        </div>
      )}

      {programs && (
        <div className="space-y-3">
          {programs.length === 0 && (
            <p className="text-sm text-ink/60 font-sans">I couldn't pin down specific programs — tell me your state or country and I'll try again.</p>
          )}
          {programs.map((p, i) => {
            const lk = LIKELIHOOD[p.likelihood] || LIKELIHOOD.check;
            return (
              <div key={i} className="bg-paper dark:bg-paper rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-deep-pine dark:text-calm-sage">{p.name}</p>
                    <p className="text-2xs text-ink/70 font-sans">{p.helpsWith}</p>
                  </div>
                  <span className="text-2xs font-bold rounded-full px-2.5 py-1 flex-shrink-0" style={{ background: lk.bg, color: lk.fg }}>
                    {lk.label}
                  </span>
                </div>
                <p className="text-sm text-ink dark:text-ink font-sans leading-relaxed mt-2">{p.why}</p>
                <p className="text-xs text-ink/80 dark:text-ink/80 font-sans leading-relaxed mt-2">
                  <span className="font-semibold text-deep-pine dark:text-calm-sage">Next step: </span>{p.howToApply}
                </p>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-calm-sage hover:text-deep-pine dark:hover:text-calm-sage mt-2.5 transition-colors"
                  >
                    Official site <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            );
          })}
          <button
            onClick={() => setPrograms(null)}
            className="text-xs font-semibold text-ink/60 hover:text-deep-pine dark:hover:text-calm-sage transition-colors font-sans"
          >
            ← Adjust my details
          </button>
        </div>
      )}
    </div>
  );
}
