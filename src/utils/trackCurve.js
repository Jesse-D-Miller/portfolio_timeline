export const TRACK_IDS = ['career', 'achievement', 'project', 'education'];

// Baseline as a fraction of the track-group's measured height, top-to-
// bottom visual order: Career, Achievement, Project, Education. Gaps are
// deliberately slightly uneven (0.13/0.14/0.13) rather than perfectly
// even — even spacing would put a dip from Achievement toward Education
// land exactly on Project's own baseline, a confusing coincidence rather
// than an intentional crossing.
export const TRACK_BASELINE_FRACTION = {
  career: 0.3,
  achievement: 0.43,
  project: 0.57,
  education: 0.7,
};

/**
 * @typedef {Object} Deviation
 * @property {number} footprintStart - x where the line leaves baseline
 * @property {number} peakStart - x where it reaches peakOffsetPx
 * @property {number} peakEnd - x where it starts returning to baseline
 * @property {number} footprintEnd - x where it's back at baseline
 * @property {number} peakOffsetPx - signed y offset from baseline at the peak/plateau
 * @property {number} [entryOffsetPx] - signed y offset at footprintStart,
 *   default 0 (flat baseline). A concurrent-job branch lane sets this to
 *   the primary line's own offset at that x, so the branch visibly forks
 *   off the primary line instead of off flat baseline.
 * @property {number} [exitOffsetPx] - same as entryOffsetPx, at footprintEnd
 */

/**
 * Resolves a track's y at x, given that track's own pre-resolved deviation
 * list (built by buildTrackDeviations). Pure function — no DOM/layout
 * access. Single source of truth shared by the rendered SVG path and
 * marker positioning, so a marker can never visually drift off its line.
 * @param {number} x
 * @param {number} baselinePx
 * @param {Deviation[]} deviations - sorted by footprintStart, non-overlapping
 * @returns {number}
 */
export function getTrackY(x, baselinePx, deviations) {
  for (const d of deviations) {
    // Inclusive bounds: a branch deviation's entryOffsetPx/exitOffsetPx
    // can be nonzero (it forks off the primary line's own current offset,
    // not flat baseline), and a bar's own rangeStart/rangeEnd in
    // buildTrackPathD lands exactly on footprintStart/footprintEnd — an
    // exclusive check here would skip the deviation right at that edge
    // and silently fall back to flat baseline instead of entry/exitOffsetPx.
    if (x < d.footprintStart || x > d.footprintEnd) continue;

    if (x >= d.peakStart && x <= d.peakEnd) {
      return baselinePx + d.peakOffsetPx;
    }
    const entryOffsetPx = d.entryOffsetPx ?? 0;
    const exitOffsetPx = d.exitOffsetPx ?? 0;
    if (x < d.peakStart) {
      const span = d.peakStart - d.footprintStart;
      const t = span > 0 ? (x - d.footprintStart) / span : 1;
      return baselinePx + entryOffsetPx + (d.peakOffsetPx - entryOffsetPx) * t;
    }
    const span = d.footprintEnd - d.peakEnd;
    const t = span > 0 ? (d.footprintEnd - x) / span : 1;
    return baselinePx + exitOffsetPx + (d.peakOffsetPx - exitOffsetPx) * t;
  }
  return baselinePx;
}

/**
 * Builds an SVG path `d` string tracing a track's exact octolinear shape
 * between rangeStart and rangeEnd, using exact deviation-vertex
 * coordinates (not sampling) so every segment is a precise horizontal,
 * vertical, or 45-degree line — matching getTrackY exactly, so the line
 * and markers can never disagree. Used both for the full background track
 * line ([0, totalWidth]) and for a ranged event's bar ([startX, endX]).
 *
 * rangeStart/rangeEnd's y is always computed via getTrackY, never by
 * clamping a nearby vertex's x while keeping its own y — that produces
 * the wrong y when the boundary falls mid-ramp, which previously caused
 * ranged-event bars to visually deviate from the track at their exact
 * start/end.
 * @param {number} rangeStart
 * @param {number} rangeEnd
 * @param {number} baselinePx
 * @param {Deviation[]} deviations
 * @returns {string}
 */
export function buildTrackPathD(rangeStart, rangeEnd, baselinePx, deviations) {
  const interiorPoints = [];

  for (const d of deviations) {
    // Merged achievement/project clusters may carry pathVertices — an
    // explicit list of [x, yOffset] pairs encoding a multi-level shape
    // (e.g. dip to one event's depth, 45° descent to the next level, then
    // flat). Use those directly instead of the standard 4-vertex formula.
    let verts;
    if (d.pathVertices) {
      verts = d.pathVertices.map(([x, yOffset]) => [x, baselinePx + yOffset]);
    } else {
      const peakY = baselinePx + d.peakOffsetPx;
      const entryY = baselinePx + (d.entryOffsetPx ?? 0);
      const exitY = baselinePx + (d.exitOffsetPx ?? 0);
      verts = [
        [d.footprintStart, entryY],
        [d.peakStart, peakY],
        [d.peakEnd, peakY],
        [d.footprintEnd, exitY],
      ];
    }
    for (const vertex of verts) {
      if (vertex[0] > rangeStart && vertex[0] < rangeEnd) {
        interiorPoints.push(vertex);
      }
    }
  }

  // Sort by x so overlapping-footprint deviations (e.g. an intro deviation
  // whose footprintEnd lands inside a tent deviation's footprint) don't
  // produce x-inversions in the path. Non-overlapping deviations are
  // already in x-order so the sort is a no-op for them.
  interiorPoints.sort((a, b) => a[0] - b[0]);

  const points = [
    [rangeStart, getTrackY(rangeStart, baselinePx, deviations)],
    ...interiorPoints,
    [rangeEnd, getTrackY(rangeEnd, baselinePx, deviations)],
  ];

  const deduped = points.filter(
    (point, i, arr) =>
      i === 0 || point[0] !== arr[i - 1][0] || point[1] !== arr[i - 1][1],
  );

  return `M${deduped.map(([x, y]) => `${x},${y}`).join(' L')}`;
}
