import { dateToPixels } from '../../utils/timelineScale';
import { getTrackY } from '../../utils/trackCurve';
import { TRUNK_RANGED_MAX_AMPLITUDE_PX } from '../../utils/trackDeviations';
import { CATEGORY_COLOR_VARS } from '../../utils/categories';
import { formatDate } from '../../utils/formatDate';
import styles from './TimelineMarker.module.css';

// Ranged events get a visual bar drawn separately (in the SVG layer) that
// traces the track's actual octolinear path across the event's date span.
// The button here is just the click/focus hit-area for that bar, so it's
// centered on the track's baseline (not the start point) and tall enough
// to cover the deviation the curve could jog through within the range —
// otherwise part of the visible bar could end up unclickable. Bounded by
// TRUNK_RANGED_MAX_AMPLITUDE_PX since the only ranged events today are
// Career/Education's own elevation, which is capped at that amplitude; a
// future ranged Achievement/Project event with a directed (career/
// education) affiliation could dip further than this and would need a
// larger bound revisited at that point.
const RANGED_HIT_AREA_PADDING_PX = 16;

// Drafting-style leader line connecting a point marker to its label: a
// straight run right off the dot, then a short 45-degree segment leading
// into the label. Drawn in a fixed local box centered on the dot — purely
// decorative chrome, independent of scroll position. The total reach
// (CONNECTOR_STRAIGHT_PX + CONNECTOR_KINK_PX vertically, CONNECTOR_KINK_PX
// horizontally) must stay in sync with the label's own offset in
// TimelineMarker.module.css, since both describe the same endpoint.
const CONNECTOR_BOX_PX = 60;
const CONNECTOR_CENTER_PX = 30;
const CONNECTOR_KINK_PX = 8;
const CONNECTOR_STRAIGHT_PX = 10;
const DOT_RADIUS_PX = 9.5;

function buildConnectorPath(labelPosition) {
  const direction = labelPosition === 'above' ? -1 : 1;
  const edge = CONNECTOR_CENTER_PX + direction * DOT_RADIUS_PX;
  const straightEnd = edge + direction * CONNECTOR_STRAIGHT_PX;
  const kinkEnd = straightEnd + direction * CONNECTOR_KINK_PX;
  const kinkX = CONNECTOR_CENTER_PX + CONNECTOR_KINK_PX;
  return `M${CONNECTOR_CENTER_PX},${edge} L${CONNECTOR_CENTER_PX},${straightEnd} L${kinkX},${kinkEnd}`;
}

export default function TimelineMarker({
  event,
  pixelsPerYear,
  baselinePx,
  deviations,
  labelPosition,
  isOpen,
  onActivate,
  registerRef,
}) {
  const isRanged = Boolean(event.endDate);
  const startPx = dateToPixels(event.date, pixelsPerYear);
  const startY = getTrackY(startPx, baselinePx, deviations);

  const wrapperStyle = {
    left: startPx,
    '--marker-color': CATEGORY_COLOR_VARS[event.category],
  };

  // Ranged labels sit centered directly on the bar itself, at the bar's
  // actual rendered position (start/end, midpoint) — not at the
  // surrounding wrapper's edges, which are deliberately oversized (see
  // RANGED_HIT_AREA_PADDING_PX above) purely for the invisible hit area
  // and don't track where the visible bar actually is.
  let labelStyle;
  if (isRanged) {
    const endPx = dateToPixels(event.endDate, pixelsPerYear);
    const midPx = (startPx + endPx) / 2;
    const midY = getTrackY(midPx, baselinePx, deviations);
    wrapperStyle.top = baselinePx;
    wrapperStyle.width = Math.max(0, endPx - startPx);
    wrapperStyle.height =
      TRUNK_RANGED_MAX_AMPLITUDE_PX * 2 + RANGED_HIT_AREA_PADDING_PX;
    labelStyle = {
      left: midPx - startPx,
      top: `calc(50% + ${midY - baselinePx}px)`,
      transform: 'translate(-50%, -50%)',
    };
  } else {
    wrapperStyle.top = startY;
  }

  const label = isRanged
    ? `${event.title}, ${formatDate(event.date)} to ${formatDate(event.endDate)}`
    : `${event.title}, ${formatDate(event.date)}`;

  // Point markers: the label sits on whichever side the marker actually
  // deviated toward — a bump up puts the label above, a dip down puts it
  // below — rather than a fixed alternating pattern.
  const offsetFromBaseline = startY - baselinePx;
  const resolvedLabelPosition =
    offsetFromBaseline > 0
      ? 'below'
      : offsetFromBaseline < 0
        ? 'above'
        : labelPosition;

  return (
    <div
      className={styles.markerWrapper}
      style={wrapperStyle}
      data-ranged={isRanged}
      data-label-position={resolvedLabelPosition}
    >
      <button
        ref={(node) => registerRef(event.id, node)}
        type="button"
        className={`${styles.marker} ${isRanged ? styles.range : styles.point}`}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={(clickEvent) => onActivate(event.id, clickEvent.currentTarget)}
      />
      {!isRanged && (
        <svg
          className={styles.connector}
          viewBox={`0 0 ${CONNECTOR_BOX_PX} ${CONNECTOR_BOX_PX}`}
          aria-hidden="true"
        >
          <path d={buildConnectorPath(resolvedLabelPosition)} />
        </svg>
      )}
      <span
        className={`${styles.label} ${isRanged ? styles.containedLabel : ''}`}
        style={labelStyle}
        aria-hidden="true"
      >
        {event.title}
      </span>
    </div>
  );
}
