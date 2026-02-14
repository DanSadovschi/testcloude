/**
 * Format seconds into HH:MM:SS string.
 */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Calculate duration in seconds between two ISO date strings.
 */
export function calculateDurationSeconds(start: string, end: string): number {
  return Math.max(0, Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000));
}

/**
 * Get start-of-day in local timezone as ISO string.
 */
export function getStartOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Get start of the current week (Monday) in local timezone as ISO string.
 */
export function getStartOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Get start of the current month in local timezone as ISO string.
 */
export function getStartOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Format an ISO date string to a local readable format.
 */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format an ISO date string for an <input type="datetime-local"> value.
 */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

/**
 * Convert a datetime-local input value back to an ISO string.
 */
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

/**
 * Format currency amount.
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
