import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  TRACK_IDS,
  TRACK_BASELINE_FRACTION,
  buildTrackPathD,
} from '../../utils/trackCurve';
import {
  buildTrackDeviations,
  findEventLane,
} from '../../utils/trackDeviations';
import {
  getAxisTotalWidth,
  dateToPixels,
  PIXELS_PER_YEAR,
} from '../../utils/timelineScale';
import { CATEGORY_COLOR_VARS } from '../../utils/categories';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import TimelineAxis from '../TimelineAxis/TimelineAxis';
import styles from './TimelineTracks.module.css';

// Point events within this x-distance of one another get progressively
// longer connector lines so their labels stagger vertically. The EARLIEST
// event in a cluster gets the LONGEST connector (label furthest from dot),
// so later connectors run above it and can't pass through its text.
const LABEL_CROWD_PX = PIXELS_PER_YEAR * 0.6; // ~7 months
const LABEL_STAGGER_STEP_PX = 32;

function computeConnectorExtensions(trackEvents, pixPerYear, trackId) {
  // Only stagger connectors on the achievement track — point events there
  // can touch the same trunk (education or career) and land at the same y,
  // making labels collide. Project events alternate ± direction naturally
  // so they self-separate without extra connector length.
  if (trackId !== 'achievement') return new Map();
  const points = trackEvents
    .filter((e) => !e.endDate)
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const xs = points.map((p) => dateToPixels(p.date, pixPerYear));
  const extensions = new Map();
  for (let i = 0; i < points.length; i++) {
    // Walk forward through *consecutive adjacent pairs* within LABEL_CROWD_PX.
    // This gives transitive reach: if A→B and B→C are both close, A's reach
    // includes C even when A→C exceeds the threshold directly. Stops as soon
    // as one adjacent gap is too large, preventing unrelated distant events
    // from being pulled into the cluster.
    let reach = 0;
    for (let j = i + 1; j < points.length; j++) {
      if (xs[j] - xs[j - 1] <= LABEL_CROWD_PX) {
        reach++;
      } else {
        break;
      }
    }
    if (reach > 0) {
      extensions.set(points[i].id, reach * LABEL_STAGGER_STEP_PX);
    }
  }
  return extensions;
}

