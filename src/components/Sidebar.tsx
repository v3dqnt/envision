"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileSearch, ListTodo, UserCog, Sun, Moon, Plus, MessageSquare, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDocument } from "@/context/DocumentContext";
import { deleteThread } from "@/lib/threads";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  const { user, configured, signOut } = useAuth();
  const { threads, currentThreadId, refreshThreads, loadThread, startNewThread } = useDocument();

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark') ||
                   document.documentElement.getAttribute('data-theme') === 'night-calm';
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  // Load the user's threads once they're signed in.
  useEffect(() => {
    if (user) refreshThreads();
  }, [user, refreshThreads]);

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

  const features = [
    { name: 'Document Decoder', icon: FileSearch, href: '/' },
    { name: 'Reminders & Todo Lists', icon: ListTodo, href: '/reminders' },
    { name: 'Your Details', icon: UserCog, href: '/account' },
  ];

  const handleNewDocument = () => {
    startNewThread();
    router.push('/');
  };

  const handleOpenThread = async (id: string) => {
    await loadThread(id);
    router.push('/');
  };

  const handleDeleteThread = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteThread(id);
    if (id === currentThreadId) startNewThread();
    refreshThreads();
  };

  return (
    <aside className="w-72 border-r border-mist/30 dark:border-mist/15 bg-surface/90 dark:bg-surface/80 backdrop-blur-xl hidden md:flex flex-col p-6 sticky top-0 h-screen transition-colors duration-300 shadow-[2px_0_24px_rgba(46,79,74,0.02)] z-50">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-8 group">
        <div className="w-9 h-9 rounded-xl bg-calm-sage flex items-center justify-center shadow-calm border border-deep-pine/5 dark:border-paper/5 transition-transform duration-300 group-hover:scale-105">
          <span className="text-deep-pine dark:text-deep-pine font-serif font-bold text-lg select-none">E</span>
        </div>
        <span className="font-serif font-bold text-2xl tracking-tight text-deep-pine dark:text-calm-sage">
          ENVIS
        </span>
      </div>

      {/* New document */}
      <button
        onClick={handleNewDocument}
        className="flex items-center justify-center gap-2 w-full mb-6 px-4 py-3.5 rounded-2xl bg-calm-sage text-deep-pine font-sans text-sm font-semibold shadow-[0_4px_12px_rgba(121,194,171,0.2)] hover:shadow-[0_6px_20px_rgba(121,194,171,0.35)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300"
      >
        <Plus className="w-4 h-4" />
        New document
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 mb-6">
        {features.map((feature) => {
          const isActive = pathname === feature.href;
          const Icon = feature.icon;
          return (
            <Link
              key={feature.name}
              href={feature.href}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 font-sans text-sm ${
                isActive
                  ? 'bg-warm-sand/50 dark:bg-warm-sand/20 text-deep-pine dark:text-ink font-semibold shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]'
                  : 'text-ink/70 dark:text-ink/65 font-medium hover:bg-warm-sand/25 dark:hover:bg-mist/10 hover:text-deep-pine dark:hover:text-calm-sage hover:translate-x-0.5'
              }`}
            >
              {/* Styled Icon Container */}
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-calm-sage text-deep-pine shadow-sm' 
                  : 'bg-transparent text-ink/50 group-hover:bg-warm-sand dark:group-hover:bg-mist/30 group-hover:text-calm-sage'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span>{feature.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Threads / history */}
      {configured && user && (
        <div className="flex-1 min-h-0 flex flex-col">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink/40 dark:text-ink/40 font-sans px-3 mb-2">
            Your documents
          </p>
          <div className="flex-1 overflow-y-auto px-1 space-y-1.5 scrollbar-thin scrollbar-thumb-mist/30">
            {threads.length === 0 && (
              <p className="text-xs text-ink/50 dark:text-ink/50 font-sans px-3 py-3 leading-relaxed">
                Documents you analyze will be saved here.
              </p>
            )}
            {threads.map((t) => {
              const isActive = t.id === currentThreadId;
              return (
                <button
                  key={t.id}
                  onClick={() => handleOpenThread(t.id)}
                  className={`group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-200 font-sans ${
                    isActive
                      ? 'bg-warm-sand/35 dark:bg-warm-sand/15 border border-mist/40 dark:border-mist/10 text-deep-pine dark:text-calm-sage font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]'
                      : 'text-ink/70 dark:text-ink/75 hover:bg-warm-sand/15 dark:hover:bg-mist/5 hover:text-deep-pine dark:hover:text-calm-sage hover:translate-x-0.5'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-calm-sage/15 text-calm-sage' 
                      : 'bg-transparent text-ink/40 group-hover:text-calm-sage'
                  }`}>
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  </div>
                  <span className="flex-1 truncate text-xs">{t.title}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDeleteThread(e, t.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink/40 hover:text-soft-clay transition-all flex-shrink-0 p-1 hover:bg-warm-sand/30 dark:hover:bg-mist/10 rounded-lg"
                    aria-label="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer: user + theme */}
      <div className="mt-auto pt-4 border-t border-mist/30 dark:border-mist/15 space-y-3">
        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between px-3.5 py-2.5 w-full rounded-2xl transition-all duration-200 font-sans text-sm font-semibold text-ink/80 dark:text-ink/85 hover:bg-warm-sand/20 dark:hover:bg-mist/10"
          >
            <span className="flex items-center gap-3">
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-deep-pine" />
              ) : (
                <Sun className="w-4 h-4 text-calm-sage" />
              )}
              <span>{theme === 'light' ? 'Night Calm' : 'Light Mode'}</span>
            </span>
            {/* Custom 2026 Toggle Switch */}
            <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ${theme === 'dark' ? 'bg-calm-sage' : 'bg-mist/80'}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-surface shadow-sm transition-transform duration-200 ${theme === 'dark' ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </div>
          </button>
        )}

        {configured && user && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-warm-sand/25 dark:bg-warm-sand/10 border border-mist/20 dark:border-mist/10">
            <div className="w-8 h-8 rounded-xl bg-calm-sage/25 flex items-center justify-center flex-shrink-0 border border-calm-sage/20">
              <span className="text-xs font-bold text-deep-pine dark:text-calm-sage uppercase">
                {(user.user_metadata?.full_name || user.email || '?').charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-deep-pine dark:text-ink truncate leading-tight">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-ink/50 dark:text-ink/40 truncate leading-none mt-0.5">
                {user.email}
              </p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="p-1.5 text-ink/40 hover:text-soft-clay hover:bg-warm-sand/30 dark:hover:bg-mist/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
