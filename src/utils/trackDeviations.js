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

// Extra y-offset stacked onto each deeper concurrent-job lane on a trunk
// track, so two jobs held at once render as a second line running
// parallel to (and further from baseline than) the primary one, instead
// of overlapping illegibly on top of it. Exported so TimelineMarker can
// size a ranged hit-area tall enough to cover a branch lane too.
export const LANE_DEPTH_PX = 56;

function alternatingSign(index) {
  return index % 2 === 0 ? 1 : -1;
}

/**
 * Greedily packs ranged events (already sorted by date) into lanes, so
 * truly overlapping events — concurrent jobs, not one continuous run —
 * land in different lanes. Events that only touch (one's endDate equals
 * the next's date) stay in the same lane; groupIntoChains renders those
 * as one seamless span.
 * @param {Array} rangedEventsSorted
 * @returns {Array<Array>} one array of events per lane, lane 0 first
 */
function assignLanes(rangedEventsSorted) {
  const lanes = [];
  for (const event of rangedEventsSorted) {
    const start = new Date(event.date);
    const lane = lanes.find((l) => l.lastEnd <= start);
    if (lane) {
      lane.events.push(event);
      lane.lastEnd = new Date(event.endDate);
    } else {
      lanes.push({ events: [event], lastEnd: new Date(event.endDate) });
    }
  }
  return lanes.map((lane) => lane.events);
}

/**
 * Groups consecutive ranged events (already sorted by date) into chains
 * wherever one event's endDate exactly matches the next event's date — a
 * promotion within the same continuous run, not a separate stint. Each
 * chain gets rendered as one seamless elevated span instead of dipping
 * back to baseline between entries.
 * @param {Array} rangedEventsSorted
 * @returns {Array<Array>}
 */
