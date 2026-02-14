import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { formatCurrency } from '../utils/time';
import type { Project } from '../types';

export default function ProjectList() {
  const { projects, loading } = useProjectStore();

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading projects...</p>;
  }

  if (projects.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No projects yet. Create one above.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {projects.map((project) => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </ul>
  );
}

function ProjectItem({ project }: { project: Project }) {
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    const result = await deleteProject(project.id);
    if (!result.ok) {
      setMessage(result.message ?? 'Failed to delete');
    } else if (result.message) {
      setMessage(result.message);
      setTimeout(() => setMessage(null), 3000);
    }
    setConfirming(false);
  };

  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span
          className="w-4 h-4 rounded-full inline-block"
          style={{ backgroundColor: project.color }}
        />
        <span className="font-medium dark:text-gray-200">{project.name}</span>
        {project.hourly_rate != null && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatCurrency(project.hourly_rate)}/hr
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {message && <span className="text-sm text-amber-600 dark:text-amber-400">{message}</span>}
        {confirming && (
          <button
            onClick={() => setConfirming(false)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleDelete}
          className={`text-sm ${confirming ? 'text-red-600 font-medium' : 'text-gray-400 hover:text-red-500'}`}
        >
          {confirming ? 'Confirm delete' : 'Delete'}
        </button>
      </div>
    </li>
  );
}
