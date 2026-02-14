import { FormEvent, useState } from 'react';
import { useEntryStore } from '../stores/entryStore';
import { useProjectStore } from '../stores/projectStore';
import {
  formatDuration,
  formatDateTime,
  toDatetimeLocalValue,
  fromDatetimeLocalValue,
  calculateDurationSeconds,
} from '../utils/time';
import type { TimeEntry } from '../types';

export default function EntryRow({ entry }: { entry: TimeEntry }) {
  const { updateEntry, deleteEntry } = useEntryStore();
  const { projects } = useProjectStore();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [description, setDescription] = useState(entry.description);
  const [projectId, setProjectId] = useState(entry.project_id ?? '');
  const [startTime, setStartTime] = useState(toDatetimeLocalValue(entry.start_time));
  const [endTime, setEndTime] = useState(
    entry.end_time ? toDatetimeLocalValue(entry.end_time) : ''
  );
  const [error, setError] = useState<string | null>(null);

  const project = projects.find((p) => p.id === entry.project_id);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const start = fromDatetimeLocalValue(startTime);
    const end = fromDatetimeLocalValue(endTime);

    if (new Date(end) <= new Date(start)) {
      setError('End time must be after start time');
      return;
    }

    const ok = await updateEntry(entry.id, {
      description,
      project_id: projectId || null,
      start_time: start,
      end_time: end,
    });
    if (ok) setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await deleteEntry(entry.id);
  };

  if (editing) {
    return (
      <tr className="bg-indigo-50">
        <td colSpan={5} className="px-4 py-3">
          <form onSubmit={handleSave} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 items-center">
              <label className="text-sm text-gray-600">Start:</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <label className="text-sm text-gray-600">End:</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
              {startTime && endTime && (
                <span className="text-sm text-gray-500 font-mono">
                  = {formatDuration(
                    Math.max(
                      0,
                      calculateDurationSeconds(
                        fromDatetimeLocalValue(startTime),
                        fromDatetimeLocalValue(endTime)
                      )
                    )
                  )}
                </span>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">
        {entry.description || <span className="text-gray-400 italic">No description</span>}
      </td>
      <td className="px-4 py-3 text-sm">
        {project ? (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: project.color }}
            />
            {project.name}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatDateTime(entry.start_time)}
        {entry.end_time && (
          <>
            <span className="mx-1">→</span>
            {formatDateTime(entry.end_time)}
          </>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-mono">
        {entry.duration_seconds != null ? formatDuration(entry.duration_seconds) : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-right">
        <button
          onClick={() => setEditing(true)}
          className="text-gray-400 hover:text-indigo-600 mr-3"
        >
          Edit
        </button>
        {confirming ? (
          <>
            <button
              onClick={() => setConfirming(false)}
              className="text-gray-400 hover:text-gray-600 mr-1"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 font-medium"
            >
              Confirm
            </button>
          </>
        ) : (
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}
