export interface Project {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string | null;
  description: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export type DatePreset = 'today' | 'week' | 'all';

export interface EntryFilters {
  datePreset: DatePreset;
  projectId: string | null; // null = all projects
}
