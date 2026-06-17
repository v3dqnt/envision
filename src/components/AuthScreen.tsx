'use client';

import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim() || !password.trim() || (mode === 'signup' && !fullName.trim())) {
      setError('Please fill in every field.');
      return;
    }
    setBusy(true);
    const res =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, fullName.trim());
    setBusy(false);

    if (res.error) {
      setError(res.error);
    } else if (mode === 'signup') {
      setNotice('Almost there — check your email to confirm your account, then sign in.');
      setMode('signin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-paper px-6 py-12 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8">
        {/* Brand mark */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-calm-sage flex items-center justify-center shadow-calm mx-auto animate-breathing">
            <Sparkles className="w-7 h-7 text-deep-pine" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-deep-pine dark:text-calm-sage">
              {mode === 'signin' ? 'Welcome back' : 'Take a breath'}
            </h1>
            <p className="font-sans text-sm text-ink dark:text-ink opacity-70 max-w-xs mx-auto leading-relaxed">
              {mode === 'signin'
                ? 'Sign in to pick up where you left off.'
                : 'Create an account to keep every document and conversation in one calm place.'}
            </p>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface/80 dark:bg-surface/70 backdrop-blur-xl rounded-3xl shadow-calm p-7 space-y-4"
        >
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink dark:text-ink opacity-70 font-sans">Your name</label>
              <div className="flex items-center gap-3 bg-paper dark:bg-paper rounded-2xl px-4 py-3 focus-within:ring-1 focus-within:ring-calm-sage transition-all">
                <UserIcon className="w-4 h-4 text-calm-sage flex-shrink-0" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="flex-1 bg-transparent text-sm text-ink dark:text-ink font-sans focus:outline-none placeholder:text-ink/40"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink dark:text-ink opacity-70 font-sans">Email</label>
            <div className="flex items-center gap-3 bg-paper dark:bg-paper rounded-2xl px-4 py-3 focus-within:ring-1 focus-within:ring-calm-sage transition-all">
              <Mail className="w-4 h-4 text-calm-sage flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="flex-1 bg-transparent text-sm text-ink dark:text-ink font-sans focus:outline-none placeholder:text-ink/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink dark:text-ink opacity-70 font-sans">Password</label>
            <div className="flex items-center gap-3 bg-paper dark:bg-paper rounded-2xl px-4 py-3 focus-within:ring-1 focus-within:ring-calm-sage transition-all">
              <Lock className="w-4 h-4 text-calm-sage flex-shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="flex-1 bg-transparent text-sm text-ink dark:text-ink font-sans focus:outline-none placeholder:text-ink/40"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-center text-soft-clay font-sans bg-soft-clay/10 rounded-xl py-2.5 px-3">{error}</p>
          )}
          {notice && (
            <p className="text-xs text-center text-deep-pine dark:text-calm-sage font-sans bg-calm-sage/10 rounded-xl py-2.5 px-3">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-deep-pine dark:bg-calm-sage text-paper dark:text-deep-pine font-semibold py-3.5 rounded-2xl shadow-calm hover:shadow-calm-hover hover:opacity-90 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 font-sans"
          >
            {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            {!busy && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Mode toggle */}
        <p className="text-center text-sm text-ink dark:text-ink opacity-70 font-sans">
          {mode === 'signin' ? "New to ENVIS?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setNotice(null);
            }}
            className="font-semibold text-deep-pine dark:text-calm-sage hover:underline"
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
