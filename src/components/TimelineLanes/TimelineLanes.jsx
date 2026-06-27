import { useMemo } from 'react';
import { CATEGORY_ORDER } from '../../utils/categories';
import { getAxisTotalWidth } from '../../utils/timelineScale';
import TimelineLane from '../TimelineLane/TimelineLane';
import TimelineAxis from '../TimelineAxis/TimelineAxis';
import styles from './TimelineLanes.module.css';

export default function TimelineLanes({
  containerRef,
  events,
  eventsByCategory,
  pixelsPerYear,
  isNarrowViewport,
  activeEventId,
  onMarkerActivate,
  registerMarkerRef,
}) {
  const totalWidth = useMemo(
    () => getAxisTotalWidth(pixelsPerYear),
    [pixelsPerYear],
  );

  return (
    <div
      ref={containerRef}
      className={styles.track}
      style={{ '--pixels-per-year': `${pixelsPerYear}px` }}
    >
      <div className={styles.inner} style={{ width: totalWidth }}>
        {isNarrowViewport ? (
          <TimelineLane
            category="mixed"
            events={events}
            pixelsPerYear={pixelsPerYear}
            activeEventId={activeEventId}
            onMarkerActivate={onMarkerActivate}
            registerMarkerRef={registerMarkerRef}
          />
        ) : (
          CATEGORY_ORDER.map((category) => (
            <TimelineLane
              key={category}
              category={category}
              events={eventsByCategory[category] ?? []}
              pixelsPerYear={pixelsPerYear}
              activeEventId={activeEventId}
              onMarkerActivate={onMarkerActivate}
              registerMarkerRef={registerMarkerRef}
            />
          ))
        )}
        <TimelineAxis pixelsPerYear={pixelsPerYear} />
      </div>
    </div>
  );
}
