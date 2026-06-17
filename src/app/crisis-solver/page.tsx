'use client';

import React, { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import { PRESET_DATA } from '@/lib/data';
import { useDocument } from '@/context/DocumentContext';

export default function CrisisSolverPage() {
  const { documentCategory, analysisResult } = useDocument();
  const [draftTone, setDraftTone] = useState<'normal' | 'firm'>('normal');
  const [draftText, setDraftText] = useState('');
  const [copied, setCopied] = useState(false);

  const safeCategory = (documentCategory === 'other' ? 'medical' : documentCategory) as 'medical' | 'eviction' | 'debt';
  const dataToUse = analysisResult || PRESET_DATA[safeCategory];

  useEffect(() => {
    setDraftText(dataToUse.draft[draftTone]);
  }, [dataToUse, draftTone]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12 font-sans text-ink dark:text-ink animate-fade-in">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center md:text-left">
          <h1 className="font-serif text-4xl font-bold text-deep-pine dark:text-calm-sage mb-2">Crisis Solver</h1>
          <p className="text-sm text-ink dark:text-ink max-w-md">Use our response assistant to generate a tailored letter based on your uploaded document.</p>
        </div>
        
        {/* Response Draft Generator Assistant */}
        <section
          data-testid="response-draft-assistant"
          className="bg-surface dark:bg-surface border border-mist dark:border-mist rounded-3xl p-6 md:p-8 shadow-calm hover:shadow-calm-hover hover:-translate-y-0.5 transition-all duration-300 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-deep-pine dark:text-ink">Response Assistant</h3>
              <p className="font-sans text-xs text-ink dark:text-ink">A ready-to-send letter — edit it to make it yours.</p>
            </div>
            
            {/* Tone buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDraftTone('normal')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold font-sans border transition-all ${
                  draftTone === 'normal' 
                    ? 'bg-deep-pine dark:bg-calm-sage text-paper dark:text-paper border-deep-pine dark:border-calm-sage' 
                    : 'border-mist dark:border-mist text-ink hover:bg-warm-sand dark:hover:bg-mist'
                }`}
              >
                Default
              </button>
              <button
                type="button"
                data-testid="tone-btn-firm"
                onClick={() => setDraftTone('firm')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold font-sans border transition-all ${
                  draftTone === 'firm' 
                    ? 'bg-deep-pine dark:bg-calm-sage text-paper dark:text-paper border-deep-pine dark:border-calm-sage' 
                    : 'border-mist dark:border-mist text-ink hover:bg-warm-sand dark:hover:bg-mist'
                }`}
              >
                Firm Tone
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              data-testid="response-draft-textarea"
              rows={8}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full p-4 border border-mist dark:border-mist rounded-2xl bg-paper dark:bg-paper text-ink dark:text-ink focus:border-calm-sage dark:focus:border-calm-sage focus:ring-1 focus:ring-calm-sage dark:focus:ring-calm-sage transition-all duration-200 outline-none resize-none font-sans text-sm leading-relaxed"
            />
            
            <button
              type="button"
              data-testid="copy-draft-btn"
              onClick={copyToClipboard}
              className="absolute bottom-4 right-4 p-2 bg-surface dark:bg-surface border border-mist dark:border-mist hover:bg-warm-sand dark:hover:bg-mist rounded-full transition-all text-deep-pine dark:text-calm-sage flex items-center justify-center gap-1.5 text-xs font-semibold font-sans shadow shadow-sm hover:shadow"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
