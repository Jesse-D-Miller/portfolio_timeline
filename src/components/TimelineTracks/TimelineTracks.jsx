import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  TRACK_IDS,
  TRACK_BASELINE_FRACTION,
  buildTrackPathD,
} from '../../utils/trackCurve';
import { getAxisTotalWidth, dateToPixels } from '../../utils/timelineScale';
import { CATEGORY_COLOR_VARS } from '../../utils/categories';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import TimelineAxis from '../TimelineAxis/TimelineAxis';
import styles from './TimelineTracks.module.css';

export default function TimelineTracks({
  containerRef,
  eventsByTrack,
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
    () => getAxisTotalWidth(pixelsPerYear),
    [pixelsPerYear],
  );

  const baselines = useMemo(
    () =>
      Object.fromEntries(
        TRACK_IDS.map((id) => [id, TRACK_BASELINE_FRACTION[id] * groupHeight]),
      ),
    [groupHeight],
  );

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
                    trackId,
                    0,
                    totalWidth,
                    baselines[trackId],
                  )}
                />
              ))}
            {groupHeight > 0 &&
              TRACK_IDS.map((trackId) =>
                (eventsByTrack[trackId] ?? [])
                  .filter((event) => event.endDate)
                  .map((event) => {
                    const startX = dateToPixels(event.date, pixelsPerYear);
                    const endX = dateToPixels(event.endDate, pixelsPerYear);
                    return (
                      <path
                        key={event.id}
                        className={styles.rangeSegment}
                        style={{
                          '--segment-color':
                            CATEGORY_COLOR_VARS[event.category],
                        }}
                        d={buildTrackPathD(
                          trackId,
                          startX,
                          endX,
                          baselines[trackId],
                        )}
                      />
                    );
                  }),
              )}
          </svg>
          {groupHeight > 0 &&
            TRACK_IDS.map((trackId) =>
              (eventsByTrack[trackId] ?? []).map((event, index) => (
                <TimelineMarker
                  key={event.id}
                  event={event}
                  pixelsPerYear={pixelsPerYear}
                  trackId={trackId}
                  baselinePx={baselines[trackId]}
                  labelPosition={index % 2 === 0 ? 'above' : 'below'}
                  isOpen={activeEventId === event.id}
                  onActivate={onMarkerActivate}
                  registerRef={registerMarkerRef}
                />
              )),
            )}
        </div>
        <TimelineAxis pixelsPerYear={pixelsPerYear} />
      </div>
    </div>
  );
}
