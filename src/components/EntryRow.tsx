import { type FormEvent, useState } from 'react';
import { useEntryStore } from '../stores/entryStore';
import { useProjectStore } from '../stores/projectStore';
import { useTagStore } from '../stores/tagStore';
import {
  formatDuration,
  formatDateTime,
  toDatetimeLocalValue,
  fromDatetimeLocalValue,
  calculateDurationSeconds,
} from '../utils/time';
import type { TimeEntry } from '../types';
import BillableToggle from './BillableToggle';
import TagSelector from './TagSelector';

export default function EntryRow({ entry }: { entry: TimeEntry }) {
  const { updateEntry, deleteEntry, toggleSelected, selectedIds, setEntryTags } = useEntryStore();
  const { projects } = useProjectStore();
  const { tags } = useTagStore();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [description, setDescription] = useState(entry.description);
  const [projectId, setProjectId] = useState(entry.project_id ?? '');
  const [billable, setBillable] = useState(entry.billable);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    entry.tags?.map((t) => t.id) ?? []
  );
  const [startTime, setStartTime] = useState(toDatetimeLocalValue(entry.start_time));
  const [endTime, setEndTime] = useState(
    entry.end_time ? toDatetimeLocalValue(entry.end_time) : ''
  );
  const [error, setError] = useState<string | null>(null);

  const project = projects.find((p) => p.id === entry.project_id);
  const isSelected = selectedIds.has(entry.id);

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
      billable,
    });

    // Update tags
    const currentTagIds = entry.tags?.map((t) => t.id) ?? [];
    const tagsChanged =
      selectedTagIds.length !== currentTagIds.length ||
      selectedTagIds.some((id) => !currentTagIds.includes(id));
    if (tagsChanged) {
      await setEntryTags(entry.id, selectedTagIds);
    }

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
      <tr className="bg-indigo-50 dark:bg-indigo-950">
        <td colSpan={7} className="px-4 py-3">
          <form onSubmit={handleSave} className="space-y-3">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
              />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <BillableToggle billable={billable} onChange={setBillable} size="sm" />
              <TagSelector tags={tags} selected={selectedTagIds} onChange={setSelectedTagIds} />
            </div>
            <div className="flex gap-3 items-center">
              <label className="text-sm text-gray-600 dark:text-gray-400">Start:</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
              />
              <label className="text-sm text-gray-600 dark:text-gray-400">End:</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
              />
              {startTime && endTime && (
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
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
                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
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
    <tr className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="px-2 py-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelected(entry.id)}
          className="rounded text-indigo-600"
        />
      </td>
      <td className="px-4 py-3 text-sm dark:text-gray-200">
        <div>
          {entry.description || <span className="text-gray-400 dark:text-gray-500 italic">No description</span>}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {entry.tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex rounded-full px-1.5 py-0.5 text-xs text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm dark:text-gray-200">
        {project ? (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: project.color }}
            />
            {project.name}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">--</span>
        )}
      </td>
      <td className="px-2 py-3 text-center">
        {entry.billable ? (
          <span className="text-green-600 dark:text-green-400 font-bold text-sm">$</span>
        ) : (
          <span className="text-gray-300 dark:text-gray-600 text-sm">$</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {formatDateTime(entry.start_time)}
        {entry.end_time && (
          <>
            <span className="mx-1">&rarr;</span>
            {formatDateTime(entry.end_time)}
          </>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-mono dark:text-gray-200">
        {entry.duration_seconds != null ? formatDuration(entry.duration_seconds) : '--'}
      </td>
      <td className="px-4 py-3 text-sm text-right">
        <button
          onClick={() => setEditing(true)}
          className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mr-3"
        >
          Edit
        </button>
        {confirming ? (
          <>
            <button
              onClick={() => setConfirming(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-1"
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
