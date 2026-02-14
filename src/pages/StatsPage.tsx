import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useProjectStore } from '../stores/projectStore';
import { getStartOfToday, getStartOfWeek } from '../utils/time';
import StatsCards from '../components/StatsCards';
import ProjectTotals from '../components/ProjectTotals';

interface ProjectTotal {
  id: string | null;
  name: string;
  color: string;
  totalSeconds: number;
}

export default function StatsPage() {
  const { projects, fetchProjects } = useProjectStore();
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [weekSeconds, setWeekSeconds] = useState(0);
  const [billableSeconds, setBillableSeconds] = useState(0);
  const [billableAmount, setBillableAmount] = useState(0);
  const [projectTotals, setProjectTotals] = useState<ProjectTotal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);

    // Fetch today total
    const { data: todayData } = await supabase
      .from('time_entries')
      .select('duration_seconds')
      .not('end_time', 'is', null)
      .gte('start_time', getStartOfToday());

    const todayTotal = (todayData ?? []).reduce(
      (sum, e) => sum + (e.duration_seconds ?? 0),
      0
    );

    // Fetch week entries with billable + project info
    const { data: weekData } = await supabase
      .from('time_entries')
      .select('project_id, duration_seconds, billable')
      .not('end_time', 'is', null)
      .gte('start_time', getStartOfWeek());

    const weekEntries = weekData ?? [];
    const weekTotal = weekEntries.reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0);

    // Billable stats
    const billableEntries = weekEntries.filter((e) => e.billable);
    const billableSecs = billableEntries.reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0);

    // Calculate earnings based on project hourly rates
    let earnings = 0;
    for (const entry of billableEntries) {
      const project = projects.find((p) => p.id === entry.project_id);
      if (project?.hourly_rate) {
        earnings += (project.hourly_rate * (entry.duration_seconds ?? 0)) / 3600;
      }
    }

    // Group by project
    const byProject = new Map<string | null, number>();
    for (const entry of weekEntries) {
      const key = entry.project_id;
      byProject.set(key, (byProject.get(key) ?? 0) + (entry.duration_seconds ?? 0));
    }

    setTodaySeconds(todayTotal);
    setWeekSeconds(weekTotal);
    setBillableSeconds(billableSecs);
    setBillableAmount(earnings);
    setProjectTotals(
      Array.from(byProject.entries()).map(([projectId, totalSeconds]) => {
        const project = projects.find((p) => p.id === projectId);
        return {
          id: projectId,
          name: project?.name ?? 'No project',
          color: project?.color ?? '#94a3b8',
          totalSeconds,
        };
      })
    );
    setLoading(false);
  }, [projects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (projects !== undefined) {
      loadStats();
    }
  }, [projects, loadStats]);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-4 dark:text-white">Stats</h1>
        <p className="text-gray-500 dark:text-gray-400">Loading stats...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 dark:text-white">Stats</h1>
      <StatsCards
        todaySeconds={todaySeconds}
        weekSeconds={weekSeconds}
        billableSeconds={billableSeconds}
        billableAmount={billableAmount}
      />
      <ProjectTotals totals={projectTotals} />
    </div>
  );
}
