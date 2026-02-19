import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Task, TaskPriority } from '../types';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (dateFrom?: string, dateTo?: string) => Promise<void>;
  createTask: (title: string, priority: TaskPriority, dueDate: string | null, description?: string) => Promise<boolean>;
  toggleTask: (id: string) => Promise<boolean>;
  updateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'due_date'>>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (dateFrom?: string, dateTo?: string) => {
    set({ loading: true, error: null });
    let query = supabase
      .from('tasks')
      .select('*')
      .order('status', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (dateFrom) {
      query = query.gte('due_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('due_date', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ tasks: data ?? [], loading: false });
  },

  createTask: async (title, priority, dueDate, description = '') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('tasks')
      .insert({
        title,
        priority,
        due_date: dueDate,
        description,
        user_id: user.id,
      });

    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetchTasks();
    return true;
  },

  toggleTask: async (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return false;

    const newStatus = task.status === 'todo' ? 'done' : 'todo';
    const completedAt = newStatus === 'done' ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetchTasks();
    return true;
  },

  updateTask: async (id, updates) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetchTasks();
    return true;
  },

  deleteTask: async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetchTasks();
    return true;
  },
}));
