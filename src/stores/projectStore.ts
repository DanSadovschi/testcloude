import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, color: string) => Promise<boolean>;
  deleteProject: (id: string) => Promise<{ ok: boolean; message?: string }>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ projects: data ?? [], loading: false });
  },

  createProject: async (name, color) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('projects')
      .insert({ name, color, user_id: user.id });

    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetchProjects();
    return true;
  },

  deleteProject: async (id) => {
    // Check if project has entries
    const { count, error: countError } = await supabase
      .from('time_entries')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    if (countError) {
      return { ok: false, message: countError.message };
    }

    const hasEntries = (count ?? 0) > 0;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      return { ok: false, message: error.message };
    }

    await get().fetchProjects();
    return {
      ok: true,
      message: hasEntries
        ? `Project deleted. ${count} ${count === 1 ? 'entry was' : 'entries were'} unassigned.`
        : undefined,
    };
  },
}));
