import { formatDuration, formatCurrency } from '../utils/time';

interface StatsCardsProps {
  todaySeconds: number;
  weekSeconds: number;
  billableSeconds: number;
  billableAmount: number;
}

export default function StatsCards({ todaySeconds, weekSeconds, billableSeconds, billableAmount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today</p>
        <p className="text-2xl font-bold font-mono dark:text-white">{formatDuration(todaySeconds)}</p>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">This week</p>
        <p className="text-2xl font-bold font-mono dark:text-white">{formatDuration(weekSeconds)}</p>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Billable (week)</p>
        <p className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">{formatDuration(billableSeconds)}</p>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Earnings (week)</p>
        <p className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">{formatCurrency(billableAmount)}</p>
      </div>
    </div>
  );
}
