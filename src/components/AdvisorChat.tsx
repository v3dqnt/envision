'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Send, Sparkles, User, RotateCcw, PenLine, Languages, Paperclip, X, FileText, Scale, Type } from 'lucide-react';
import { ChatMessage } from '@/context/DocumentContext';
import ResponseDraft from '@/components/ResponseDraft';

export interface Attachment {
  name: string;
  kind: 'image' | 'text';
  dataUrl?: string; // for images
  text?: string; // for text/email files
}

interface AdvisorChatProps {
  history: ChatMessage[];
  onSend: (message: string, attachments?: Attachment[]) => Promise<void>;
  loading: boolean;
  onReset: () => void;
  documentCategory: string;
  documentText: string | null;
  documentImageUrl: string | null;
  onResearch?: () => Promise<void>;
  researching?: boolean;
}

const LANGUAGES = ['English', 'Simple English', 'Spanish', 'Tamil', 'Hindi', 'Telugu', 'Bengali', 'French', 'Arabic', 'Chinese'];

// Map a browser language code (e.g. "es-MX") to one of our supported languages.
const BROWSER_LANG: Record<string, string> = {
  es: 'Spanish', ta: 'Tamil', hi: 'Hindi', te: 'Telugu', bn: 'Bengali', fr: 'French', ar: 'Arabic', zh: 'Chinese',
};
const NATIVE_LABEL: Record<string, string> = {
  Spanish: 'Ver en español', Tamil: 'தமிழில் காண்க', Hindi: 'हिंदी में देखें', Telugu: 'తెలుగులో చూడండి',
  Bengali: 'বাংলায় দেখুন', French: 'Voir en français', Arabic: 'عرض بالعربية', Chinese: '用中文查看',
};

// Simple markdown renderer for the AI messages
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="font-serif font-bold text-base text-deep-pine dark:text-calm-sage mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="font-serif font-bold text-lg text-deep-pine dark:text-calm-sage mt-4 mb-1">{line.slice(3)}</h2>);
    } else if (line.match(/^\*\*(.+)\*\*$/)) {
      elements.push(<p key={key++} className="font-semibold text-deep-pine dark:text-calm-sage mt-2">{line.replace(/\*\*/g, '')}</p>);
    } else if (line.match(/^(\d+)\.\s/)) {
      elements.push(
        <div key={key++} className="flex gap-2 mt-2">
          <span className="font-bold text-deep-pine dark:text-calm-sage min-w-[1.25rem]">{line.match(/^(\d+)/)![1]}.</span>
          <span className="text-ink dark:text-ink leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\.\s/, '')) }} />
        </div>
      );
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={key++} className="flex gap-2 mt-1.5">
          <span className="text-calm-sage mt-1 min-w-[0.5rem]">•</span>
          <span className="text-ink dark:text-ink leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        </div>
      );
    } else if (line.startsWith('> ') || line.startsWith('"')) {
      elements.push(
        <div key={key++} className="mt-3 pl-4 border-l-2 border-calm-sage/50 bg-calm-sage/5 rounded-r-lg py-2 pr-3">
          <p className="text-sm text-ink dark:text-ink italic leading-relaxed font-sans">{line.replace(/^>\s?/, '').replace(/^"/, '').replace(/"$/, '')}</p>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p key={key++} className="text-ink dark:text-ink leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    }
  }

  return elements;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-deep-pine">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-mist/50 px-1 rounded text-xs font-mono">$1</code>');
}

