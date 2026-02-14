import { formatDuration } from '../utils/time';

interface StatsCardsProps {
  todaySeconds: number;
  weekSeconds: number;
}

export default function StatsCards({ todaySeconds, weekSeconds }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500 mb-1">Today</p>
        <p className="text-2xl font-bold font-mono">{formatDuration(todaySeconds)}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500 mb-1">This week</p>
        <p className="text-2xl font-bold font-mono">{formatDuration(weekSeconds)}</p>
      </div>
    </div>
  );
}