export default function TimelineTracks({
  containerRef,
  eventsByTrack,
  axisEndYear,
  pixelsPerYear,
  activeEventId,
  onMarkerActivate,
  registerMarkerRef,
  prefersReducedMotion,
}) {
  const groupRef = useRef(null);
  const [groupHeight, setGroupHeight] = useState(0);

  useLayoutEffect(() => {
    const groupEl = groupRef.current;
    if (!groupEl) return;

    const observer = new ResizeObserver(([entry]) => {
      setGroupHeight(entry.contentRect.height);
    });
    observer.observe(groupEl);
    return () => observer.disconnect();
  }, []);

  const totalWidth = useMemo(
    () => getAxisTotalWidth(axisEndYear, pixelsPerYear),
    [axisEndYear, pixelsPerYear],
  );

  const baselines = useMemo(
    () =>
      Object.fromEntries(
        TRACK_IDS.map((id) => [id, TRACK_BASELINE_FRACTION[id] * groupHeight]),
      ),
    [groupHeight],
  );

  // Career/Education must be built first — an achievement/project that
  // dips toward one of them needs to know exactly where that trunk's line
  // currently sits (it may itself be elevated by an overlapping job or
  // degree), not just its resting baseline.
  const deviations = useMemo(() => {
    if (groupHeight === 0) return {};
    const trunkDeviations = {
      career: buildTrackDeviations(
        'career',
        eventsByTrack.career ?? [],
        baselines,
        pixelsPerYear,
      ),
      education: buildTrackDeviations(
        'education',
        eventsByTrack.education ?? [],
        baselines,
        pixelsPerYear,
      ),
    };
    return {
      ...trunkDeviations,
      achievement: buildTrackDeviations(
        'achievement',
        eventsByTrack.achievement ?? [],
        baselines,
        pixelsPerYear,
        trunkDeviations,
      ),
      project: buildTrackDeviations(
        'project',
        eventsByTrack.project ?? [],
        baselines,
        pixelsPerYear,
        trunkDeviations,
      ),
    };
  }, [eventsByTrack, baselines, pixelsPerYear, groupHeight]);

  return (
    <div
      ref={containerRef}
      className={styles.track}
      style={{ '--pixels-per-year': `${pixelsPerYear}px` }}
    >
      <div className={styles.inner} style={{ width: totalWidth }}>
        <div ref={groupRef} className={styles.tracksGroup}>
          <svg
            className={styles.svgLayer}
            width={totalWidth}
            height={groupHeight}
            viewBox={`0 0 ${totalWidth} ${groupHeight}`}
            aria-hidden="true"
          >
            {groupHeight > 0 &&
              TRACK_IDS.map((trackId) => (
                <path
                  key={trackId}
                  className={styles.trackPath}
                  data-track={trackId}
                  data-reduced-motion={prefersReducedMotion}
                  d={buildTrackPathD(
                    0,
                    totalWidth,
                    baselines[trackId],
                    deviations[trackId]?.primary,
                  )}
                />
              ))}
            {groupHeight > 0 &&
              TRACK_IDS.map((trackId) => {
                const trackLanes = deviations[trackId]?.lanes ?? [];
                const laneIndexOf = (id) => {
                  for (let i = 0; i < trackLanes.length; i++) {
                    if (
                      trackLanes[i].some((d) =>
                        d.eventId.split('+').includes(id),
                      )
                    )
                      return i;
                  }
                  return 0;
                };
                // Branch-lane events (e.g. Beer Farmers) paint first so the
                // primary lane (BCWS) always renders on top in SVG order.
                const rangedEvents = (eventsByTrack[trackId] ?? [])
                  .filter((event) => event.endDate)
                  .slice()
                  .sort((a, b) => laneIndexOf(b.id) - laneIndexOf(a.id));
                return rangedEvents.map((event) => {
                  const startX = dateToPixels(event.date, pixelsPerYear);
                  const endX = dateToPixels(event.endDate, pixelsPerYear);
                  const laneDeviations = findEventLane(
                    deviations[trackId]?.lanes ?? [],
                    event.id,
                  );
                  const d = buildTrackPathD(
                    startX,
                    endX,
                    baselines[trackId],
                    laneDeviations,
                  );
                  const segmentStyle = {
                    '--segment-color': CATEGORY_COLOR_VARS[event.category],
                  };
                  return (
                    <g key={event.id}>
                      <path
                        className={styles.rangeSegmentOutline}
                        style={segmentStyle}
                        d={d}
                      />
                      <path
                        className={styles.rangeSegment}
                        style={segmentStyle}
                        d={d}
                      />
                    </g>
                  );
                });
              })}
            {groupHeight > 0 &&
              (() => {
                const todayX = dateToPixels(
                  new Date().toISOString().slice(0, 7),
                  pixelsPerYear,
                );
                if (todayX <= 0 || todayX >= totalWidth) return null;
                return (
                  <g key="today-marker" className={styles.todayMarker}>
                    <line x1={todayX} y1={0} x2={todayX} y2={groupHeight} />
                    <text x={todayX + 6} y={14}>
                      Now
                    </text>
                  </g>
                );
              })()}
          </svg>
          {groupHeight > 0 &&
            TRACK_IDS.map((trackId) => {
              const extensions = computeConnectorExtensions(
                eventsByTrack[trackId] ?? [],
                pixelsPerYear,
                trackId,
              );
              return (eventsByTrack[trackId] ?? []).map((event, index) => (
                <TimelineMarker
                  key={event.id}
                  event={event}
                  pixelsPerYear={pixelsPerYear}
                  baselinePx={baselines[trackId]}
                  deviations={findEventLane(
                    deviations[trackId]?.lanes ?? [],
                    event.id,
                  )}
                  labelPosition={index % 2 === 0 ? 'above' : 'below'}
                  connectorExtension={extensions.get(event.id) ?? 0}
                  isOpen={activeEventId === event.id}
                  onActivate={onMarkerActivate}
                  registerRef={registerMarkerRef}
                />
              ));
            })}
        </div>
        <TimelineAxis pixelsPerYear={pixelsPerYear} axisEndYear={axisEndYear} />
      </div>
    </div>
  );
}
