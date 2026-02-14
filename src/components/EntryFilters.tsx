import { useEntryStore } from '../stores/entryStore';
import { useProjectStore } from '../stores/projectStore';
import { useTagStore } from '../stores/tagStore';
import type { DatePreset } from '../types';

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
];

export default function EntryFilters() {
  const { filters, setFilters } = useEntryStore();
  const { projects } = useProjectStore();
  const { tags } = useTagStore();

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Date presets */}
        <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setFilters({ datePreset: preset.value })}
              className={`px-3 py-1.5 text-sm ${
                filters.datePreset === preset.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Project filter */}
        <select
          value={filters.projectId ?? ''}
          onChange={(e) => setFilters({ projectId: e.target.value || null })}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Tag filter */}
        <select
          value={filters.tagId ?? ''}
          onChange={(e) => setFilters({ tagId: e.target.value || null })}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Billable filter */}
        <select
          value={filters.billable}
          onChange={(e) => setFilters({ billable: e.target.value as 'all' | 'billable' | 'non-billable' })}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="all">All entries</option>
          <option value="billable">Billable</option>
          <option value="non-billable">Non-billable</option>
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search descriptions..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 w-48"
        />
      </div>
    </div>
  );
}
