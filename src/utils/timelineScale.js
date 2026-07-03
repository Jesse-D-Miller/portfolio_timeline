export const AXIS_START_YEAR = 1994;
export const PIXELS_PER_YEAR = 360;
export const FOCUS_YEAR = 2013;

/**
 * The last year the axis should cover — at least the current year (computed
 * at call time, not a constant, so it never goes stale), but extended
 * further if any event runs past it, since the data can include
 * future-dated events (an upcoming program's start/end) that need room too.
 * @param {Array<{date: string, endDate?: string}>} [events]
 * @returns {number}
 */
export function getAxisEndYear(events = []) {
  const currentYear = new Date().getFullYear();
  const eventYears = events.flatMap((event) =>
    [event.date, event.endDate]
      .filter(Boolean)
      .map((value) => new Date(value).getUTCFullYear()),
  );
  return Math.max(currentYear, ...eventYears);
}

/**
 * Converts an ISO "YYYY-MM-DD" or "YYYY-MM" date string into a pixel offset
 * along the timeline axis, anchored at AXIS_START_YEAR. UTC fields are used
 * throughout so a viewer's local timezone can never shift a date across a
 * month/year boundary relative to how the date was authored.
 * @param {string} isoDate
 * @param {number} [pixelsPerYear]
 * @returns {number}
 */
export function dateToPixels(isoDate, pixelsPerYear = PIXELS_PER_YEAR) {
  const date = new Date(isoDate);
  const yearFraction =
    date.getUTCFullYear() + (date.getUTCMonth() + date.getUTCDate() / 31) / 12;
  return (yearFraction - AXIS_START_YEAR) * pixelsPerYear;
}

/**
 * Total scrollable width of the axis, from AXIS_START_YEAR through one year
 * past axisEndYear so the most recent events aren't flush against the
 * track's clipped edge.
 * @param {number} axisEndYear - from getAxisEndYear()
 * @param {number} [pixelsPerYear]
 * @returns {number}
 */
export function getAxisTotalWidth(
  axisEndYear,
  pixelsPerYear = PIXELS_PER_YEAR,
) {
  return (axisEndYear + 1 - AXIS_START_YEAR) * pixelsPerYear;
}
