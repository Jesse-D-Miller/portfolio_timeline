import { dateToPixels } from '../../utils/timelineScale';
import { getTrackY, TRACK_AMPLITUDE_PX } from '../../utils/trackCurve';
import { CATEGORY_COLOR_VARS } from '../../utils/categories';
import { formatDate } from '../../utils/formatDate';
import styles from './TimelineMarker.module.css';

// Ranged events get a visual bar drawn separately (in the SVG layer) that
// traces the track's actual octolinear path across the event's date span.
// The button here is just the click/focus hit-area for that bar, so it's
// centered on the track's baseline (not the start point) and tall enough
// to cover the full amplitude the curve could jog through within the
// range — otherwise part of the visible bar could end up unclickable.
const RANGED_HIT_AREA_PADDING_PX = 16;

export default function TimelineMarker({
  event,
  pixelsPerYear,
  trackId,
  baselinePx,
  labelPosition,
  isOpen,
  onActivate,
  registerRef,
}) {
  const isRanged = Boolean(event.endDate);
  const startPx = dateToPixels(event.date, pixelsPerYear);
  const startY = getTrackY(trackId, startPx, baselinePx);

  const wrapperStyle = { left: startPx };
  if (isRanged) {
    const endPx = dateToPixels(event.endDate, pixelsPerYear);
    wrapperStyle.top = baselinePx;
    wrapperStyle.width = Math.max(0, endPx - startPx);
    wrapperStyle.height = TRACK_AMPLITUDE_PX * 2 + RANGED_HIT_AREA_PADDING_PX;
  } else {
    wrapperStyle.top = startY;
  }

  const label = isRanged
    ? `${event.title}, ${formatDate(event.date)} to ${formatDate(event.endDate)}`
    : `${event.title}, ${formatDate(event.date)}`;

  return (
    <div
      className={styles.markerWrapper}
      style={wrapperStyle}
      data-ranged={isRanged}
      data-label-position={labelPosition}
    >
      <button
        ref={(node) => registerRef(event.id, node)}
        type="button"
        className={`${styles.marker} ${isRanged ? styles.range : styles.point}`}
        style={{ '--marker-color': CATEGORY_COLOR_VARS[event.category] }}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={(clickEvent) => onActivate(event.id, clickEvent.currentTarget)}
      />
      <span className={styles.label} aria-hidden="true">
        {event.title}
      </span>
    </div>
  );
}
