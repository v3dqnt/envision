'use client';

import React, { useState } from 'react';
import { PenLine, Copy, Check, Download, RefreshCw, X, Mail, Send } from 'lucide-react';

interface ResponseDraftProps {
  documentText: string | null;
  documentImageUrl: string | null;
  analysis: string; // the advisor's analysis, so the draft makes the right asks
  onClose: () => void;
}

type Tone = 'normal' | 'firm';

export default function ResponseDraft({ documentText, documentImageUrl, analysis, onClose }: ResponseDraftProps) {
  const [tone, setTone] = useState<Tone>('normal');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instructions, setInstructions] = useState('');

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText, documentImageUrl, analysis, tone, instructions }),
      });
      const data = await res.json();
      if (data.draft) setDraft(data.draft);
    } catch (err) {
      console.error('Draft generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([draft], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'envis-response.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Split the draft into a subject line + body, and find the recipient.
  const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
  const recipient = documentText?.match(EMAIL_RE)?.[0] || draft.match(EMAIL_RE)?.[0] || '';
  const { subject, body } = (() => {
    const lines = draft.split('\n');
    const subjIdx = lines.findIndex((l, i) => i < 4 && /^subject\s*:/i.test(l.trim()));
    if (subjIdx >= 0) {
      return {
        subject: lines[subjIdx].replace(/^subject\s*:/i, '').trim(),
        body: lines.slice(subjIdx + 1).join('\n').trim(),
      };
    }
    const firstIdx = lines.findIndex((l) => l.trim());
    return {
      subject: lines[firstIdx]?.trim() || 'Regarding my account',
      body: lines.slice(firstIdx + 1).join('\n').trim() || draft,
    };
  })();

  // Open the user's own Gmail compose, prefilled — they review and send.
  const sendViaGmail = () => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'noopener');
  };

  const openInEmailApp = () => {
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="bg-surface/80 dark:bg-surface/70 backdrop-blur-xl rounded-3xl shadow-calm p-5 mb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-soft-clay/20 flex items-center justify-center">
            <PenLine className="w-4 h-4 text-soft-clay" />
          </div>
          <div>
            <p className="font-serif font-bold text-sm text-deep-pine dark:text-calm-sage leading-tight">Draft a response</p>
            <p className="text-2xs font-sans text-ink dark:text-ink opacity-60">A ready-to-send message, tailored to your document</p>
          </div>
        </div>
        <button onClick={onClose} className="text-ink/50 hover:text-soft-clay transition-colors" aria-label="Close draft">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tone toggle */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xs font-semibold uppercase tracking-wider text-ink/60 font-sans">Tone</span>
        {(['normal', 'firm'] as Tone[]).map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`text-xs font-semibold rounded-full px-3.5 py-1.5 transition-all duration-200 font-sans ${
              tone === t
                ? 'bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine shadow-calm'
                : 'bg-paper dark:bg-paper text-ink/70 hover:bg-warm-sand dark:hover:bg-mist'
            }`}
          >
            {t === 'normal' ? 'Polite' : 'Firm'}
          </button>
        ))}
      </div>

      {/* Optional steer */}
      <input
        type="text"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Anything to add? e.g. ‘ask them to call me, not email’ (optional)"
        className="w-full bg-paper dark:bg-paper rounded-2xl px-4 py-2.5 text-sm text-ink dark:text-ink font-sans focus:outline-none focus:ring-1 focus:ring-calm-sage placeholder:text-ink/40 mb-3"
      />

      {!draft && (
        <button
          onClick={generate}
          disabled={loading}
          className="w-full bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine font-semibold py-3 rounded-2xl shadow-calm hover:shadow-calm-hover hover:opacity-90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 font-sans text-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Writing it for you…
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4" /> Write my response
            </>
          )}
        </button>
      )}

      {draft && (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={12}
            className="w-full bg-paper dark:bg-paper rounded-2xl p-4 text-sm text-ink dark:text-ink font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-calm-sage resize-y"
          />
          {recipient && (
            <p className="text-2xs text-ink/60 font-sans px-1">
              Sends to <span className="font-semibold text-deep-pine dark:text-calm-sage">{recipient}</span> from your own email — you review and hit send.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={sendViaGmail}
              className="flex items-center gap-1.5 text-xs font-semibold bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine rounded-full px-4 py-2 hover:opacity-90 active:scale-95 transition-all font-sans"
            >
              <Send className="w-3.5 h-3.5" /> Send via Gmail
            </button>
            <button
              onClick={openInEmailApp}
              className="flex items-center gap-1.5 text-xs font-semibold bg-paper dark:bg-paper text-ink/80 rounded-full px-4 py-2 hover:bg-warm-sand dark:hover:bg-mist transition-all font-sans"
            >
              <Mail className="w-3.5 h-3.5" /> Email app
            </button>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-xs font-semibold bg-paper dark:bg-paper text-ink/80 rounded-full px-4 py-2 hover:bg-warm-sand dark:hover:bg-mist transition-all font-sans"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={download}
              className="flex items-center gap-1.5 text-xs font-semibold bg-paper dark:bg-paper text-ink/80 rounded-full px-4 py-2 hover:bg-warm-sand dark:hover:bg-mist transition-all font-sans"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold bg-paper dark:bg-paper text-ink/80 rounded-full px-4 py-2 hover:bg-warm-sand dark:hover:bg-mist transition-all font-sans disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
