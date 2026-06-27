/**
 * Formats an ISO "YYYY-MM-DD" or "YYYY-MM" string as a human-readable label,
 * e.g. "2019-06" -> "June 2019", "2020-05-14" -> "May 14, 2020".
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  const hasDay = isoDate.split('-').length === 3;
  const date = new Date(isoDate);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: hasDay ? 'numeric' : undefined,
    timeZone: 'UTC',
  });
}
