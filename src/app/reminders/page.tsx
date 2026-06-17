'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Circle, Trash2, ListTodo, Sparkles, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  listReminders,
  listTodos,
  setReminderDone,
  setTodoDone,
  deleteReminder,
  deleteTodo,
  type Reminder,
  type Todo,
} from '@/lib/reminders';
import { listThreads, type Thread } from '@/lib/threads';

export default function RemindersPage() {
  const { user, configured } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [r, t, th] = await Promise.all([listReminders(), listTodos(), listThreads()]);
    setReminders(r);
    setTodos(t);
    setThreads(th);
    setLoading(false);
  };

  // Group to-dos by the document (thread) they came from, in thread order.
  const todoGroups = useMemo(() => {
    const titleOf = (id: string | null) => threads.find((t) => t.id === id)?.title || 'Other steps';
    const byThread = new Map<string, Todo[]>();
    for (const t of todos) {
      const key = t.thread_id || 'none';
      if (!byThread.has(key)) byThread.set(key, []);
      byThread.get(key)!.push(t);
    }
    // Order: follow the thread list (most recent first), then any leftovers.
    const ordered: { key: string; title: string; items: Todo[] }[] = [];
    for (const th of threads) {
      if (byThread.has(th.id)) {
        ordered.push({ key: th.id, title: th.title, items: byThread.get(th.id)! });
        byThread.delete(th.id);
      }
    }
    for (const [key, items] of byThread) {
      ordered.push({ key, title: titleOf(key === 'none' ? null : key), items });
    }
    return ordered;
  }, [todos, threads]);

  useEffect(() => {
    if (configured && user) refresh();
    else setLoading(false);
  }, [user, configured]);

  const toggleReminder = async (r: Reminder) => {
    setReminders((prev) => prev.map((x) => (x.id === r.id ? { ...x, done: !x.done } : x)));
    await setReminderDone(r.id, !r.done);
  };
  const toggleTodo = async (t: Todo) => {
    setTodos((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
    await setTodoDone(t.id, !t.done);
  };
  const removeReminder = async (id: string) => {
    setReminders((prev) => prev.filter((x) => x.id !== id));
    await deleteReminder(id);
  };
  const removeTodo = async (id: string) => {
    setTodos((prev) => prev.filter((x) => x.id !== id));
    await deleteTodo(id);
  };

  const doneCount = todos.filter((t) => t.done).length;
  const progressPercent = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  const urgencyStyle: Record<string, string> = {
    high: 'bg-attention/25 text-deep-pine dark:text-attention border-attention/40',
    medium: 'bg-attention/10 text-attention border-attention/20',
    low: 'bg-calm-sage/15 text-deep-pine dark:text-calm-sage border-calm-sage/30',
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12 font-sans text-ink dark:text-ink animate-fade-in">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center md:text-left">
          <h1 className="font-serif text-4xl font-bold text-deep-pine dark:text-calm-sage mb-2">Reminders & Todo Lists</h1>
          <p className="text-sm text-ink dark:text-ink max-w-md opacity-80">
            Your advisor adds deadlines and next steps here automatically. Check them off as you go.
          </p>
        </div>

        {(!configured || !user) && (
          <div className="bg-surface dark:bg-surface border border-mist dark:border-mist rounded-3xl p-8 text-center shadow-calm">
            <p className="text-sm text-ink/70 font-sans">Sign in to see reminders and to-dos saved from your documents.</p>
          </div>
        )}

        {configured && user && (
          <>
            {/* Reminders / deadlines */}
            <section className="bg-surface dark:bg-surface border border-mist dark:border-mist rounded-3xl p-6 md:p-8 shadow-calm space-y-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-calm-sage" />
                <h3 className="font-serif text-xl font-bold text-deep-pine dark:text-ink">Timeline & Deadlines</h3>
              </div>

              {loading ? (
                <p className="text-sm text-ink/50">Loading…</p>
              ) : reminders.length === 0 ? (
                <p className="text-sm text-ink/50 font-sans py-4">No reminders yet. When the advisor spots a deadline, it'll land here.</p>
              ) : (
                <div className="relative pl-8 space-y-6">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-calm-sage/40 dark:bg-calm-sage/20" />
                  {reminders.map((r) => (
                    <div key={r.id} className="relative group">
                      <div className="absolute -left-[29px] top-1.5 w-3.5 h-3.5 rounded-full border-4 border-surface dark:border-surface bg-calm-sage" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <button onClick={() => toggleReminder(r)} className="mt-0.5 flex-shrink-0" aria-label="Toggle done">
                            {r.done ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5 text-ink/30 hover:text-calm-sage transition-colors" />}
                          </button>
                          <div className="min-w-0">
                            <p className={`font-sans text-sm font-semibold ${r.done ? 'line-through opacity-50' : 'text-deep-pine dark:text-calm-sage'}`}>{r.title}</p>
                            {r.due_date && <p className="text-xs text-ink/70 mt-0.5">{r.due_date}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider border ${urgencyStyle[r.urgency]}`}>{r.urgency}</span>
                          <button onClick={() => removeReminder(r.id)} className="opacity-0 group-hover:opacity-100 text-ink/40 hover:text-soft-clay transition-all" aria-label="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Todos */}
            <section className="bg-surface dark:bg-surface border border-mist dark:border-mist rounded-3xl p-6 md:p-8 shadow-calm space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-calm-sage" />
                  <h3 className="font-serif text-xl font-bold text-deep-pine dark:text-ink">Your next steps</h3>
                </div>
                {todos.length > 0 && (
                  <div className="w-14 h-14 rounded-full border-4 border-calm-sage/35 dark:border-calm-sage/20 flex items-center justify-center text-xs font-bold text-deep-pine dark:text-calm-sage font-sans">
                    {progressPercent}%
                  </div>
                )}
              </div>

              {loading ? (
                <p className="text-sm text-ink/50">Loading…</p>
              ) : todos.length === 0 ? (
                <div className="flex flex-col items-center text-center py-6 gap-2">
                  <Sparkles className="w-6 h-6 text-calm-sage/60" />
                  <p className="text-sm text-ink/50 font-sans">No to-dos yet. Analyze a document and the advisor will add your next steps here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {todoGroups.map((group) => (
                    <div key={group.key} className="space-y-3">
                      {/* Which document these steps came from */}
                      <div className="flex items-center gap-2 px-1">
                        <FileText className="w-3.5 h-3.5 text-calm-sage flex-shrink-0" />
                        <p className="text-2xs font-semibold uppercase tracking-wider text-deep-pine dark:text-calm-sage truncate">{group.title}</p>
                        <span className="text-2xs text-ink/40 font-sans">
                          {group.items.filter((t) => t.done).length}/{group.items.length}
                        </span>
                        <div className="flex-1 h-px bg-mist/40 dark:bg-mist/30" />
                      </div>
                      {group.items.map((t) => (
                        <div key={t.id} className="group p-4 border border-mist dark:border-mist rounded-2xl bg-paper dark:bg-paper flex items-start justify-between gap-3 transition-all duration-300">
                          <div className="flex items-start gap-3 min-w-0">
                            <button onClick={() => toggleTodo(t)} className="mt-0.5 flex-shrink-0" aria-label="Toggle done">
                              {t.done ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5 text-ink/30 hover:text-calm-sage transition-colors" />}
                            </button>
                            <div className="min-w-0">
                              <p className={`font-sans text-sm ${t.done ? 'line-through opacity-50' : 'text-ink dark:text-ink'}`}>{t.task}</p>
                              {t.rationale && <p className="text-xs text-ink/60 mt-1 leading-relaxed">{t.rationale}</p>}
                            </div>
                          </div>
                          <button onClick={() => removeTodo(t.id)} className="opacity-0 group-hover:opacity-100 text-ink/40 hover:text-soft-clay transition-all flex-shrink-0" aria-label="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
