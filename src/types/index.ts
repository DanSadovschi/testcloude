export interface Project {
  id: string;
  user_id: string;
  name: string;
  color: string;
  hourly_rate: number | null;
  created_at: string;
}

export interface Tag {
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
  billable: boolean;
  created_at: string;
  tags?: Tag[];
}

export interface Favorite {
  id: string;
  user_id: string;
  description: string;
  project_id: string | null;
  billable: boolean;
  created_at: string;
}

export type DatePreset = 'today' | 'week' | 'month' | 'all';

export interface EntryFilters {
  datePreset: DatePreset;
  projectId: string | null;
  tagId: string | null;
  billable: 'all' | 'billable' | 'non-billable';
  search: string;
}