export default function AdvisorChat({ history, onSend, loading, onReset, documentCategory, documentText, documentImageUrl, onResearch, researching }: AdvisorChatProps) {
  const [input, setInput] = useState('');
  const [showDraft, setShowDraft] = useState(false);
  const [language, setLanguage] = useState('English');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [readable, setReadable] = useState(false); // larger, easier-to-read text
  const [suggestedLang, setSuggestedLang] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputBarRef = useRef<HTMLFormElement>(null);
  const prevCount = useRef(0);
  const reduced = useRef(false);

  const categoryLabel = {
    medical: 'Medical Bill',
    discharge: 'Discharge Instructions',
    eviction: 'Eviction Notice',
    debt: 'Debt Collection',
    school: 'School Notice',
    government: 'Government Letter',
    food: 'Food Assistance',
    housing: 'Housing Document',
    other: 'Document',
  }[documentCategory] || 'Document';

  const analysis = history.find((m) => m.role === 'assistant')?.content || '';

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced.current && inputBarRef.current) {
      gsap.from(inputBarRef.current, { y: 16, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }
    // Offer the user's own language if the browser hints at a non-English one.
    const code = (navigator.language || '').slice(0, 2).toLowerCase();
    const lang = BROWSER_LANG[code];
    if (lang) setSuggestedLang(lang);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reduced.current ? 'auto' : 'smooth' });

    if (!reduced.current && listRef.current && history.length > prevCount.current) {
      const nodes = listRef.current.querySelectorAll('[data-msg]');
      const fresh = Array.from(nodes).slice(prevCount.current);
      if (fresh.length) {
        gsap.from(fresh, { y: 18, opacity: 0, duration: 0.45, ease: 'power3.out', stagger: 0.08 });
      }
    }
    prevCount.current = history.length;
  }, [history, loading]);

  // Translate assistant messages on demand when a non-English language is picked.
  useEffect(() => {
    if (language === 'English') return;
    let cancelled = false;
    const toTranslate = history
      .map((m, idx) => ({ m, idx }))
      .filter(({ m, idx }) => m.role === 'assistant' && !translations[`${idx}::${language}`]);
    if (toTranslate.length === 0) return;

    setTranslating(true);
    (async () => {
      for (const { m, idx } of toTranslate) {
        try {
          const res = await fetch('/api/localize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: m.content, language }),
          });
          const data = await res.json();
          if (cancelled) return;
          if (data.translation) {
            setTranslations((prev) => ({ ...prev, [`${idx}::${language}`]: data.translation }));
          }
        } catch (err) {
          console.error('Translation failed:', err);
        }
      }
      if (!cancelled) setTranslating(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [language, history]); // eslint-disable-line react-hooks/exhaustive-deps

  const processFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          isImage
            ? { name: file.name, kind: 'image', dataUrl: result }
            : { name: file.name, kind: 'text', text: result },
        ]);
      };
      if (isImage) reader.readAsDataURL(file);
      else reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || loading) return;
    const toSend = trimmed || 'I attached another file — take a look and tell me what you make of it.';
    const atts = attachments;
    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await onSend(toSend, atts);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="relative flex flex-col">
      {/* Control strip — lives ABOVE the box, so the box itself has no chin */}
      <div className="flex items-center justify-between px-1 mb-3 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-calm-sage/90 flex items-center justify-center shadow-calm flex-shrink-0">
            <Sparkles className="w-4 h-4 text-deep-pine" />
          </div>
          <p className="font-serif font-bold text-sm text-deep-pine dark:text-calm-sage truncate">ENVIS Advisor</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {analysis && onResearch && (
            <button
              type="button"
              onClick={onResearch}
              disabled={researching}
              title="Search this institution's policies & your rights"
              className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all duration-200 font-sans text-ink/70 dark:text-ink/70 hover:bg-calm-sage/15 hover:text-deep-pine dark:hover:text-calm-sage disabled:opacity-50"
            >
              <Scale className={`w-3.5 h-3.5 ${researching ? 'animate-pulse' : ''}`} />
              {researching ? 'Researching…' : 'My rights'}
            </button>
          )}
          {analysis && (
            <button
              type="button"
              onClick={() => setShowDraft((s) => !s)}
              className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all duration-200 font-sans ${
                showDraft
                  ? 'bg-soft-clay/20 text-soft-clay'
                  : 'text-ink/70 dark:text-ink/70 hover:bg-warm-sand/60 dark:hover:bg-mist/30 hover:text-soft-clay'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              Draft
            </button>
          )}
          {/* Readable / larger-text toggle (accessibility) */}
          <button
            type="button"
            onClick={() => setReadable((r) => !r)}
            aria-pressed={readable}
            title="Easier-to-read text"
            className={`flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1.5 transition-all duration-200 font-sans ${
              readable ? 'bg-calm-sage/20 text-deep-pine dark:text-calm-sage' : 'text-ink/70 dark:text-ink/70 hover:bg-warm-sand/60 dark:hover:bg-mist/30'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
          </button>
          {/* Language selector */}
          <div className="relative flex items-center">
            <Languages className="w-3.5 h-3.5 text-ink/50 absolute left-2.5 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Translate the advisor's replies"
              className="appearance-none bg-surface/70 dark:bg-surface/60 backdrop-blur text-xs font-semibold text-ink/80 dark:text-ink/80 font-sans rounded-full pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-calm-sage cursor-pointer hover:bg-warm-sand/60 dark:hover:bg-mist/30 transition-colors"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={onReset}
            title="Start over with a new document"
            className="flex items-center gap-1.5 text-xs font-semibold text-ink/70 dark:text-ink/70 hover:text-soft-clay transition-colors duration-300 font-sans rounded-full px-3 py-1.5 hover:bg-warm-sand/60 dark:hover:bg-mist/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </div>

      {/* Offer the reader's own language (browser-detected) */}
      {suggestedLang && language !== suggestedLang && (
        <button
          type="button"
          onClick={() => { setLanguage(suggestedLang); setSuggestedLang(null); }}
          className="mb-3 flex items-center justify-center gap-2 w-full text-xs font-semibold text-deep-pine dark:text-calm-sage bg-calm-sage/15 hover:bg-calm-sage/25 rounded-2xl py-2.5 transition-colors font-sans"
        >
          <Languages className="w-3.5 h-3.5" />
          {NATIVE_LABEL[suggestedLang] || `View in ${suggestedLang}`}
          <span className="opacity-60">· tap to translate</span>
        </button>
      )}

      {/* The box — messages + floating input, no header/chin inside */}
      <div className="flex flex-col bg-surface/50 dark:bg-surface/40 backdrop-blur-md rounded-[28px] shadow-calm border border-mist/40 dark:border-mist/25 p-3 md:p-4">
      {/* Messages */}
      <div ref={listRef} className={`flex flex-col gap-5 px-1 py-1 max-h-[52vh] overflow-y-auto scroll-smooth ${readable ? '[&_p]:!text-base [&_span]:!text-base [&_li]:!text-base [&_*]:!leading-loose tracking-[0.015em]' : ''}`}>
        {history.map((msg, idx) => {
          const translated = language !== 'English' ? translations[`${idx}::${language}`] : undefined;
          const content = translated ?? msg.content;
          const isTranslating = language !== 'English' && msg.role === 'assistant' && !translated && translating;
          return (
            <div key={idx} data-msg className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'assistant' ? (
                <div className="w-8 h-8 rounded-full bg-calm-sage/20 dark:bg-calm-sage/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-deep-pine dark:text-calm-sage" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-deep-pine/90 dark:bg-calm-sage/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-paper dark:text-calm-sage" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm font-sans transition-shadow duration-300 ${
                  msg.role === 'assistant'
                    ? 'bg-surface/80 dark:bg-surface/70 backdrop-blur-md text-ink dark:text-ink shadow-calm rounded-tl-lg'
                    : 'bg-deep-pine dark:bg-deep-pine/80 text-paper shadow-calm rounded-tr-lg'
                }`}
              >
                {msg.role === 'assistant' ? (
                  isTranslating ? (
                    <p className="text-ink/50 italic text-sm">Translating to {language}…</p>
                  ) : (
                    <div className="space-y-1">{renderMarkdown(content)}</div>
                  )
                ) : (
                  <p className="leading-relaxed">{content}</p>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div data-msg className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-calm-sage/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-deep-pine dark:text-calm-sage" />
            </div>
            <div className="bg-surface/80 dark:bg-surface/70 backdrop-blur-md rounded-3xl rounded-tl-lg px-5 py-4 shadow-calm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-calm-sage animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-calm-sage animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-calm-sage animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Draft panel — inside the box, above the input */}
      {showDraft && (
        <div className="mt-3">
          <ResponseDraft
            documentText={documentText}
            documentImageUrl={documentImageUrl}
            analysis={analysis}
            onClose={() => setShowDraft(false)}
          />
        </div>
      )}

      {/* Floating input — sits inside the box, no chin */}
      <form ref={inputBarRef} onSubmit={handleSubmit} className="mt-3">
        <div className="flex flex-col gap-2 bg-paper/90 dark:bg-paper/80 rounded-[24px] shadow-calm hover:shadow-calm-hover focus-within:shadow-calm-hover transition-shadow duration-300 p-2">
          {/* Attachment chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-1">
              {attachments.map((a, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-calm-sage/15 text-deep-pine dark:text-calm-sage text-2xs font-semibold font-sans rounded-full pl-2 pr-1.5 py-1 max-w-[180px]">
                  {a.kind === 'image' ? <Paperclip className="w-3 h-3 flex-shrink-0" /> : <FileText className="w-3 h-3 flex-shrink-0" />}
                  <span className="truncate">{a.name}</span>
                  <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))} className="hover:text-soft-clay flex-shrink-0" aria-label="Remove attachment">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.txt,.eml,.md,.csv"
              multiple
              onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ''; }}
              className="hidden"
              aria-label="Attach files"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach a document, email, or screenshot"
              className="w-10 h-10 rounded-full text-ink/50 hover:text-deep-pine dark:hover:text-calm-sage hover:bg-warm-sand/60 dark:hover:bg-mist/30 flex items-center justify-center transition-all flex-shrink-0"
              aria-label="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up, or attach a file…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-ink dark:text-ink text-sm font-sans focus:outline-none leading-relaxed py-2.5 placeholder:text-ink/40"
              style={{ minHeight: '24px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || loading}
              className="w-11 h-11 rounded-full bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine flex items-center justify-center shadow-calm hover:opacity-90 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
      </div>
      <div className="mt-2.5 text-center space-y-0.5">
        <p className="text-2xs text-ink dark:text-ink opacity-40 font-sans">
          ENVIS remembers your document — ask anything specific
        </p>
        <p className="text-2xs text-ink dark:text-ink opacity-40 font-sans">
          ENVIS explains and suggests — it doesn&rsquo;t make legal, medical, or financial decisions. You stay in control and decide what to do.
        </p>
      </div>
    </div>
  );
}
