import { dateToPixels } from '../../utils/timelineScale';
import { getTrackY } from '../../utils/trackCurve';
import {
  TRUNK_RANGED_MAX_AMPLITUDE_PX,
  LANE_DEPTH_PX,
} from '../../utils/trackDeviations';
import { CATEGORY_COLOR_VARS } from '../../utils/categories';
import { formatDate } from '../../utils/formatDate';
import styles from './TimelineMarker.module.css';

// Ranged events get a visual bar drawn separately (in the SVG layer) that
// traces the track's actual octolinear path across the event's date span.
// The button here is just the click/focus hit-area for that bar, so it's
// centered on the track's baseline (not the start point) and tall enough
// to cover the deviation the curve could jog through within the range —
// otherwise part of the visible bar could end up unclickable. Sized for
// TRUNK_RANGED_MAX_AMPLITUDE_PX plus one branch lane's worth of extra
// depth (LANE_DEPTH_PX) since a concurrent second job is the deepest a
// trunk's bar goes today; a third concurrent lane would need this
// revisited.
const RANGED_HIT_AREA_PADDING_PX = 16;

// Gap between the bar's flat (plateau) start and the left edge of its
// label, so the text doesn't sit flush against the bar's rounded cap.
const RANGED_LABEL_INSET_PX = 14;

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

  // Ranged labels sit left-aligned against the bar's own flat (plateau)
  // section — not centered on the wrapper, which is deliberately oversized
  // (see RANGED_HIT_AREA_PADDING_PX above) purely for the invisible hit
  // area and doesn't track where the visible bar actually is, and not the
  // bar's midpoint either, since for a short event near a chain boundary
  // that midpoint can fall inside the diagonal ramp rather than the flat
  // run the text needs to sit on.
  let labelStyle;
  if (isRanged) {
    const endPx = dateToPixels(event.endDate, pixelsPerYear);
    const deviation = deviations?.find((d) =>
      d.eventId.split('+').includes(event.id),
    );
    const flatStartPx = deviation
      ? Math.max(startPx, deviation.peakStart)
      : startPx;
    const flatY = getTrackY(flatStartPx, baselinePx, deviations);
    wrapperStyle.top = baselinePx;
    wrapperStyle.width = Math.max(0, endPx - startPx);
    wrapperStyle.height =
      (TRUNK_RANGED_MAX_AMPLITUDE_PX + LANE_DEPTH_PX) * 2 +
      RANGED_HIT_AREA_PADDING_PX;
    labelStyle = {
      left: flatStartPx - startPx + RANGED_LABEL_INSET_PX,
      top: `calc(50% + ${flatY - baselinePx}px)`,
      transform: 'translateY(-50%)',
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
