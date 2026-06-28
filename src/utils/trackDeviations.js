import { dateToPixels } from './timelineScale';
import { getTrackY } from './trackCurve';

// Amplitude for an independent achievement/project's brief bump. Also the
// max ramp length for those, since a true 45-degree diagonal requires
// dx === dy.
export const DEVIATION_BUMP_PX = 24;

// Flat hold width for an independent achievement/project's brief bump.
export const DEVIATION_PLATEAU_PX = 20;

// Flat hold width for a career/education-affiliated achievement/project's
// "touch" dip — deliberately narrower than DEVIATION_PLATEAU_PX so the
// contact reads as a brief graze rather than a sustained hover.
export const TOUCH_PLATEAU_PX = 10;

// Career/Education's own ranged events (jobs/degrees) scale how far they
// deviate by the event's actual duration, so a multi-year role rises
// further than a short one — base amplitude, plus extra per year of
// duration, capped at a max.
const TRUNK_RANGED_BASE_AMPLITUDE_PX = 36;
const TRUNK_RANGED_AMPLITUDE_PER_YEAR_PX = 6;
// Exported so TimelineMarker can size a ranged event's invisible hit-area
// to safely cover the tallest a trunk's bar could actually rise/fall.
export const TRUNK_RANGED_MAX_AMPLITUDE_PX = 64;

// Career/Education's own point events (no duration to scale by) still get
// a brief deviation now, smaller than the ranged amplitude, so the line
// has more movement overall rather than sitting dead flat between jobs.
const TRUNK_POINT_AMPLITUDE_PX = 20;

// Career's own elevation always goes up (negative = toward the top of the
// SVG); Education's always goes down — fixed directions, not alternating.
const TRUNK_DIRECTION = { career: -1, education: 1 };

function alternatingSign(index) {
  return index % 2 === 0 ? 1 : -1;
}

function tentDeviation(centerX, peakOffsetPx, plateauWidthPx, eventId) {
  const rampPx = Math.abs(peakOffsetPx);
  const halfPlateau = plateauWidthPx / 2;
  return {
    footprintStart: centerX - halfPlateau - rampPx,
    peakStart: centerX - halfPlateau,
    peakEnd: centerX + halfPlateau,
    footprintEnd: centerX + halfPlateau + rampPx,
    peakOffsetPx,
    eventId,
  };
}

// Career/Education's own ranged events: ramp up/down right at the start
// and end of the event, elevated for everything in between — "stay
// elevated for the entirety of the event." Ramp length is clamped to fit
// (and the offset clamped to match, to keep the ramp a true 45-degree
// diagonal) if the event is shorter than two ramps.
function sustainedDeviation(startX, endX, direction, amplitudePx, eventId) {
  const maxRampPx = Math.min(amplitudePx, (endX - startX) / 2);
  return {
    footprintStart: startX,
    peakStart: startX + maxRampPx,
    peakEnd: endX - maxRampPx,
    footprintEnd: endX,
    peakOffsetPx: direction * maxRampPx,
    eventId,
  };
}

/**
 * Defensive guard: if two adjacent deviations on the same track would
 * overlap, pull their footprints back to meet at the midpoint between
 * them. Not expected to trigger at the data scale this app ships with.
 * @param {Array} deviations - sorted by footprintStart
 */
function resolveOverlaps(deviations) {
  for (let i = 0; i < deviations.length - 1; i++) {
    const current = deviations[i];
    const next = deviations[i + 1];
    if (current.footprintEnd <= next.footprintStart) continue;

    const midpoint = (current.peakEnd + next.peakStart) / 2;
    current.footprintEnd = Math.min(current.footprintEnd, midpoint);
    current.peakEnd = Math.min(current.peakEnd, current.footprintEnd);
    next.footprintStart = Math.max(next.footprintStart, midpoint);
    next.peakStart = Math.max(next.peakStart, next.footprintStart);
  }
  return deviations;
}

/**
 * Builds an ordered, non-overlapping deviation list for one track from
 * that track's own events. Pure function — no DOM/layout access.
 * @param {string} trackId - 'career'|'achievement'|'project'|'education'
 * @param {Array} trackEvents - events already filtered to this track's category
 * @param {Record<string, number>} baselinesPx - all 4 tracks' resolved baseline y
 * @param {number} pixelsPerYear
 * @param {Record<string, Array>} [trunkDeviations] - already-built
 *   career/education deviation lists, needed to find exactly where those
 *   lines currently sit (possibly elevated) when an achievement/project
 *   dips toward one of them.
 * @returns {Array}
 */
export function buildTrackDeviations(
  trackId,
  trackEvents,
  baselinesPx,
  pixelsPerYear,
  trunkDeviations,
) {
  const sortedEvents = trackEvents
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (trackId === 'career' || trackId === 'education') {
    const direction = TRUNK_DIRECTION[trackId];
    const deviations = sortedEvents.map((event) => {
      const startX = dateToPixels(event.date, pixelsPerYear);

      if (!event.endDate) {
        return tentDeviation(
          startX,
          direction * TRUNK_POINT_AMPLITUDE_PX,
          DEVIATION_PLATEAU_PX,
          event.id,
        );
      }

      const endX = dateToPixels(event.endDate, pixelsPerYear);
      const durationYears = (endX - startX) / pixelsPerYear;
      const amplitudePx = Math.min(
        TRUNK_RANGED_BASE_AMPLITUDE_PX +
          durationYears * TRUNK_RANGED_AMPLITUDE_PER_YEAR_PX,
        TRUNK_RANGED_MAX_AMPLITUDE_PX,
      );
      return sustainedDeviation(startX, endX, direction, amplitudePx, event.id);
    });
    return resolveOverlaps(deviations);
  }

  const deviations = sortedEvents.map((event, index) => {
    const centerX = dateToPixels(event.date, pixelsPerYear);

    if (event.trackAffiliation === 'independent') {
      return tentDeviation(
        centerX,
        alternatingSign(index) * DEVIATION_BUMP_PX,
        DEVIATION_PLATEAU_PX,
        event.id,
      );
    }

    const targetTrack = event.trackAffiliation;
    const targetY = getTrackY(
      centerX,
      baselinesPx[targetTrack],
      trunkDeviations?.[targetTrack] ?? [],
    );
    const peakOffsetPx = targetY - baselinesPx[trackId];
    return tentDeviation(centerX, peakOffsetPx, TOUCH_PLATEAU_PX, event.id);
  });

  return resolveOverlaps(deviations);
}
