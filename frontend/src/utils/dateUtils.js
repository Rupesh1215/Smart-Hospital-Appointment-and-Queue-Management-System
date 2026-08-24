/**
 * Format a date string to a readable format
 * e.g., "12 August 2026"
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time string to 12-hour format
 * e.g., "09:20" → "09:20 AM"
 */
export function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Get a relative time string (e.g., "in 2 hours", "yesterday")
 */
export function getRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date - now;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMins) < 1) return 'just now';
  if (diffMins > 0 && diffMins < 60) return `in ${diffMins} min`;
  if (diffMins < 0 && diffMins > -60) return `${Math.abs(diffMins)} min ago`;
  if (diffHours > 0 && diffHours < 24) return `in ${diffHours} hours`;
  if (diffHours < 0 && diffHours > -24) return `${Math.abs(diffHours)} hours ago`;
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';
  return formatDate(dateStr);
}

/**
 * Check if a date is today
 */
export function isToday(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Format waiting time in minutes to a human-readable string
 */
export function formatWaitingTime(minutes) {
  if (minutes < 1) return 'Less than a minute';
  if (minutes < 60) return `~${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `~${hrs}h ${mins}m` : `~${hrs}h`;
}
