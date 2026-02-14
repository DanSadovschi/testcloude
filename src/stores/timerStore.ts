import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { calculateDurationSeconds } from '../utils/time';
import type { TimeEntry } from '../types';

interface TimerState {
  runningEntry: TimeEntry | null;
  elapsedSeconds: number;
  loading: boolean;
  fetchRunningEntry: () => Promise<void>;
  startTimer: (description: string, projectId: string | null, billable: boolean) => Promise<void>;
  stopTimer: () => Promise<void>;
  updateRunningDescription: (description: string) => void;
  updateRunningProject: (projectId: string | null) => void;
  updateRunningBillable: (billable: boolean) => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  runningEntry: null,
  elapsedSeconds: 0,
  loading: false,

  fetchRunningEntry: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      set({ runningEntry: null, elapsedSeconds: 0, loading: false });
      return;
    }

    const elapsed = Math.floor(
      (Date.now() - new Date(data.start_time).getTime()) / 1000
    );
    set({ runningEntry: data, elapsedSeconds: Math.max(0, elapsed), loading: false });
  },

  startTimer: async (description, projectId, billable) => {
    const existing = get().runningEntry;
    if (existing) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        description,
        project_id: projectId,
        billable,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) return;
    set({ runningEntry: data, elapsedSeconds: 0 });
  },

  stopTimer: async () => {
    const entry = get().runningEntry;
    if (!entry) return;

    const endTime = new Date().toISOString();
    const duration = calculateDurationSeconds(entry.start_time, endTime);

    await supabase
      .from('time_entries')
      .update({
        end_time: endTime,
        duration_seconds: duration,
      })
      .eq('id', entry.id);

    set({ runningEntry: null, elapsedSeconds: 0 });
  },

  updateRunningDescription: (description) => {
    const entry = get().runningEntry;
    if (!entry) return;
    set({ runningEntry: { ...entry, description } });
    supabase
      .from('time_entries')
      .update({ description })
      .eq('id', entry.id)
      .then();
  },

  updateRunningProject: (projectId) => {
    const entry = get().runningEntry;
    if (!entry) return;
    set({ runningEntry: { ...entry, project_id: projectId } });
    supabase
      .from('time_entries')
      .update({ project_id: projectId })
      .eq('id', entry.id)
      .then();
  },

  updateRunningBillable: (billable) => {
    const entry = get().runningEntry;
    if (!entry) return;
    set({ runningEntry: { ...entry, billable } });
    supabase
      .from('time_entries')
      .update({ billable })
      .eq('id', entry.id)
      .then();
  },

  tick: () => {
    set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
  },
}));
