'use client';

import { supabase } from './supabase/client';

export interface Reminder {
  id: string;
  user_id: string;
  thread_id: string | null;
  title: string;
  due_date: string | null;
  urgency: 'high' | 'medium' | 'low';
  done: boolean;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  thread_id: string | null;
  task: string;
  rationale: string | null;
  done: boolean;
  created_at: string;
}

export async function listReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase.from('reminders').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('listReminders failed:', error.message);
    return [];
  }
  return (data as Reminder[]) || [];
}

export async function listTodos(): Promise<Todo[]> {
  const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('listTodos failed:', error.message);
    return [];
  }
  return (data as Todo[]) || [];
}

export async function setReminderDone(id: string, done: boolean): Promise<void> {
  await supabase.from('reminders').update({ done }).eq('id', id);
}

export async function setTodoDone(id: string, done: boolean): Promise<void> {
  await supabase.from('todos').update({ done }).eq('id', id);
}

export async function deleteReminder(id: string): Promise<void> {
  await supabase.from('reminders').delete().eq('id', id);
}

export async function deleteTodo(id: string): Promise<void> {
  await supabase.from('todos').delete().eq('id', id);
}
