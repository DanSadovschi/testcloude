import { type FormEvent, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { PROJECT_COLORS } from '../utils/constants';

export default function ProjectForm() {
  const createProject = useProjectStore((s) => s.createProject);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const rate = hourlyRate ? parseFloat(hourlyRate) : null;
    const ok = await createProject(name.trim(), color, rate);
    if (ok) {
      setName('');
      setColor(PROJECT_COLORS[0]);
      setHourlyRate('');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 mb-6 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New project
        </label>
        <input
          id="project-name"
          type="text"
          placeholder="Project name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate ($/hr)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          className="w-24 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
        <div className="flex gap-1">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 ${
                color === c ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}
