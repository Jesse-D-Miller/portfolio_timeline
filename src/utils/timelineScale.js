export const AXIS_START_YEAR = 1994;
export const PIXELS_PER_YEAR = 120;
export const FOCUS_YEAR = 2013;

/**
 * The last year the axis should cover. Computed at call time (not a
 * constant) so the axis always extends through "now" without a stale build.
 * @returns {number}
 */
export function getAxisEndYear() {
  return new Date().getFullYear();
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
 * past getAxisEndYear() so the most recent events aren't flush against the
 * track's clipped edge.
 * @param {number} [pixelsPerYear]
 * @returns {number}
 */
export function getAxisTotalWidth(pixelsPerYear = PIXELS_PER_YEAR) {
  return (getAxisEndYear() + 1 - AXIS_START_YEAR) * pixelsPerYear;
}
