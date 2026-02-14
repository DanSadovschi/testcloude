interface BillableToggleProps {
  billable: boolean;
  onChange: (billable: boolean) => void;
  size?: 'sm' | 'md';
}

export default function BillableToggle({ billable, onChange, size = 'md' }: BillableToggleProps) {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';

  return (
    <button
      type="button"
      onClick={() => onChange(!billable)}
      className={`${sizeClasses} rounded-full font-bold flex items-center justify-center transition-colors ${
        billable
          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
      }`}
      title={billable ? 'Billable' : 'Non-billable'}
    >
      $
    </button>
  );
}
