'use client';

import React from 'react';
import { CalendarClock } from 'lucide-react';

interface DeadlineBannerProps {
  deadline: string; // ISO date
  label?: string;
}

export default function DeadlineBanner({ deadline, label }: DeadlineBannerProps) {
  const due = new Date(deadline + 'T00:00:00');
  if (isNaN(due.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);

  // Calm, never alarmist — amber tones, no red, no countdown-clock pressure.
  const when =
    days < 0 ? 'This date has passed' : days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} days`;
  const dateStr = due.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-attention/15 border border-attention/30">
      <div className="w-9 h-9 rounded-full bg-attention/25 flex items-center justify-center flex-shrink-0">
        <CalendarClock className="w-4 h-4 text-attention" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-deep-pine dark:text-attention">
          {when}
          <span className="font-normal text-ink/60 dark:text-ink/60"> · {dateStr}</span>
        </p>
        {label && <p className="text-2xs text-ink/70 dark:text-ink/70 font-sans truncate">{label}</p>}
      </div>
    </div>
  );
}
