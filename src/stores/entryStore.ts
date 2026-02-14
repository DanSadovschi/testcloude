import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getStartOfToday, getStartOfWeek, calculateDurationSeconds } from '../utils/time';
import type { TimeEntry, EntryFilters } from '../types';

interface EntryState {
  entries: TimeEntry[];
  filters: EntryFilters;
  loading: boolean;
  error: string | null;
  setFilters: (filters: Partial<EntryFilters>) => void;
  fetchEntries: () => Promise<void>;
  updateEntry: (
    id: string,
    updates: {
      description?: string;
      project_id?: string | null;
      start_time?: string;
      end_time?: string;
    }
  ) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
}

export const useEntryStore = create<EntryState>((set, get) => ({
  entries: [],
  filters: { datePreset: 'today', projectId: null },
  loading: false,
  error: null,

  setFilters: (partial) => {
    set((s) => ({ filters: { ...s.filters, ...partial } }));
    get().fetchEntries();
  },

  fetchEntries: async () => {
    set({ loading: true, error: null });
    const { filters } = get();

    let query = supabase
      .from('time_entries')
      .select('*')
      .not('end_time', 'is', null) // exclude running entries
      .order('start_time', { ascending: false });

    // Date filter
    if (filters.datePreset === 'today') {
      query = query.gte('start_time', getStartOfToday());
    } else if (filters.datePreset === 'week') {
      query = query.gte('start_time', getStartOfWeek());
    }

    // Project filter
    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId);
    }

    const { data, error } = await query;
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ entries: data ?? [], loading: false });
  },

  updateEntry: async (id, updates) => {
    // If both start and end are provided, recalculate duration
    const patchData: Record<string, unknown> = { ...updates };
    if (updates.start_time && updates.end_time) {
      patchData.duration_seconds = calculateDurationSeconds(
        updates.start_time,
        updates.end_time
      );
    }

    const { error } = await supabase
      .from('time_entries')
      .update(patchData)
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetchEntries();
    return true;
  },

  deleteEntry: async (id) => {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetchEntries();
    return true;
  },
}));
