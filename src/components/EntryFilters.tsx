import { useEntryStore } from '../stores/entryStore';
import { useProjectStore } from '../stores/projectStore';
import type { DatePreset } from '../types';

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'all', label: 'All time' },
];

export default function EntryFilters() {
  const { filters, setFilters } = useEntryStore();
  const { projects } = useProjectStore();

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex rounded-md border border-gray-300 overflow-hidden">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setFilters({ datePreset: preset.value })}
            className={`px-3 py-1.5 text-sm ${
              filters.datePreset === preset.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <select
        value={filters.projectId ?? ''}
        onChange={(e) => setFilters({ projectId: e.target.value || null })}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white"
      >
        <option value="">All projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
