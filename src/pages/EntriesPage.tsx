import { useEffect } from 'react';
import { useEntryStore } from '../stores/entryStore';
import { useProjectStore } from '../stores/projectStore';
import EntryFilters from '../components/EntryFilters';
import EntryRow from '../components/EntryRow';

export default function EntriesPage() {
  const { entries, loading, error, fetchEntries } = useEntryStore();
  const { fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
    fetchEntries();
  }, [fetchProjects, fetchEntries]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Time Entries</h1>
      <EntryFilters />
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Loading entries...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">No entries found for the selected filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Description</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Project</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Time</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Duration</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-right">Actions</th>
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
