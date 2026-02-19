import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Task } from '../types';

type Period = 'week' | 'month';

function getStartOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getStartOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function getEndOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getEndOfMonth(): string {
  const d = new Date();
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

function getLocalDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDaysInRange(start: string, end: string): string[] {
  const days: string[] = [];
  const current = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (current <= last) {
    days.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`);
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function getWeekdayLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });
}

function getShortDateLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface DayStat {
  date: string;
  total: number;
  done: number;
}

export default function TaskDashboardPage() {
  const [period, setPeriod] = useState<Period>('week');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const start = period === 'week' ? getStartOfWeek() : getStartOfMonth();
    const end = period === 'week' ? getEndOfWeek() : getEndOfMonth();

    const [rangeResult, allResult] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .gte('due_date', start)
        .lte('due_date', end)
        .order('due_date', { ascending: true }),
      supabase
        .from('tasks')
        .select('*')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false }),
    ]);

    setTasks(rangeResult.data ?? []);
    setAllTasks(allResult.data ?? []);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const start = period === 'week' ? getStartOfWeek() : getStartOfMonth();
  const end = period === 'week' ? getEndOfWeek() : getEndOfMonth();
  const days = getDaysInRange(start, end);
  const todayStr = getLocalDateString();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const highDone = tasks.filter((t) => t.status === 'done' && t.priority === 'high').length;
  const highTotal = tasks.filter((t) => t.priority === 'high').length;
  const medDone = tasks.filter((t) => t.status === 'done' && t.priority === 'medium').length;
  const medTotal = tasks.filter((t) => t.priority === 'medium').length;
  const lowDone = tasks.filter((t) => t.status === 'done' && t.priority === 'low').length;
  const lowTotal = tasks.filter((t) => t.priority === 'low').length;

  // Daily breakdown
  const dayStats: DayStat[] = days.map((date) => {
    const dayTasks = tasks.filter((t) => t.due_date === date);
    return {
      date,
      total: dayTasks.length,
      done: dayTasks.filter((t) => t.status === 'done').length,
    };
  });

  const maxDayTotal = Math.max(...dayStats.map((d) => d.total), 1);

  // Streak calculation: consecutive days with all tasks done (going backwards from today)
  let streak = 0;
  const checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    // Use allTasks (completed tasks) to check days outside the current period range
    const dayTasksInRange = tasks.filter((t) => t.due_date === dateStr);
    const dayTasksCompleted = allTasks.filter((t) => t.due_date === dateStr && t.status === 'done');
    const dayTasks = dayTasksInRange.length > 0 ? dayTasksInRange : (dayTasksCompleted.length > 0 ? dayTasksCompleted : []);

    if (dayTasks.length > 0) {
      const dayDone = dayTasks.filter((t) => t.status === 'done').length;
      if (dayDone === dayTasks.length) {
        streak++;
      } else {
        break;
      }
    } else if (dateStr < todayStr) {
      // Skip days with no tasks (don't break streak)
      // But if it's a past day with no tasks assigned, just skip
    } else if (dateStr === todayStr) {
      // Today with no tasks - skip, don't break
    } else {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Recently completed
  const recentlyCompleted = allTasks
    .filter((t) => t.status === 'done' && t.completed_at)
    .slice(0, 10);

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-4 dark:text-white">Task Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-xl font-bold dark:text-white">Task Dashboard</h1>
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-1.5 text-sm font-medium ${period === 'week' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-1.5 text-sm font-medium ${period === 'month' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total tasks" value={totalTasks} />
        <StatCard label="Completed" value={doneTasks} accent="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Completion rate" value={`${completionRate}%`} accent="text-indigo-600 dark:text-indigo-400" />
        <StatCard label="Streak" value={`${streak} day${streak !== 1 ? 's' : ''}`} accent="text-amber-600 dark:text-amber-400" />
      </div>

      {/* Priority breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">By priority</h2>
        <div className="space-y-3">
          <PriorityBar label="High" done={highDone} total={highTotal} color="bg-red-500" />
          <PriorityBar label="Medium" done={medDone} total={medTotal} color="bg-amber-500" />
          <PriorityBar label="Low" done={lowDone} total={lowTotal} color="bg-blue-500" />
        </div>
      </div>

      {/* Daily chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Daily breakdown</h2>
        {dayStats.every((d) => d.total === 0) ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No tasks in this period.</p>
        ) : (
          <div className={`flex items-end gap-1 ${period === 'month' ? 'overflow-x-auto' : ''}`}>
            {dayStats.map((day) => {
              const height = day.total > 0 ? Math.max((day.total / maxDayTotal) * 120, 16) : 4;
              const doneHeight = day.total > 0 ? (day.done / day.total) * height : 0;
              const isToday = day.date === todayStr;
              return (
                <div key={day.date} className="flex flex-col items-center flex-1 min-w-[24px]" title={`${day.date}: ${day.done}/${day.total} done`}>
                  <div className="relative w-full flex flex-col items-center" style={{ height: 120 }}>
                    <div className="absolute bottom-0 w-3/4 max-w-[24px] rounded-t" style={{ height, backgroundColor: '#e5e7eb' }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-emerald-500"
                        style={{ height: doneHeight }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs mt-1 ${isToday ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {period === 'week' ? getWeekdayLabel(day.date) : getShortDateLabel(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Done</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Remaining</span>
        </div>
      </div>

      {/* Recently completed */}
      {recentlyCompleted.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Recently completed</h2>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentlyCompleted.map((task) => (
              <li key={task.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{task.title}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {task.completed_at
                    ? new Date(task.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ?? 'text-gray-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}

function PriorityBar({ label, done, total, color }: { label: string; done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">{done}/{total}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
