'use client';

import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { Sparkles, Info, AlertCircle, KeyRound, ZoomIn, X } from 'lucide-react';

export interface AnnotationData {
  natural: { w: number; h: number };
  lines: AnnotatedLine[];
}

interface AnnotatedDocumentProps {
  imageUrl: string; // base64 data URL of an image
  analysisContext?: string; // the advisor's chat analysis, to align highlights
  saved?: AnnotationData | null; // cached result — skip OCR/LLM if present
  onComputed?: (data: AnnotationData) => void; // fired once after a fresh compute
}

type Importance = 'key' | 'review' | 'fair';

interface AnnotatedLine {
  id: string;
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  meaning?: string;
  importance?: Importance;
}

type Phase = 'reading' | 'explaining' | 'ready' | 'error';

// Explicit hex (not Tailwind opacity-on-var, which silently drops) so the
// blue / yellow / green highlights actually render over the document image.
const COLORS: Record<Importance, { base: string; label: string; icon: React.ReactNode }> = {
  key: { base: '#378ADD', label: 'Key fact', icon: <KeyRound className="w-3.5 h-3.5" /> },
  review: { base: '#E0A030', label: 'Worth a look', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  fair: { base: '#5FA873', label: 'Looks fair', icon: <Info className="w-3.5 h-3.5" /> },
};

export default function AnnotatedDocument({ imageUrl, analysisContext, saved, onComputed }: AnnotatedDocumentProps) {
  const [lines, setLines] = useState<AnnotatedLine[]>([]);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [phase, setPhase] = useState<Phase>('reading');
  const [activeId, setActiveId] = useState<string | null>(null); // hovered or tapped
  const [pinnedId, setPinnedId] = useState<string | null>(null); // tapped (sticky)
  const [zoomed, setZoomed] = useState(false); // full-screen preview of the exact input
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    setPhase('reading');
    setLines([]);
    setActiveId(null);
    setPinnedId(null);

    // Reuse cached annotations — no OCR, no LLM call, no token cost.
    if (saved && Array.isArray(saved.lines) && saved.lines.length > 0 && saved.natural) {
      setNatural(saved.natural);
      setLines(saved.lines);
      setPhase('ready');
      return;
    }

    async function run() {
      try {
        const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = reject;
          img.src = imageUrl;
        });
        if (cancelled.current) return;
        setNatural(dims);

        const result = await Tesseract.recognize(imageUrl, 'eng');
        if (cancelled.current) return;

        const ocrLines: AnnotatedLine[] = (result.data.lines || [])
          .map((l, i) => ({ id: `line-${i}`, text: (l.text || '').trim(), bbox: l.bbox }))
          .filter((l) => l.text.length > 1);

        if (ocrLines.length === 0) {
          setPhase('error');
          return;
        }
        setLines(ocrLines);

        setPhase('explaining');
        const fullText = ocrLines.map((l) => l.text).join('\n');
        const res = await fetch('/api/annotate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lines: ocrLines.map((l) => ({ id: l.id, text: l.text })),
            fullText,
            analysisContext,
          }),
        });
        const data = await res.json();
        if (cancelled.current) return;

        let mergedLines = ocrLines;
        if (Array.isArray(data.annotations)) {
          const byId = new Map<string, { meaning: string; importance: Importance }>(
            data.annotations.map((a: { id: string; meaning: string; importance: Importance }) => [
              a.id,
              { meaning: a.meaning, importance: a.importance },
            ])
          );
          mergedLines = ocrLines.map((l) => {
            const a = byId.get(l.id);
            return a ? { ...l, meaning: a.meaning, importance: a.importance } : { ...l, importance: 'fair' as const };
          });
          setLines(mergedLines);
        }
        setPhase('ready');
        // Persist the finished result so it's never recomputed.
        onComputed?.({ natural: dims, lines: mergedLines });
      } catch (err) {
        console.error('Annotation failed:', err);
        if (!cancelled.current) setPhase('error');
      }
    }

    run();
    return () => {
      cancelled.current = true;
    };
  }, [imageUrl]);

  const shownId = pinnedId || activeId;
  const shown = lines.find((l) => l.id === shownId) || null;
  const flagCount = lines.filter((l) => l.importance === 'review').length;

  // Even if OCR/annotation fails, we still show the exact image we sent to the
  // AI — so a viewer can always verify what ENVIS actually read.

  return (
    <div className="bg-surface dark:bg-surface rounded-3xl shadow-calm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-calm-sage/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-deep-pine dark:text-calm-sage" />
          </div>
          <div>
            <p className="font-serif font-bold text-sm text-deep-pine dark:text-calm-sage">The document ENVIS read</p>
            <p className="text-2xs font-sans text-ink dark:text-ink opacity-70">
              {phase === 'ready'
                ? 'Hover a highlighted line — or click the image to enlarge'
                : phase === 'explaining'
                ? 'Working out what each line means…'
                : phase === 'error'
                ? 'Click the image to enlarge and read it in full'
                : 'Reading the document…'}
            </p>
          </div>
        </div>
        {phase === 'ready' && flagCount > 0 && (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5"
            style={{ background: `${COLORS.review.base}22`, color: '#8a5a00' }}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {flagCount} to look at
          </span>
        )}
      </div>

      <div className="px-4 md:px-6 pb-5 space-y-4">
        {/* Image with overlay */}
        <div className="relative inline-block w-full" onMouseLeave={() => setActiveId(null)}>
          <img
            src={imageUrl}
            alt="The exact document sent to ENVIS"
            onClick={() => setZoomed(true)}
            className="w-full h-auto rounded-2xl border border-mist dark:border-mist select-none cursor-zoom-in"
          />

          {/* Enlarge hint */}
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5 text-2xs font-semibold bg-paper/90 dark:bg-surface/90 backdrop-blur text-deep-pine dark:text-calm-sage rounded-full px-2.5 py-1.5 shadow-calm hover:shadow-calm-hover transition-all"
            aria-label="Enlarge document"
          >
            <ZoomIn className="w-3.5 h-3.5" /> Enlarge
          </button>

          {(phase === 'reading' || phase === 'explaining') && (
            <div className="absolute inset-0 rounded-2xl bg-paper/50 dark:bg-paper/60 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-calm-sage flex items-center justify-center animate-breathing">
                  <Sparkles className="w-7 h-7 text-deep-pine" />
                </div>
                <p className="text-xs font-semibold text-deep-pine dark:text-calm-sage font-sans">
                  {phase === 'explaining' ? 'Explaining each line…' : 'Reading carefully…'}
                </p>
              </div>
            </div>
          )}

          {/* Highlighter bars */}
          {phase === 'ready' &&
            natural &&
            lines.map((l) => {
              const c = COLORS[l.importance || 'fair'];
              const left = (l.bbox.x0 / natural.w) * 100;
              const top = (l.bbox.y0 / natural.h) * 100;
              const width = ((l.bbox.x1 - l.bbox.x0) / natural.w) * 100;
              const height = ((l.bbox.y1 - l.bbox.y0) / natural.h) * 100;
              const isActive = l.id === shownId;
              return (
                <div
                  key={l.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${c.label}: ${l.text}`}
                  onMouseEnter={() => setActiveId(l.id)}
                  onFocus={() => setActiveId(l.id)}
                  onClick={() => setPinnedId(pinnedId === l.id ? null : l.id)}
                  className="absolute cursor-pointer rounded-[3px] transition-all duration-150"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    background: isActive ? `${c.base}59` : `${c.base}33`,
                    boxShadow: isActive ? `inset 0 0 0 1.5px ${c.base}, 0 1px 6px ${c.base}66` : `inset 0 -2px 0 0 ${c.base}`,
                    zIndex: isActive ? 30 : 10,
                  }}
                />
              );
            })}

          {/* Hover chat-bubble */}
          {phase === 'ready' && natural && shown && (() => {
            const c = COLORS[shown.importance || 'fair'];
            const leftPct = (shown.bbox.x0 / natural.w) * 100;
            const bottomEdge = (shown.bbox.y1 / natural.h) * 100;
            const topEdge = (shown.bbox.y0 / natural.h) * 100;
            const placeAbove = bottomEdge > 62; // flip up near the bottom
            const clampedLeft = Math.min(leftPct, 52);
            const pos: React.CSSProperties = placeAbove
              ? { left: `${clampedLeft}%`, bottom: `${100 - topEdge}%`, marginBottom: '8px' }
              : { left: `${clampedLeft}%`, top: `${bottomEdge}%`, marginTop: '8px' };
            return (
              <div
                className="absolute z-40 w-[min(280px,72vw)] pointer-events-none animate-fade-in"
                style={pos}
              >
                <div
                  className="rounded-2xl bg-paper dark:bg-surface shadow-calm-hover p-3.5"
                  style={{ borderTop: `3px solid ${c.base}` }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider rounded-full px-2.5 py-1 mb-2"
                    style={{ background: `${c.base}22`, color: c.base }}
                  >
                    {c.icon}
                    {c.label}
                  </span>
                  <p className="text-xs font-mono text-ink/60 dark:text-ink/60 leading-snug mb-1.5 line-clamp-2">
                    “{shown.text}”
                  </p>
                  <p className="text-sm text-ink dark:text-ink leading-relaxed font-sans">
                    {shown.meaning || 'A routine line — nothing to worry about here.'}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Legend */}
        {phase === 'ready' && (
          <div className="flex flex-wrap items-center gap-4 text-2xs font-sans text-ink dark:text-ink opacity-80">
            {(['key', 'review', 'fair'] as Importance[]).map((imp) => (
              <span key={imp} className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-3.5 rounded" style={{ background: `${COLORS[imp].base}59`, boxShadow: `inset 0 -2px 0 0 ${COLORS[imp].base}` }} />
                {COLORS[imp].label}
              </span>
            ))}
            <span className="opacity-60">· tap a line to pin it</span>
          </div>
        )}
      </div>

      {/* Full-screen preview — judges/viewers can read the exact input */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setZoomed(false)}
            aria-label="Close preview"
          >
            <X className="w-7 h-7" />
          </button>
          <img
            src={imageUrl}
            alt="The exact document sent to ENVIS, full size"
            className="max-w-full max-h-[92vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
