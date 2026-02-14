import { formatDuration } from '../utils/time';

interface ProjectTotal {
  id: string | null;
  name: string;
  color: string;
  totalSeconds: number;
}

export default function ProjectTotals({ totals }: { totals: ProjectTotal[] }) {
  if (totals.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No tracked time yet.</p>;
  }

  const sorted = [...totals].sort((a, b) => b.totalSeconds - a.totalSeconds);
  const maxSeconds = sorted[0]?.totalSeconds ?? 1;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 dark:text-white">By project</h2>
      <ul className="space-y-2">
        {sorted.map((item) => (
          <li
            key={item.id ?? 'none'}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium dark:text-gray-200">{item.name}</span>
              </div>
              <span className="font-mono text-gray-700 dark:text-gray-300">{formatDuration(item.totalSeconds)}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.round((item.totalSeconds / maxSeconds) * 100)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
