import { useEffect } from 'react';
import { useEntryStore } from '../stores/entryStore';
import { useProjectStore } from '../stores/projectStore';
import { useTagStore } from '../stores/tagStore';
import EntryFilters from '../components/EntryFilters';
import EntryRow from '../components/EntryRow';

export default function EntriesPage() {
  const { entries, loading, error, fetchEntries, selectedIds, selectAll, clearSelection, bulkDelete } = useEntryStore();
  const { fetchProjects } = useProjectStore();
  const { fetchTags } = useTagStore();

  useEffect(() => {
    fetchProjects();
    fetchTags();
    fetchEntries();
  }, [fetchProjects, fetchTags, fetchEntries]);

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    await bulkDelete(Array.from(selectedIds));
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 dark:text-white">Time Entries</h1>
      <EntryFilters />

      {/* Bulk actions bar */}
      {entries.length > 0 && (
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={selectedIds.size === entries.length ? clearSelection : selectAll}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {selectedIds.size === entries.length ? 'Deselect all' : 'Select all'}
          </button>
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="text-sm text-red-600 hover:underline font-medium"
              >
                Delete selected
              </button>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading entries...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No entries found for the selected filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-2 py-3 w-8"></th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Description</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Project</th>
                <th className="px-2 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 w-8">$</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Time</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Duration</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
