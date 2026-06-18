"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileSearch, ListTodo, Sun, Moon, Plus, MessageSquare, LogOut, Trash2 } from "lucide-react";
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
    <aside className="w-72 border-r border-mist dark:border-mist bg-surface dark:bg-surface hidden md:flex flex-col p-6 sticky top-0 h-screen transition-colors duration-300 shadow-[2px_0_20px_rgba(46,79,74,0.03)] z-50">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-full bg-calm-sage flex items-center justify-center shadow-calm">
          <span className="text-deep-pine dark:text-paper font-serif font-bold text-xl select-none">E</span>
        </div>
        <span className="font-serif font-bold text-3xl tracking-tight text-deep-pine dark:text-calm-sage">
          ENVIS
        </span>
      </div>

      {/* New document */}
      <button
        onClick={handleNewDocument}
        className="flex items-center justify-center gap-2 w-full mb-6 px-4 py-3 rounded-2xl bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine font-sans text-sm font-semibold shadow-calm hover:shadow-calm-hover hover:opacity-90 active:scale-[0.98] transition-all duration-300"
      >
        <Plus className="w-4 h-4" />
        New document
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 mb-6">
        {features.map((feature) => {
          const isActive = pathname === feature.href;
          const Icon = feature.icon;
          return (
            <Link
              key={feature.name}
              href={feature.href}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl transition-all duration-200 font-sans text-sm ${
                isActive
                  ? 'bg-calm-sage/20 dark:bg-calm-sage/15 text-deep-pine dark:text-calm-sage font-semibold shadow-sm'
                  : 'text-ink/75 dark:text-ink/75 font-medium hover:bg-warm-sand dark:hover:bg-mist/40 hover:text-deep-pine dark:hover:text-calm-sage hover:translate-x-0.5'
              }`}
            >
              {/* Active accent bar */}
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-calm-sage transition-all duration-200 ${
                  isActive ? 'h-7 opacity-100' : 'h-0 opacity-0'
                }`}
              />
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-calm-sage' : 'text-ink/50 group-hover:text-calm-sage'}`} />
              {feature.name}
            </Link>
          );
        })}
      </nav>

      {/* Threads / history */}
      {configured && user && (
        <div className="flex-1 min-h-0 flex flex-col">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink/50 dark:text-ink/50 font-sans px-2 mb-2">
            Your documents
          </p>
          <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
            {threads.length === 0 && (
              <p className="text-xs text-ink/50 dark:text-ink/50 font-sans px-2 py-3 leading-relaxed">
                Documents you analyze will be saved here.
              </p>
            )}
            {threads.map((t) => {
              const isActive = t.id === currentThreadId;
              return (
                <button
                  key={t.id}
                  onClick={() => handleOpenThread(t.id)}
                  className={`group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 font-sans ${
                    isActive
                      ? 'bg-calm-sage/20 dark:bg-calm-sage/10 text-deep-pine dark:text-calm-sage'
                      : 'text-ink dark:text-ink hover:bg-warm-sand dark:hover:bg-mist'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-70" />
                  <span className="flex-1 truncate text-xs font-medium">{t.title}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDeleteThread(e, t.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink/40 hover:text-soft-clay transition-all flex-shrink-0"
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
      <div className="mt-auto pt-4 border-t border-mist/50 dark:border-mist/50 space-y-1">
        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-2xl transition-all duration-200 font-sans text-sm font-semibold text-ink dark:text-ink hover:bg-warm-sand dark:hover:bg-mist"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-5 h-5 text-deep-pine" />
                <span>Night Calm Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 text-calm-sage" />
                <span>Light Mode</span>
              </>
            )}
          </button>
        )}

        {configured && user && (
          <div className="flex items-center gap-2 px-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-calm-sage/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-deep-pine dark:text-calm-sage uppercase">
                {(user.user_metadata?.full_name || user.email || '?').charAt(0)}
              </span>
            </div>
            <span className="flex-1 truncate text-xs text-ink/70 dark:text-ink/70 font-sans">{user.email}</span>
            <button
              onClick={signOut}
              title="Sign out"
              className="text-ink/50 hover:text-soft-clay transition-colors flex-shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
