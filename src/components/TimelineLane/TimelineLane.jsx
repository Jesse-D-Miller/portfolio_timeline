import { CATEGORY_LABELS, CATEGORY_COLOR_VARS } from '../../utils/categories';
import TimelineMarker from '../TimelineMarker/TimelineMarker';
import styles from './TimelineLane.module.css';

export default function TimelineLane({
  category,
  events,
  pixelsPerYear,
  activeEventId,
  onMarkerActivate,
  registerMarkerRef,
}) {
  const isMixed = category === 'mixed';
  const laneColorVar = isMixed ? undefined : CATEGORY_COLOR_VARS[category];

  return (
    <div
      className={styles.lane}
      style={{ '--lane-color': laneColorVar }}
      role="group"
      aria-label={isMixed ? 'Timeline' : `${CATEGORY_LABELS[category]} lane`}
    >
      {!isMixed && (
        <span className={styles.laneLabel}>{CATEGORY_LABELS[category]}</span>
      )}
      {events.map((event) => (
        <TimelineMarker
          key={event.id}
          event={event}
          pixelsPerYear={pixelsPerYear}
          colorVar={
            isMixed ? CATEGORY_COLOR_VARS[event.category] : laneColorVar
          }
          isOpen={activeEventId === event.id}
          onActivate={onMarkerActivate}
          registerRef={registerMarkerRef}
        />
      ))}
    </div>
  );
}
