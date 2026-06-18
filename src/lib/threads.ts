'use client';

import { supabase } from './supabase/client';
import type { ChatMessage, DocumentCategory } from '@/context/DocumentContext';

export interface Thread {
  id: string;
  user_id: string;
  title: string;
  category: DocumentCategory;
  document_text: string | null;
  document_image_url: string | null;
  annotations: any | null; // cached OCR + meanings so we don't recompute
  meta: { title?: string; suggestSupport?: boolean; suggestEligibility?: boolean; deadline?: string; deadlineLabel?: string } | null;
  created_at: string;
  updated_at: string;
}

// List the signed-in user's threads, most recently updated first.
export async function listThreads(): Promise<Thread[]> {
  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('listThreads failed:', error.message);
    return [];
  }
  return (data as Thread[]) || [];
}

// Create a new thread for the current user and return it.
export async function createThread(params: {
  title: string;
  category: DocumentCategory;
  documentText?: string | null;
  documentImageUrl?: string | null;
}): Promise<Thread | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('threads')
    .insert({
      user_id: userId,
      title: params.title.slice(0, 120),
      category: params.category,
      document_text: params.documentText ?? null,
      document_image_url: params.documentImageUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('createThread failed:', error.message);
    return null;
  }
  return data as Thread;
}

// Load every message in a thread, oldest first — this is the thread's memory.
export async function getMessages(threadId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('role, content')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('getMessages failed:', error.message);
    return [];
  }
  return (data as ChatMessage[]) || [];
}

// Append one message to a thread and bump the thread's updated_at.
export async function addMessage(threadId: string, msg: ChatMessage): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;

  const { error } = await supabase.from('messages').insert({
    thread_id: threadId,
    user_id: userId,
    role: msg.role,
    content: msg.content,
  });
  if (error) console.error('addMessage failed:', error.message);

  await supabase.from('threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId);
}

// Cache the computed document annotations on the thread so they're never
// re-OCR'd or re-explained on later visits.
export async function saveThreadAnnotations(threadId: string, annotations: any): Promise<void> {
  const { error } = await supabase.from('threads').update({ annotations }).eq('id', threadId);
  if (error) console.error('saveThreadAnnotations failed:', error.message);
}

// Update a thread's title and/or meta flags (after content-aware labelling).
export async function updateThreadMeta(
  threadId: string,
  fields: { title?: string; meta?: any }
): Promise<void> {
  const { error } = await supabase.from('threads').update(fields).eq('id', threadId);
  if (error) console.error('updateThreadMeta failed:', error.message);
}

export async function getThread(threadId: string): Promise<Thread | null> {
  const { data, error } = await supabase.from('threads').select('*').eq('id', threadId).single();
  if (error) {
    console.error('getThread failed:', error.message);
    return null;
  }
  return data as Thread;
}

export async function deleteThread(threadId: string): Promise<void> {
  const { error } = await supabase.from('threads').delete().eq('id', threadId);
  if (error) console.error('deleteThread failed:', error.message);
}
