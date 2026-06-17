'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthScreen from '@/components/AuthScreen';

// Gates the app behind authentication. If Supabase isn't configured yet,
// it lets the app through so local development isn't blocked before keys exist.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth();

  if (!configured) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex-1 w-full min-h-screen flex items-center justify-center bg-paper">
        <div className="w-14 h-14 rounded-full bg-calm-sage flex items-center justify-center shadow-calm animate-breathing">
          <Sparkles className="w-7 h-7 text-deep-pine" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 w-full">
        <AuthScreen />
      </div>
    );
  }

  return <>{children}</>;
}
