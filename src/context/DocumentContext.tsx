"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { listThreads, getMessages, getThread, type Thread } from '@/lib/threads';

export type DocumentCategory =
  | 'medical'
  | 'discharge'
  | 'eviction'
  | 'debt'
  | 'school'
  | 'government'
  | 'food'
  | 'housing'
  | 'other';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DocumentContextType {
  documentCategory: DocumentCategory;
  setDocumentCategory: (category: DocumentCategory) => void;
  conversationHistory: ChatMessage[];
  setConversationHistory: (history: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  documentText: string | null;
  setDocumentText: (text: string | null) => void;
  documentImageUrl: string | null;
  setDocumentImageUrl: (url: string | null) => void;
  // Cached document annotations (OCR boxes + meanings) for the active doc
  documentAnnotations: any | null;
  setDocumentAnnotations: (data: any | null) => void;
  // Per-document meta: which help tools are relevant to this problem
  documentMeta: { suggestSupport?: boolean; suggestEligibility?: boolean } | null;
  setDocumentMeta: (data: { suggestSupport?: boolean; suggestEligibility?: boolean } | null) => void;
  // Threads (each thread keeps its own document + conversation memory)
  threads: Thread[];
  currentThreadId: string | null;
  setCurrentThreadId: (id: string | null) => void;
  refreshThreads: () => Promise<void>;
  loadThread: (id: string) => Promise<void>;
  startNewThread: () => void;
  // Legacy support
  analysisResult: any;
  setAnalysisResult: (result: any) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>('medical');
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const [documentImageUrl, setDocumentImageUrl] = useState<string | null>(null);
  const [documentAnnotations, setDocumentAnnotations] = useState<any | null>(null);
  const [documentMeta, setDocumentMeta] = useState<{ suggestSupport?: boolean; suggestEligibility?: boolean } | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  // Legacy
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const refreshThreads = useCallback(async () => {
    const list = await listThreads();
    setThreads(list);
  }, []);

  // Pull a thread's stored document + full message history back into view.
  const loadThread = useCallback(async (id: string) => {
    const [thread, messages] = await Promise.all([getThread(id), getMessages(id)]);
    if (!thread) return;
    setCurrentThreadId(id);
    setDocumentCategory(thread.category || 'other');
    setDocumentText(thread.document_text);
    setDocumentImageUrl(thread.document_image_url);
    setDocumentAnnotations(thread.annotations ?? null);
    setDocumentMeta(thread.meta ?? null);
    setConversationHistory(messages);
  }, []);

  const startNewThread = useCallback(() => {
    setCurrentThreadId(null);
    setConversationHistory([]);
    setDocumentText(null);
    setDocumentImageUrl(null);
    setDocumentAnnotations(null);
    setDocumentMeta(null);
    setDocumentCategory('medical');
  }, []);

  return (
    <DocumentContext.Provider value={{
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
      loadThread,
      startNewThread,
      analysisResult,
      setAnalysisResult,
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}
