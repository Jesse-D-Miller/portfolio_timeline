import { useMemo, useRef, useState } from 'react';
import { getSortedTimelineEvents } from '../../data/timelineEvents';
import { TRACK_IDS } from '../../utils/trackCurve';
import { PIXELS_PER_YEAR } from '../../utils/timelineScale';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { useTimelineNavigation } from '../../hooks/useTimelineNavigation';
import { useInitialScrollPosition } from '../../hooks/useInitialScrollPosition';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import TimelineTracks from '../TimelineTracks/TimelineTracks';
import TimelineControls from '../TimelineControls/TimelineControls';
import TimelineLegend from '../TimelineLegend/TimelineLegend';
import EventPopover from '../EventPopover/EventPopover';
import styles from './Timeline.module.css';

export default function Timeline() {
  const events = useMemo(() => getSortedTimelineEvents(), []);
  const eventsByTrack = useMemo(() => {
    const grouped = Object.fromEntries(TRACK_IDS.map((t) => [t, []]));
    for (const event of events) {
      grouped[event.category].push(event);
    }
    return grouped;
  }, [events]);

  const containerRef = useRef(null);
  const markerRefs = useRef(new Map());

  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );
  const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  const [activeEventId, setActiveEventId] = useState(null);
  const [activeAnchorEl, setActiveAnchorEl] = useState(null);
  const [lastJump, setLastJump] = useState(null);

  useHorizontalScroll(containerRef, { enabled: true });
  useInitialScrollPosition(containerRef, PIXELS_PER_YEAR);
  const { atStart, atEnd, jumpToAdjacentEvent } = useTimelineNavigation(
    containerRef,
    events,
    PIXELS_PER_YEAR,
    scrollBehavior,
  );

  function registerMarkerRef(eventId, node) {
    if (node) markerRefs.current.set(eventId, node);
    else markerRefs.current.delete(eventId);
  }

  function handleMarkerActivate(id, node) {
    const next = activeEventId === id ? null : id;
    setActiveEventId(next);
    setActiveAnchorEl(next ? node : null);
  }

  function handleJump(direction) {
    const target = jumpToAdjacentEvent(direction);
    if (!target) return;
    setLastJump({ index: events.indexOf(target), title: target.title });
    // preventScroll: we already scrolled the track to the right position
    // above — without this, native focus-driven scroll-into-view fights
    // that, especially in the boundary-snap fallback where the focused
    // marker isn't at the position we just scrolled to.
    markerRefs.current.get(target.id)?.focus({ preventScroll: true });
  }

  const statusText = lastJump
    ? `Event ${lastJump.index + 1} of ${events.length}: ${lastJump.title}`
    : `${events.length} events — use the arrows, scroll, or drag to explore`;

  const activeEvent =
    events.find((event) => event.id === activeEventId) ?? null;

  return (
    <section
      className={styles.wrapper}
      aria-label="Career, achievement, project, and education timeline"
    >
      <TimelineLegend />
      <TimelineTracks
        containerRef={containerRef}
        eventsByTrack={eventsByTrack}
        pixelsPerYear={PIXELS_PER_YEAR}
        activeEventId={activeEventId}
        onMarkerActivate={handleMarkerActivate}
        registerMarkerRef={registerMarkerRef}
        prefersReducedMotion={prefersReducedMotion}
      />
      <TimelineControls
        statusText={statusText}
        disablePrev={atStart}
        disableNext={atEnd}
        onPrev={() => handleJump(-1)}
        onNext={() => handleJump(1)}
      />
      <EventPopover
        event={activeEvent}
        anchorEl={activeAnchorEl}
        containerRef={containerRef}
        onClose={() => {
          setActiveEventId(null);
          setActiveAnchorEl(null);
        }}
      />
    </section>
  );
}
