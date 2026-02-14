import { formatDuration } from '../utils/time';

interface ProjectTotal {
  id: string | null;
  name: string;
  color: string;
  totalSeconds: number;
}

export default function ProjectTotals({ totals }: { totals: ProjectTotal[] }) {
  if (totals.length === 0) {
    return <p className="text-gray-500">No tracked time yet.</p>;
  }

  const sorted = [...totals].sort((a, b) => b.totalSeconds - a.totalSeconds);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">By project</h2>
      <ul className="space-y-2">
        {sorted.map((item) => (
          <li
            key={item.id ?? 'none'}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium">{item.name}</span>
            </div>
            <span className="font-mono text-gray-700">{formatDuration(item.totalSeconds)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
