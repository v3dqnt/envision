'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Upload, Sparkles, Paperclip, X, Check, MapPin } from 'lucide-react';
import SupportMap from '@/components/SupportMap';
import EligibilityFinder from '@/components/EligibilityFinder';
import ThinkingProcess from '@/components/ThinkingProcess';
import ReadabilityCard from '@/components/ReadabilityCard';
import DeadlineBanner from '@/components/DeadlineBanner';
import ShareSummary from '@/components/ShareSummary';
import { PRESET_DATA } from '@/lib/data';
import { useDocument, ChatMessage, type DocumentCategory } from '@/context/DocumentContext';
import { useAuth } from '@/context/AuthContext';
import { createThread, addMessage, saveThreadAnnotations, updateThreadMeta } from '@/lib/threads';
import AdvisorChat, { type Attachment } from '@/components/AdvisorChat';
import AnnotatedDocument from '@/components/AnnotatedDocument';

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  const {
    documentCategory,
    setDocumentCategory,
    conversationHistory,
    setConversationHistory,
    documentText,
    setDocumentText,
    documentImageUrl,
    setDocumentImageUrl,
    documentAnnotations,
    setDocumentAnnotations,
    documentMeta,
    setDocumentMeta,
    threads,
    currentThreadId,
    setCurrentThreadId,
    refreshThreads,
    startNewThread,
  } = useDocument();

  const { user, configured, session } = useAuth();
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);

  const summarizeCreated = (created?: { reminders: string[]; todos: string[] }) => {
    if (!created) return;
    const parts: string[] = [];
    if (created.todos?.length) parts.push(`${created.todos.length} to-do${created.todos.length > 1 ? 's' : ''}`);
    if (created.reminders?.length) parts.push(`${created.reminders.length} reminder${created.reminders.length > 1 ? 's' : ''}`);
    if (parts.length) {
      setActionNotice(`Added ${parts.join(' and ')} to your Reminders page`);
      setTimeout(() => setActionNotice(null), 6000);
    }
  };

  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; base64: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasStartedChat = conversationHistory.length > 0;

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'night-calm');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  // Detect document category from text (drives the label; the advisor handles
  // content regardless). Ordered most-specific first.
  const detectCategory = (text: string): DocumentCategory => {
    const lower = text.toLowerCase();
    const has = (...words: string[]) => words.some((w) => lower.includes(w));
    if (has('evict', 'tenant', 'landlord', 'vacate', 'lease')) return 'eviction';
    if (has('debt collect', 'collector', 'collection agency', 'creditor', 'amount owed')) return 'debt';
    if (has('snap', 'ebt', 'food stamp', 'wic', 'food assistance', 'nutrition assistance')) return 'food';
    if (has('section 8', 'housing authority', 'hud', 'rental assistance', 'voucher', 'public housing')) return 'housing';
    if (has('school', 'student', 'principal', 'truancy', 'attendance', 'enrollment', 'permission slip', 'iep', 'district')) return 'school';
    if (has('discharge', 'aftercare', 'follow-up appointment', 'medication', 'dosage', 'wound care')) return 'discharge';
    if (has('medicaid', 'medicare', 'social security', 'benefits', 'department of', 'uscis', 'immigration', 'irs', 'notice of')) return 'government';
    if (has('bill', 'hospital', 'medical', 'patient', 'insurance', 'invoice', 'charges')) return 'medical';
    return 'other';
  };

  // Build a short, human title for a thread from the document.
  const deriveTitle = (text?: string, category?: string): string => {
    const label =
      ({
        medical: 'Medical bill',
        discharge: 'Discharge instructions',
        eviction: 'Eviction notice',
        debt: 'Debt collection',
        school: 'School notice',
        government: 'Government letter',
        food: 'Food assistance',
        housing: 'Housing document',
        other: 'Document',
      } as Record<string, string>)[category || 'other'] || 'Document';
    const firstLine = text?.split('\n').map((l) => l.trim()).find((l) => l.length > 3);
    if (firstLine) return firstLine.slice(0, 60);
    return `${label} · ${new Date().toLocaleDateString()}`;
  };

  // Sensible fallback for which help tools fit, if the meta call fails.
  const fallbackMeta = (category: string) => ({
    suggestSupport: ['food', 'housing', 'eviction', 'medical', 'discharge', 'government'].includes(category),
    suggestEligibility: ['food', 'housing', 'medical', 'discharge', 'government', 'debt'].includes(category),
  });

  // Initial analysis — sends document to API and gets first AI message
  const startConversation = async (text?: string, imageUrl?: string) => {
    setLoading(true);
    setShowSupport(false);
    setShowEligibility(false);
    setDocumentMeta(null);

    try {
      const category = text ? detectCategory(text) : documentCategory;
      setDocumentText(text || null);
      setDocumentImageUrl(imageUrl || null);

      // Create the thread first so any reminders/todos the advisor makes link to it.
      let threadId: string | undefined;
      if (configured && user) {
        const thread = await createThread({
          title: deriveTitle(text, category),
          category,
          documentText: text || null,
          documentImageUrl: imageUrl || null,
        });
        if (thread) {
          threadId = thread.id;
          setCurrentThreadId(thread.id);
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          documentText: text || undefined,
          documentImageUrl: imageUrl || undefined,
          accessToken: session?.access_token,
          threadId,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const firstMessage: ChatMessage = { role: 'assistant', content: data.reply };
        setConversationHistory([firstMessage]);
        summarizeCreated(data.created);

        if (threadId) {
          await addMessage(threadId, firstMessage);
          refreshThreads();
        }

        // Content-aware title + which help tools are relevant to this problem.
        try {
          const metaRes = await fetch('/api/thread-meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentText: text, analysis: data.reply, category }),
          });
          const m = await metaRes.json();
          const meta = {
            suggestSupport: !!m.suggestSupport,
            suggestEligibility: !!m.suggestEligibility,
            deadline: m.deadline || '',
            deadlineLabel: m.deadlineLabel || '',
          };
          setDocumentMeta(meta);
          if (threadId) {
            await updateThreadMeta(threadId, { title: m.title || undefined, meta });
            refreshThreads();
          }
        } catch {
          setDocumentMeta(fallbackMeta(category));
        }
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const [researching, setResearching] = useState(false);

  // Run the LangGraph research agent and append its briefing as a message.
  const runResearchAgent = async () => {
    if (researching) return;
    const analysis = conversationHistory.find((m) => m.role === 'assistant')?.content || '';
    setResearching(true);
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: documentText || undefined, analysis }),
      });
      const data = await response.json();
      const report = data.report || (data.error ? `I couldn't complete the research: ${data.error}` : null);
      if (report) {
        const msg: ChatMessage = { role: 'assistant', content: report };
        setConversationHistory((prev) => [...prev, msg]);
        if (configured && user && currentThreadId) {
          await addMessage(currentThreadId, msg);
          refreshThreads();
        }
      }
    } catch (err) {
      console.error('Research failed:', err);
    } finally {
      setResearching(false);
    }
  };

  // Send follow-up message
  const sendMessage = async (userMessage: string, attachments?: Attachment[]) => {
    // Note attached filenames in the visible/stored message for context.
    const fileNote = attachments?.length ? `\n\n📎 ${attachments.map((a) => a.name).join(', ')}` : '';
    const displayMessage = `${userMessage}${fileNote}`;
    const updatedHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: displayMessage },
    ];
    setConversationHistory(updatedHistory);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          // Pass document content on every call for full context
          documentText: documentText || undefined,
          documentImageUrl: documentImageUrl || undefined,
          accessToken: session?.access_token,
          threadId: currentThreadId,
          attachments,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply };
        setConversationHistory([...updatedHistory, assistantMsg]);
        summarizeCreated(data.created);

        // Persist both turns to the current thread's memory.
        if (configured && user && currentThreadId) {
          await addMessage(currentThreadId, { role: 'user', content: displayMessage });
          await addMessage(currentThreadId, assistantMsg);
          refreshThreads();
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasText = inputText.trim();
    const hasFile = attachedFile;
    if (!hasText && !hasFile) return;

    if (hasText) {
      setDocumentCategory(detectCategory(inputText));
    }
    startConversation(hasText ? inputText : undefined, hasFile?.base64 || undefined);
  };

  const handleReset = () => {
    startNewThread();
    setInputText('');
    setAttachedFile(null);
  };

  const processFile = (file: File) => {
    setAttachedFile(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedFile({ name: file.name, base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePresetClick = (category: keyof typeof PRESET_DATA) => {
    setDocumentCategory(category);
    setInputText(PRESET_DATA[category].text);
    startConversation(PRESET_DATA[category].text);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-paper dark:bg-paper transition-colors duration-300" />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper dark:bg-paper text-ink dark:text-ink transition-colors duration-300 font-sans">

      {/* Action toast — confirms reminders/todos the advisor created */}
      {actionNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine text-sm font-semibold font-sans rounded-full pl-4 pr-5 py-3 shadow-calm-hover animate-fade-in">
          <Check className="w-4 h-4" />
          {actionNotice}
        </div>
      )}

      {/* Header — Mobile Only */}
      <header className="md:hidden border-b border-mist dark:border-mist bg-paper/90 dark:bg-paper/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-calm-sage flex items-center justify-center shadow-calm">
              <span className="text-deep-pine dark:text-paper font-serif font-bold text-lg select-none">E</span>
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-deep-pine dark:text-calm-sage">ENVIS</span>
          </div>
          <button
            onClick={toggleTheme}
            data-testid="theme-toggle-btn"
            aria-label="Toggle Night Calm mode"
            className="p-2.5 rounded-full border border-mist dark:border-mist bg-surface dark:bg-surface hover:bg-warm-sand dark:hover:bg-mist text-deep-pine dark:text-calm-sage shadow-calm hover:shadow-calm-hover transition-all duration-300"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-12 flex flex-col justify-center">

        {/* ── BEFORE CHAT: Hero + Unified Input ── */}
        {!hasStartedChat && (
          <div className="space-y-10">
            <section className="text-center space-y-5 max-w-xl mx-auto">
              <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-deep-pine dark:text-calm-sage leading-tight">
                Take a breath.
              </h1>
              <p className="font-sans text-lg text-ink dark:text-ink leading-relaxed max-w-md mx-auto">
                Drop a confusing document below. Your ENVIS advisor will read it and tell you exactly what to do — step by step.
              </p>
            </section>

            {/* Meet Maria — a specific person, one click to see ENVIS help her */}
            <button
              type="button"
              onClick={() => handlePresetClick('food')}
              className="group w-full max-w-xl mx-auto flex items-center gap-4 text-left bg-surface dark:bg-surface border border-mist dark:border-mist rounded-3xl p-4 md:p-5 shadow-calm hover:shadow-calm-hover hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-soft-clay/25 flex items-center justify-center flex-shrink-0 font-serif font-bold text-lg text-deep-pine dark:text-soft-clay">
                M
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm text-ink dark:text-ink leading-relaxed">
                  <span className="font-semibold text-deep-pine dark:text-calm-sage">Meet Maria.</span> She's a single mom who just got a food-assistance notice she can't make sense of — and a deadline she can't afford to miss.
                </p>
                <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-deep-pine dark:text-calm-sage group-hover:gap-2 transition-all">
                  See how ENVIS helps her
                  <span aria-hidden>→</span>
                </span>
              </div>
            </button>

            {/* Unified Input Card */}
            <form
              onSubmit={handleSubmit}
              data-testid="upload-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative bg-surface dark:bg-surface border-2 rounded-3xl p-6 md:p-8 shadow-calm transition-all duration-300 space-y-5 ${
                isDragging
                  ? 'border-calm-sage dark:border-calm-sage bg-calm-sage/5 shadow-calm-hover'
                  : 'border-dashed border-mist dark:border-mist hover:border-calm-sage dark:hover:border-calm-sage'
              }`}
            >
              {/* Drag overlay text */}
              {isDragging && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-calm-sage/10 z-10 pointer-events-none">
                  <Upload className="w-10 h-10 text-calm-sage mb-3" />
                  <p className="font-serif font-bold text-xl text-deep-pine dark:text-calm-sage">Drop it here</p>
                </div>
              )}

              {/* Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink dark:text-ink font-sans opacity-70">
                  Paste document text, or attach a photo/PDF below
                </label>
                <textarea
                  data-testid="manual-text-input"
                  rows={6}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full p-4 border border-mist dark:border-mist rounded-2xl bg-paper dark:bg-paper text-ink dark:text-ink focus:border-calm-sage dark:focus:border-calm-sage focus:ring-1 focus:ring-calm-sage dark:focus:ring-calm-sage transition-all duration-200 outline-none resize-none font-sans text-sm leading-relaxed"
                  placeholder="Copy the text from your bill, notice, or letter here… or just attach the file below."
                />
              </div>

              {/* Attached file preview */}
              {attachedFile && (
                <div data-testid="upload-success-state" className="flex items-center gap-3 p-3 bg-calm-sage/10 border border-calm-sage/20 rounded-2xl">
                  <Paperclip className="w-4 h-4 text-calm-sage flex-shrink-0" />
                  <span data-testid="file-name-display" className="text-sm font-semibold text-deep-pine dark:text-calm-sage font-sans flex-1 truncate">{attachedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-soft-clay hover:text-ink transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Footer: attach + submit */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-ink hover:text-deep-pine dark:hover:text-calm-sage transition-colors font-sans border border-mist dark:border-mist rounded-full px-4 py-2 hover:border-calm-sage dark:hover:border-calm-sage"
                  >
                    <Paperclip className="w-4 h-4" />
                    Attach file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload document file"
                  />
                  <span className="text-xs text-ink dark:text-ink opacity-50 font-sans hidden sm:block">PDF, PNG, JPG up to 10MB</span>
                </div>

                <button
                  type="submit"
                  data-testid="translate-submit-btn"
                  disabled={!inputText.trim() && !attachedFile}
                  className="bg-deep-pine dark:bg-calm-sage hover:opacity-90 text-paper dark:text-deep-pine font-semibold px-7 py-3 rounded-full shadow-calm hover:shadow-calm-hover transition-all duration-300 active:scale-[0.98] flex items-center gap-2 group focus:ring-2 focus:ring-deep-pine dark:focus:ring-calm-sage disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  Analyze
                </button>
              </div>
            </form>

            {/* Preset Samples */}
            <section className="space-y-4">
              <h2 className="text-xs font-semibold tracking-wider uppercase text-ink dark:text-ink text-center font-sans">
                Try a sample document
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {([
                  { key: 'school',   label: 'School Notice',    testId: 'preset-doc-school' },
                  { key: 'food',     label: 'Food Assistance',  testId: 'preset-doc-food' },
                  { key: 'medical',  label: 'Medical Bill',     testId: 'preset-doc-medical' },
                  { key: 'eviction', label: 'Eviction Warning', testId: 'preset-doc-eviction' },
                  { key: 'debt',     label: 'Debt Collection',  testId: 'preset-doc-debt' },
                ] as const).map(({ key, label, testId }) => (
                  <button
                    key={key}
                    type="button"
                    data-testid={testId}
                    onClick={() => handlePresetClick(key)}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold border border-mist dark:border-mist bg-paper dark:bg-surface hover:bg-warm-sand dark:hover:bg-mist hover:border-calm-sage dark:hover:border-calm-sage text-deep-pine dark:text-ink transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] font-sans"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── LOADING: Initial analysis in progress — live reasoning trace ── */}
        {loading && !hasStartedChat && (
          <ThinkingProcess category={documentCategory} reducedMotion={prefersReducedMotion} />
        )}

        {/* ── AFTER CHAT: The conversational advisor ── */}
        {hasStartedChat && (
          <div className="space-y-6 animate-fade-in mt-4">
            {/* Calm deadline countdown, if the document has a hard date */}
            {documentMeta?.deadline && (
              <DeadlineBanner deadline={documentMeta.deadline} label={documentMeta.deadlineLabel} />
            )}

            {/* "We made it simpler" — readability before → after */}
            <ReadabilityCard
              originalText={documentText || (documentAnnotations?.lines || []).map((l: any) => l.text).join(' ') || ''}
              plainText={conversationHistory.find((m) => m.role === 'assistant')?.content || ''}
            />

            {documentImageUrl && documentImageUrl.startsWith('data:image') && (
              <AnnotatedDocument
                imageUrl={documentImageUrl}
                analysisContext={conversationHistory.find((m) => m.role === 'assistant')?.content}
                saved={documentAnnotations}
                onComputed={(data) => {
                  setDocumentAnnotations(data);
                  if (configured && user && currentThreadId) saveThreadAnnotations(currentThreadId, data);
                }}
              />
            )}
            <AdvisorChat
              history={conversationHistory}
              onSend={sendMessage}
              loading={loading}
              onReset={handleReset}
              documentCategory={documentCategory}
              documentText={documentText}
              documentImageUrl={documentImageUrl}
              onResearch={runResearchAgent}
              researching={researching}
            />

            {/* Find support near you (3D map) — only when contextually relevant */}
            {conversationHistory.some((m) => m.role === 'assistant') && documentMeta?.suggestSupport && (
              showSupport ? (
                <SupportMap
                  category={documentCategory}
                  analysis={conversationHistory.find((m) => m.role === 'assistant')?.content}
                />
              ) : (
                <button
                  onClick={() => setShowSupport(true)}
                  className="w-full flex items-center justify-center gap-2 bg-surface/70 dark:bg-surface/60 backdrop-blur rounded-3xl shadow-calm hover:shadow-calm-hover active:scale-[0.99] transition-all duration-300 py-4 text-sm font-semibold text-deep-pine dark:text-calm-sage font-sans"
                >
                  <MapPin className="w-4 h-4" />
                  Find support near you
                </button>
              )
            )}

            {/* What support can you get? (eligibility finder) — only when relevant */}
            {conversationHistory.some((m) => m.role === 'assistant') && documentMeta?.suggestEligibility && (
              showEligibility ? (
                <EligibilityFinder
                  documentText={documentText}
                  analysis={conversationHistory.find((m) => m.role === 'assistant')?.content || ''}
                  category={documentCategory}
                />
              ) : (
                <button
                  onClick={() => setShowEligibility(true)}
                  className="w-full flex items-center justify-center gap-2 bg-surface/70 dark:bg-surface/60 backdrop-blur rounded-3xl shadow-calm hover:shadow-calm-hover active:scale-[0.99] transition-all duration-300 py-4 text-sm font-semibold text-deep-pine dark:text-calm-sage font-sans"
                >
                  <Check className="w-4 h-4" />
                  See what you qualify for
                </button>
              )
            )}

            {/* Save / share a one-pager (PDF + QR) */}
            {conversationHistory.some((m) => m.role === 'assistant') && (
              <ShareSummary
                title={threads.find((t) => t.id === currentThreadId)?.title || 'Your document, explained'}
                analysis={conversationHistory.find((m) => m.role === 'assistant')?.content || ''}
                deadline={documentMeta?.deadline}
                deadlineLabel={documentMeta?.deadlineLabel}
              />
            )}
          </div>
        )}

      </main>

      {/* Action toast — when the advisor saves reminders/todos */}
      {actionNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <a
            href="/reminders"
            className="flex items-center gap-2 bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine text-sm font-semibold font-sans rounded-full pl-4 pr-5 py-3 shadow-calm-hover hover:opacity-95 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            {actionNotice}
          </a>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-mist dark:border-mist bg-paper dark:bg-paper px-6 py-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-serif italic text-base text-deep-pine dark:text-calm-sage font-semibold">
              Seen. Clear. Capable. In control.
            </p>
            <p className="text-xs text-ink dark:text-ink">Your steady friend in overwhelming moments.</p>
          </div>
          <div className="text-xs text-ink dark:text-ink text-center md:text-right font-sans">
            <p>© 2026 ENVIS. Muted for your calm and control.</p>
            <p className="mt-1">Built with full WCAG AA accessibility compliance.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
