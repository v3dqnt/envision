'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Check } from 'lucide-react';

// A document-aware reasoning trace shown while the advisor analyzes the doc.
// The steps mirror what ENVIS actually does, tailored to the document type.
const COMMON_START = ['Reading the document end to end', 'Pulling out the key details — amounts, dates, names'];
const COMMON_END = ['Writing your plain-language breakdown'];

const MIDDLE: Record<string, string[]> = {
  medical: ['Checking the charges and the math', 'Comparing against typical costs for the area', 'Flagging anything that looks off or unclear'],
  discharge: ['Sorting out the medication schedule', 'Pulling out follow-ups and warning signs to watch for'],
  food: ['Finding what you must do and by when', 'Checking the eligibility rules and deadlines', 'Looking for support you may qualify for'],
  government: ['Finding what the letter actually requires', 'Checking the deadline and your appeal rights'],
  housing: ['Identifying what you need to provide', 'Checking eligibility criteria and deadlines'],
  eviction: ['Pinpointing the real deadline and your rights', 'Weighing pay vs. negotiate vs. contest'],
  debt: ['Checking your validation rights', 'Looking for anything past the statute of limitations'],
  school: ['Finding what action is needed and the date', 'Translating the school jargon into plain words'],
  default: ['Identifying what matters most for you', 'Checking the deadlines and your options'],
};

function stepsFor(category: string): string[] {
  const mid = MIDDLE[category] || MIDDLE.default;
  return [...COMMON_START, ...mid, ...COMMON_END];
}

export default function ThinkingProcess({ category, reducedMotion }: { category: string; reducedMotion?: boolean }) {
  const steps = useMemo(() => stepsFor(category), [category]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setActive(steps.length - 1);
      return;
    }
    // Advance through the trace; hold on the last step until the reply lands.
    const id = setInterval(() => setActive((i) => Math.min(i + 1, steps.length - 1)), 2300);
    return () => clearInterval(id);
  }, [steps, reducedMotion]);

  return (
    <div
      data-testid="visual-loader"
      className="border border-mist dark:border-mist rounded-3xl bg-surface dark:bg-surface p-8 md:p-10 shadow-calm flex flex-col items-center space-y-6 mt-8"
    >
      <div
        data-testid="breathing-disc"
        className={`w-16 h-16 rounded-full bg-calm-sage flex items-center justify-center ${reducedMotion ? 'opacity-80' : 'animate-breathing'}`}
      >
        <Sparkles className="w-8 h-8 text-deep-pine" />
      </div>

      <div className="text-center space-y-1">
        <h3 className="font-serif text-xl font-bold text-deep-pine dark:text-calm-sage">Thinking it through…</h3>
        <p className="font-sans text-xs text-ink dark:text-ink opacity-70">Here's what I'm working on.</p>
      </div>

      {/* Reasoning trace — builds one line at a time */}
      <div className="w-full max-w-sm space-y-2.5">
        {steps.slice(0, active + 1).map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <div key={i} className="flex items-start gap-3 animate-fade-in">
              <span className="mt-0.5 flex-shrink-0">
                {done ? (
                  <span className="w-4 h-4 rounded-full bg-calm-sage/90 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-paper dark:text-deep-pine" />
                  </span>
                ) : (
                  <span className={`block w-4 h-4 rounded-full border-2 border-calm-sage ${current && !reducedMotion ? 'animate-pulse' : ''}`}>
                    <span className="block w-1.5 h-1.5 rounded-full bg-calm-sage m-[3px]" />
                  </span>
                )}
              </span>
              <span
                className={`text-sm font-sans leading-snug transition-colors ${
                  done ? 'text-ink/50 dark:text-ink/50' : 'text-ink dark:text-ink font-medium'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
