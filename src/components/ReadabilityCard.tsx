'use client';

import React, { useMemo } from 'react';
import { Wand2, ArrowRight } from 'lucide-react';
import { gradeLevel, gradeLabel, stripMarkdown } from '@/lib/readability';

interface ReadabilityCardProps {
  originalText: string;
  plainText: string;
}

export default function ReadabilityCard({ originalText, plainText }: ReadabilityCardProps) {
  const before = useMemo(() => gradeLevel(originalText), [originalText]);
  const after = useMemo(() => gradeLevel(plainText), [plainText]);

  // Only show when both are scorable and ENVIS actually made it simpler.
  if (!before || !after || after >= before) return null;

  const dropped = before - after;
  const origExcerpt = stripMarkdown(originalText).slice(0, 240);
  const plainExcerpt = stripMarkdown(plainText).slice(0, 240);

  return (
    <div className="bg-surface dark:bg-surface rounded-3xl shadow-calm p-5 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-calm-sage/20 flex items-center justify-center">
          <Wand2 className="w-4 h-4 text-deep-pine dark:text-calm-sage" />
        </div>
        <div>
          <p className="font-serif font-bold text-sm text-deep-pine dark:text-calm-sage">Made it simpler</p>
          <p className="text-2xs font-sans text-ink dark:text-ink opacity-70">{dropped} reading grade{dropped > 1 ? 's' : ''} easier to read</p>
        </div>
      </div>

      {/* Grade summary */}
      <div className="flex items-center justify-center gap-4 md:gap-6 mb-5">
        <div className="text-center">
          <p className="text-2xs uppercase tracking-wider text-ink/50 font-sans mb-1">Original</p>
          <p className="text-3xl font-serif font-bold text-soft-clay">Grade {before}</p>
          <p className="text-2xs text-ink/50 font-sans mt-0.5">{gradeLabel(before)}</p>
        </div>
        <ArrowRight className="w-6 h-6 text-ink/30 flex-shrink-0" />
        <div className="text-center">
          <p className="text-2xs uppercase tracking-wider text-ink/50 font-sans mb-1">With ENVIS</p>
          <p className="text-3xl font-serif font-bold text-calm-sage">Grade {after}</p>
          <p className="text-2xs text-ink/50 font-sans mt-0.5">{gradeLabel(after)}</p>
        </div>
      </div>

      {/* Side-by-side excerpts */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-paper dark:bg-paper rounded-2xl p-3.5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-soft-clay mb-1.5">The document said</p>
          <p className="text-xs text-ink/70 dark:text-ink/70 font-sans leading-relaxed">{origExcerpt}…</p>
        </div>
        <div className="bg-paper dark:bg-paper rounded-2xl p-3.5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-calm-sage mb-1.5">ENVIS made it</p>
          <p className="text-xs text-ink dark:text-ink font-sans leading-relaxed">{plainExcerpt}…</p>
        </div>
      </div>
    </div>
  );
}
