import { useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import ProjectForm from '../components/ProjectForm';
import ProjectList from '../components/ProjectList';

export default function ProjectsPage() {
  const { fetchProjects, error } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Projects</h1>
      <ProjectForm />
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <ProjectList />
    </div>
  );
}
