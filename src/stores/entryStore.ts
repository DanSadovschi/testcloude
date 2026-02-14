import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getStartOfToday, getStartOfWeek, getStartOfMonth, calculateDurationSeconds } from '../utils/time';
import type { TimeEntry, EntryFilters, Tag } from '../types';

interface EntryState {
  entries: TimeEntry[];
  filters: EntryFilters;
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  setFilters: (filters: Partial<EntryFilters>) => void;
  fetchEntries: () => Promise<void>;
  updateEntry: (
    id: string,
    updates: {
      description?: string;
      project_id?: string | null;
      start_time?: string;
      end_time?: string;
      billable?: boolean;
    }
  ) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  bulkDelete: (ids: string[]) => Promise<boolean>;
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setEntryTags: (entryId: string, tagIds: string[]) => Promise<boolean>;
}

async function fetchTagsForEntries(entryIds: string[]): Promise<Map<string, Tag[]>> {
  if (entryIds.length === 0) return new Map();
  const { data } = await supabase
    .from('entry_tags')
    .select('entry_id, tag_id, tags(*)')
    .in('entry_id', entryIds);

  const map = new Map<string, Tag[]>();
  for (const row of data ?? []) {
    const tags = map.get(row.entry_id) ?? [];
    if (row.tags) tags.push(row.tags as unknown as Tag);
    map.set(row.entry_id, tags);
  }
  return map;
}

export const useEntryStore = create<EntryState>((set, get) => ({
  entries: [],
  filters: { datePreset: 'today', projectId: null, tagId: null, billable: 'all', search: '' },
  loading: false,
  error: null,
  selectedIds: new Set(),

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
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false });

    // Date filter
    if (filters.datePreset === 'today') {
      query = query.gte('start_time', getStartOfToday());
    } else if (filters.datePreset === 'week') {
      query = query.gte('start_time', getStartOfWeek());
    } else if (filters.datePreset === 'month') {
      query = query.gte('start_time', getStartOfMonth());
    }

    // Project filter
    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId);
    }

    // Billable filter
    if (filters.billable === 'billable') {
      query = query.eq('billable', true);
    } else if (filters.billable === 'non-billable') {
      query = query.eq('billable', false);
    }

    // Search filter (description)
    if (filters.search.trim()) {
      query = query.ilike('description', `%${filters.search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    let entries: TimeEntry[] = data ?? [];

    // Fetch tags for entries
    const tagMap = await fetchTagsForEntries(entries.map((e) => e.id));
    entries = entries.map((e) => ({ ...e, tags: tagMap.get(e.id) ?? [] }));

    // Tag filter (client-side since it's a junction)
    if (filters.tagId) {
      entries = entries.filter((e) => e.tags?.some((t) => t.id === filters.tagId));
    }

    set({ entries, loading: false, selectedIds: new Set() });
  },

  updateEntry: async (id, updates) => {
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

  bulkDelete: async (ids) => {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .in('id', ids);

    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetchEntries();
    return true;
  },

  toggleSelected: (id) => {
    set((s) => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    });
  },

  selectAll: () => {
    set((s) => ({ selectedIds: new Set(s.entries.map((e) => e.id)) }));
  },

  clearSelection: () => {
    set({ selectedIds: new Set() });
  },

  setEntryTags: async (entryId, tagIds) => {
    // Remove existing tags
    await supabase.from('entry_tags').delete().eq('entry_id', entryId);
    // Insert new tags
    if (tagIds.length > 0) {
      const rows = tagIds.map((tag_id) => ({ entry_id: entryId, tag_id }));
      const { error } = await supabase.from('entry_tags').insert(rows);
      if (error) return false;
    }
    await get().fetchEntries();
    return true;
  },
}));
