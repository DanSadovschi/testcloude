import { type FormEvent, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { PROJECT_COLORS } from '../utils/constants';

export default function ProjectForm() {
  const createProject = useProjectStore((s) => s.createProject);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const ok = await createProject(name.trim(), color);
    if (ok) {
      setName('');
      setColor(PROJECT_COLORS[0]);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 mb-6">
      <div className="flex-1">
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
          New project
        </label>
        <input
          id="project-name"
          type="text"
          placeholder="Project name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <div className="flex gap-1">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 ${
                color === c ? 'border-gray-800 scale-110' : 'border-transparent'
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
