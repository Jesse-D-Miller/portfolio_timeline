export const TRACK_IDS = ['career', 'education', 'independent'];

// Baseline as a fraction of the track-group's measured height. Independent
// sits between the two trunks, per the subway-map layout requirement.
export const TRACK_BASELINE_FRACTION = {
  career: 0.25,
  independent: 0.5,
  education: 0.75,
};

// Octolinear pattern (subway-map style): every track is built from only
// horizontal runs, 45-degree diagonals, and vertical jogs — no curves.
// Each cycle holds flat at the baseline, jogs diagonally up (or down, on
// alternating cycles) by AMPLITUDE_PX, holds flat there, then drops/rises
// straight back to baseline (a true vertical segment) before the next
// cycle begins.
const FLAT_LEN_PX = 200;
export const TRACK_AMPLITUDE_PX = 24; // also the diagonal run's length, since 45deg means dx=dy
const CYCLE_LEN_PX = FLAT_LEN_PX * 2 + TRACK_AMPLITUDE_PX;

// Per-track phase offset (px) so the three tracks' jogs don't all happen at
// the same x position.
const TRACK_PHASE_PX = {
  career: 0,
  independent: CYCLE_LEN_PX / 3,
  education: (CYCLE_LEN_PX * 2) / 3,
};

function mod(n, m) {
  return ((n % m) + m) % m;
}

function cycleDirection(cycleIndex) {
  return mod(cycleIndex, 2) === 0 ? 1 : -1;
}

/**
 * Resolves a track's absolute y (px, relative to the track-group's own
 * height) at a given x. Pure function — no DOM/layout dependency; the
 * caller resolves baselinePx once from a measured container height and
 * passes it in, so the path and every marker share the exact same value.
 * Single source of truth shared by the rendered SVG path and marker
 * positioning, so a marker can never visually drift off its trunk's line.
 * @param {string} trackId
 * @param {number} x - pixel offset along the date axis
 * @param {number} baselinePx
 * @returns {number}
 */
export function getTrackY(trackId, x, baselinePx) {
  const phase = TRACK_PHASE_PX[trackId] ?? 0;
  const shiftedX = x + phase;
  const cycleIndex = Math.floor(shiftedX / CYCLE_LEN_PX);
  const localX = shiftedX - cycleIndex * CYCLE_LEN_PX;
  const direction = cycleDirection(cycleIndex);

  if (localX < FLAT_LEN_PX) return baselinePx;
  const afterFlat = localX - FLAT_LEN_PX;
  if (afterFlat < TRACK_AMPLITUDE_PX) {
    return baselinePx + direction * afterFlat; // 45-degree diagonal
  }
  return baselinePx + direction * TRACK_AMPLITUDE_PX; // flat at the jog's peak/trough
}

/**
 * Builds an SVG path `d` string tracing a track's exact octolinear shape
 * between rangeStart and rangeEnd, using exact cycle-vertex coordinates
 * (not sampling) so every segment is a precise horizontal, vertical, or
 * 45-degree line — matching getTrackY exactly, so the line and markers can
 * never disagree. Used both for the full background track line
 * ([0, totalWidth]) and for a ranged event's bar ([startX, endX]), so a
 * bar spanning a jog visually follows it instead of cutting straight
 * through.
 * @param {string} trackId
 * @param {number} rangeStart
 * @param {number} rangeEnd
 * @param {number} baselinePx
 * @returns {string}
 */
export function buildTrackPathD(trackId, rangeStart, rangeEnd, baselinePx) {
  const phase = TRACK_PHASE_PX[trackId] ?? 0;
  // Only collect vertices strictly inside the range — the exact start/end
  // points are computed separately via getTrackY below, since a clamped
  // vertex's own y can be wrong (it belongs to whatever x it was meant
  // for, not necessarily the boundary it gets clamped to). This is what
  // previously caused a ranged bar's start/end to visually deviate from
  // the track's true path at those exact dates.
  const interiorPoints = [];

  let cycleIndex = Math.floor((rangeStart + phase) / CYCLE_LEN_PX) - 1;
  for (;;) {
    const origin = cycleIndex * CYCLE_LEN_PX - phase;
    if (origin > rangeEnd) break;

    const direction = cycleDirection(cycleIndex);
    const peakY = baselinePx + direction * TRACK_AMPLITUDE_PX;
    const cycleVertices = [
      [origin, baselinePx],
      [origin + FLAT_LEN_PX, baselinePx],
      [origin + FLAT_LEN_PX + TRACK_AMPLITUDE_PX, peakY],
      [origin + FLAT_LEN_PX + TRACK_AMPLITUDE_PX + FLAT_LEN_PX, peakY],
    ];
    for (const vertex of cycleVertices) {
      if (vertex[0] > rangeStart && vertex[0] < rangeEnd) {
        interiorPoints.push(vertex);
      }
    }

    cycleIndex += 1;
  }

  const points = [
    [rangeStart, getTrackY(trackId, rangeStart, baselinePx)],
    ...interiorPoints,
    [rangeEnd, getTrackY(trackId, rangeEnd, baselinePx)],
  ];

  const deduped = points.filter(
    (point, i, arr) =>
      i === 0 || point[0] !== arr[i - 1][0] || point[1] !== arr[i - 1][1],
  );

  return `M${deduped.map(([x, y]) => `${x},${y}`).join(' L')}`;
}
