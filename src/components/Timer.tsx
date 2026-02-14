import { useEffect, useRef, useState } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useProjectStore } from '../stores/projectStore';
import { useFavoriteStore } from '../stores/favoriteStore';
import { formatDuration } from '../utils/time';
import BillableToggle from './BillableToggle';

export default function Timer() {
  const {
    runningEntry,
    elapsedSeconds,
    loading,
    fetchRunningEntry,
    startTimer,
    stopTimer,
    updateRunningDescription,
    updateRunningProject,
    updateRunningBillable,
    tick,
  } = useTimerStore();

  const { projects, fetchProjects } = useProjectStore();
  const { addFavorite } = useFavoriteStore();

  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [billable, setBillable] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const isRunning = !!runningEntry;

  useEffect(() => {
    fetchRunningEntry();
    fetchProjects();
  }, [fetchRunningEntry, fetchProjects]);

  useEffect(() => {
    if (runningEntry) {
      setDescription(runningEntry.description);
      setProjectId(runningEntry.project_id);
      setBillable(runningEntry.billable);
    }
  }, [runningEntry]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const handleStart = async () => {
    await startTimer(description, projectId, billable);
  };

  const handleStop = async () => {
    await stopTimer();
    setDescription('');
    setProjectId(null);
    setBillable(false);
  };

  const handleDescriptionBlur = () => {
    if (isRunning) updateRunningDescription(description);
  };

  const handleProjectChange = (value: string) => {
    const id = value === '' ? null : value;
    setProjectId(id);
    if (isRunning) updateRunningProject(id);
  };

  const handleBillableChange = (val: boolean) => {
    setBillable(val);
    if (isRunning) updateRunningBillable(val);
  };

  const handleSaveFavorite = async () => {
    await addFavorite(description, projectId, billable);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-6">
        <p className="text-gray-500 dark:text-gray-400">Loading timer...</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-4 mb-6 ${
        isRunning
          ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        />
        <select
          value={projectId ?? ''}
          onChange={(e) => handleProjectChange(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
        >
          <option value="">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <BillableToggle billable={billable} onChange={handleBillableChange} />
        {!isRunning && (description || projectId) && (
          <button
            onClick={handleSaveFavorite}
            className="text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400"
            title="Save as favorite"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        )}
        <span className="font-mono text-lg font-bold min-w-[80px] text-center dark:text-white">
          {formatDuration(elapsedSeconds)}
        </span>
        {isRunning ? (
          <button
            onClick={handleStop}
            className="rounded-md bg-red-600 px-5 py-2 text-white font-medium hover:bg-red-700"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="rounded-md bg-indigo-600 px-5 py-2 text-white font-medium hover:bg-indigo-700"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
}
