import { useMemo, useRef } from 'react';
import { getSortedTimelineEvents } from '../../data/timelineEvents';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { useScrollSnapIndex } from '../../hooks/useScrollSnapIndex';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import TimelineSpine from '../TimelineSpine/TimelineSpine';
import TimelineEventCard from '../TimelineEventCard/TimelineEventCard';
import TimelineControls from '../TimelineControls/TimelineControls';
import styles from './Timeline.module.css';

export default function Timeline() {
  const events = useMemo(() => getSortedTimelineEvents(), []);
  const containerRef = useRef(null);

  const isNarrowViewport = useMediaQuery('(max-width: 720px)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );
  const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  useHorizontalScroll(containerRef, { enabled: !isNarrowViewport });
  const { activeIndex, atStart, atEnd } = useScrollSnapIndex(
    containerRef,
    events.length,
  );

  function scrollByOneCard(direction) {
    const container = containerRef.current;
    const firstCard = container?.children[0];
    if (!container || !firstCard) return;

    const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    container.scrollBy({ left: direction * step, behavior: scrollBehavior });
  }

  function handleCardFocus(event) {
    event.currentTarget.scrollIntoView({
      behavior: scrollBehavior,
      inline: 'start',
      block: 'nearest',
    });
  }

  return (
    <section
      className={styles.wrapper}
      aria-label="Career, project, and milestone timeline"
    >
      <TimelineSpine />
      <ul className={styles.track} ref={containerRef}>
        {events.map((event, index) => (
          <TimelineEventCard
            key={event.id}
            event={event}
            isActive={index === activeIndex}
            onFocus={handleCardFocus}
          />
        ))}
      </ul>
      <TimelineControls
        activeIndex={activeIndex}
        itemCount={events.length}
        activeTitle={events[activeIndex]?.title}
        disablePrev={atStart}
        disableNext={atEnd}
        onPrev={() => scrollByOneCard(-1)}
        onNext={() => scrollByOneCard(1)}
      />
    </section>
  );
}
