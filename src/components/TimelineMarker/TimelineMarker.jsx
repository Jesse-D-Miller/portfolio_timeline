import { dateToPixels } from '../../utils/timelineScale';
import { formatDate } from '../../utils/formatDate';
import styles from './TimelineMarker.module.css';

export default function TimelineMarker({
  event,
  pixelsPerYear,
  colorVar,
  isOpen,
  onActivate,
  registerRef,
}) {
  const isRanged = Boolean(event.endDate);
  const startPx = dateToPixels(event.date, pixelsPerYear);

  const style = { '--marker-color': colorVar };
  if (isRanged) {
    const endPx = dateToPixels(event.endDate, pixelsPerYear);
    style.left = startPx;
    style.width = Math.max(0, endPx - startPx);
  } else {
    style.left = startPx;
  }

  const label = isRanged
    ? `${event.title}, ${formatDate(event.date)} to ${formatDate(event.endDate)}`
    : `${event.title}, ${formatDate(event.date)}`;

  return (
    <button
      ref={(node) => registerRef(event.id, node)}
      type="button"
      className={`${styles.marker} ${isRanged ? styles.range : styles.point}`}
      style={style}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      onClick={(clickEvent) => onActivate(event.id, clickEvent.currentTarget)}
    />
  );
}