function groupIntoChains(rangedEventsSorted) {
  const chains = [];
  for (const event of rangedEventsSorted) {
    const lastChain = chains[chains.length - 1];
    const previousEvent = lastChain?.[lastChain.length - 1];
    if (previousEvent && event.date === previousEvent.endDate) {
      lastChain.push(event);
    } else {
      chains.push([event]);
    }
  }
  return chains;
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

// Career/Education's own ranged events: ramp up/down right at the start
// and end of the chain, scaled by the chain's total duration, capped at
// TRUNK_RANGED_MAX_AMPLITUDE_PX — this is "the" line (lane 0).
function buildTrunkChainDeviation(chain, direction, pixelsPerYear) {
  const startX = dateToPixels(chain[0].date, pixelsPerYear);
  const endX = dateToPixels(chain[chain.length - 1].endDate, pixelsPerYear);
  const durationYears = (endX - startX) / pixelsPerYear;
  const amplitudePx = Math.min(
    TRUNK_RANGED_BASE_AMPLITUDE_PX +
      durationYears * TRUNK_RANGED_AMPLITUDE_PER_YEAR_PX,
    TRUNK_RANGED_MAX_AMPLITUDE_PX,
  );
  return sustainedDeviation(
    startX,
    endX,
    direction,
    amplitudePx,
    chain.map((event) => event.id).join('+'),
  );
}

// A concurrent second (third, ...) job/degree branches off the primary
// line itself, at whatever offset the primary line currently sits at
// (which may itself be elevated by an overlapping role) — not off flat
// baseline — then ramps LANE_DEPTH_PX further out, holds flat, and ramps
// back to rejoin the primary line's offset at the branch's own end. The
// ramp length is fixed at LANE_DEPTH_PX (not duration-scaled) so even a
// short concurrent stint keeps a visible flat section in the middle.
function buildBranchDeviation(
  chain,
  direction,
  pixelsPerYear,
  laneIndex,
  primaryDeviations,
  baselinePx,
) {
  const startX = dateToPixels(chain[0].date, pixelsPerYear);
  const endX = dateToPixels(chain[chain.length - 1].endDate, pixelsPerYear);
  const entryOffsetPx =
    getTrackY(startX, baselinePx, primaryDeviations) - baselinePx;
  const exitOffsetPx =
    getTrackY(endX, baselinePx, primaryDeviations) - baselinePx;
  const halfDuration = (endX - startX) / 2;
  const targetDepthPx = laneIndex * LANE_DEPTH_PX;
  const entryRampPx = Math.min(targetDepthPx, halfDuration);
  const exitRampPx = Math.min(targetDepthPx, halfDuration);
  return {
    footprintStart: startX,
    peakStart: startX + entryRampPx,
    peakEnd: endX - exitRampPx,
    footprintEnd: endX,
    peakOffsetPx: entryOffsetPx + direction * entryRampPx,
    entryOffsetPx,
    exitOffsetPx,
    eventId: chain.map((event) => event.id).join('+'),
  };
}

/**
 * Builds an ordered, non-overlapping deviation list for one track from
 * that track's own events. Pure function — no DOM/layout access.
 * @param {string} trackId - 'career'|'achievement'|'project'|'education'
 * @param {Array} trackEvents - events already filtered to this track's category
 * @param {Record<string, number>} baselinesPx - all 4 tracks' resolved baseline y
 * @param {number} pixelsPerYear
 * @param {Record<string, {primary: Array}>} [trunkDeviations] - already-built
 *   career/education deviation lists, needed to find exactly where those
 *   lines currently sit (possibly elevated) when an achievement/project
 *   dips toward one of them.
 * @returns {{primary: Array, lanes: Array<Array>}} primary === lanes[0] —
 *   the always-visible line. lanes[1+] are concurrent-event branches that
 *   only exist for the date range of their own events.
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
    const baselinePx = baselinesPx[trackId];

    const pointDeviations = sortedEvents
      .filter((event) => !event.endDate)
      .map((event) =>
        tentDeviation(
          dateToPixels(event.date, pixelsPerYear),
          direction * TRUNK_POINT_AMPLITUDE_PX,
          DEVIATION_PLATEAU_PX,
          event.id,
        ),
      );

    // Truly overlapping ranged events (concurrent jobs/degrees) are
    // packed into separate lanes; events that only touch (a promotion,
    // no gap) share a lane and render as one seamless elevated span via
    // groupIntoChains, instead of dipping to baseline at the handoff.
    const rangedSorted = sortedEvents.filter((event) => event.endDate);
    const eventLanes = assignLanes(rangedSorted);

    const primaryChainDeviations = groupIntoChains(eventLanes[0] ?? []).map(
      (chain) => buildTrunkChainDeviation(chain, direction, pixelsPerYear),
    );
    const primary = resolveOverlaps(
      [...pointDeviations, ...primaryChainDeviations].sort(
        (a, b) => a.footprintStart - b.footprintStart,
      ),
    );

    const branchLanes = eventLanes.slice(1).map((laneEvents, idx) => {
      const laneIndex = idx + 1;
      const chainDeviations = groupIntoChains(laneEvents).map((chain) =>
        buildBranchDeviation(
          chain,
          direction,
          pixelsPerYear,
          laneIndex,
          primary,
          baselinePx,
        ),
      );
      return resolveOverlaps(
        chainDeviations.sort((a, b) => a.footprintStart - b.footprintStart),
      );
    });

    return { primary, lanes: [primary, ...branchLanes] };
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
      trunkDeviations?.[targetTrack]?.primary ?? [],
    );
    const peakOffsetPx = targetY - baselinesPx[trackId];
    return tentDeviation(centerX, peakOffsetPx, TOUCH_PLATEAU_PX, event.id);
  });

  const resolved = resolveOverlaps(deviations);
  return { primary: resolved, lanes: [resolved] };
}

/**
 * Finds the lane (full deviation array) that contains the given event's
 * own deviation, by matching its id against each deviation's eventId
 * (which may be a chain's joined "id1+id2" string). Falls back to lane 0
 * if not found, which should only happen for an event this track doesn't
 * actually own.
 * @param {Array<Array>} lanes
 * @param {string} eventId
 * @returns {Array}
 */
export function findEventLane(lanes, eventId) {
  for (const lane of lanes) {
    if (lane.some((d) => d.eventId.split('+').includes(eventId))) {
      return lane;
    }
  }
  return lanes[0] ?? [];
}
