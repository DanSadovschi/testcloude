import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Favorite } from '../types';

interface FavoriteState {
  favorites: Favorite[];
  loading: boolean;
  fetchFavorites: () => Promise<void>;
  addFavorite: (description: string, projectId: string | null, billable: boolean) => Promise<boolean>;
  removeFavorite: (id: string) => Promise<boolean>;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  loading: false,

  fetchFavorites: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });

    set({ favorites: data ?? [], loading: false });
  },

  addFavorite: async (description, projectId, billable) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        description,
        project_id: projectId,
        billable,
      });

    if (error) return false;
    await get().fetchFavorites();
    return true;
  },

  removeFavorite: async (id) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id);

    if (error) return false;
    await get().fetchFavorites();
    return true;
  },
}));
