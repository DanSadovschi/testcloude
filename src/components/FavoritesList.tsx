import { useEffect } from 'react';
import { useFavoriteStore } from '../stores/favoriteStore';
import { useProjectStore } from '../stores/projectStore';
import { useTimerStore } from '../stores/timerStore';

export default function FavoritesList() {
  const { favorites, fetchFavorites, removeFavorite } = useFavoriteStore();
  const { projects } = useProjectStore();
  const { startTimer, runningEntry } = useTimerStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (favorites.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Favorites
      </h3>
      <div className="flex flex-wrap gap-2">
        {favorites.map((fav) => {
          const project = projects.find((p) => p.id === fav.project_id);
          return (
            <div key={fav.id} className="group flex items-center">
              <button
                disabled={!!runningEntry}
                onClick={() => startTimer(fav.description, fav.project_id, fav.billable)}
                className="flex items-center gap-1.5 rounded-l-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm hover:bg-indigo-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {project && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                )}
                <span className="dark:text-gray-200">{fav.description || 'Untitled'}</span>
                {fav.billable && (
                  <span className="text-green-600 dark:text-green-400 font-bold text-xs">$</span>
                )}
              </button>
              <button
                onClick={() => removeFavorite(fav.id)}
                className="border border-l-0 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-1.5 py-1.5 rounded-r-full text-gray-400 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove favorite"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
