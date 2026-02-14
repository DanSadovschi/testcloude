import { useEffect, useRef, useState } from 'react';
import { useTimerStore } from '../stores/timerStore';
import { useProjectStore } from '../stores/projectStore';
import { formatDuration } from '../utils/time';

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
    tick,
  } = useTimerStore();

  const { projects, fetchProjects } = useProjectStore();

  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const isRunning = !!runningEntry;

  // Fetch running entry + projects on mount
  useEffect(() => {
    fetchRunningEntry();
    fetchProjects();
  }, [fetchRunningEntry, fetchProjects]);

  // Sync local inputs when a running entry is loaded from DB
  useEffect(() => {
    if (runningEntry) {
      setDescription(runningEntry.description);
      setProjectId(runningEntry.project_id);
    }
  }, [runningEntry]);

  // Tick interval
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
    await startTimer(description, projectId);
  };

  const handleStop = async () => {
    await stopTimer();
    setDescription('');
    setProjectId(null);
  };

  const handleDescriptionBlur = () => {
    if (isRunning) {
      updateRunningDescription(description);
    }
  };

  const handleProjectChange = (value: string) => {
    const id = value === '' ? null : value;
    setProjectId(id);
    if (isRunning) {
      updateRunningProject(id);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 mb-6">
        <p className="text-gray-500">Loading timer...</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-4 mb-6 ${
        isRunning ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white"
        />
        <select
          value={projectId ?? ''}
          onChange={(e) => handleProjectChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white"
        >
          <option value="">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="font-mono text-lg font-bold min-w-[80px] text-center">
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
