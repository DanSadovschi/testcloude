import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Tag } from '../types';

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<boolean>;
  deleteTag: (id: string) => Promise<boolean>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  loading: false,
  error: null,

  fetchTags: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ tags: data ?? [], loading: false });
  },

  createTag: async (name, color) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('tags')
      .insert({ name, color, user_id: user.id });

    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetchTags();
    return true;
  },

  deleteTag: async (id) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetchTags();
    return true;
  },
}));
