import { useEffect, useState } from 'react';
import { dateToPixels } from '../utils/timelineScale';

const SCROLL_EDGE_TOLERANCE_PX = 1;
const JUMP_EPSILON_PX = 1;

/**
 * Tracks true scroll-boundary state (atStart/atEnd) and provides a
 * jumpToAdjacentEvent(direction) function that scrolls to center the next
 * or previous event chronologically, relative to the viewport's current
 * center — not relative to scrollLeft itself, so "next" always moves to
 * something not already centered on screen.
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {Array<{id: string, date: string}>} events - pre-sorted by date
 * @param {number} pixelsPerYear
 * @param {ScrollBehavior} scrollBehavior
 */
export function useTimelineNavigation(
  containerRef,
  events,
  pixelsPerYear,
  scrollBehavior,
) {
  const [scrollState, setScrollState] = useState({
    atStart: true,
    atEnd: events.length <= 1,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function update() {
      const maxScroll = container.scrollWidth - container.clientWidth;
      setScrollState({
        atStart: container.scrollLeft <= SCROLL_EDGE_TOLERANCE_PX,
        atEnd: container.scrollLeft >= maxScroll - SCROLL_EDGE_TOLERANCE_PX,
      });
    }

    update();
    container.addEventListener('scroll', update, { passive: true });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, [containerRef, events.length]);

  function jumpToAdjacentEvent(direction) {
    const container = containerRef.current;
    if (!container || events.length === 0) return null;

    const currentCenter = container.scrollLeft + container.clientWidth / 2;
    const positions = events.map((event) =>
      dateToPixels(event.date, pixelsPerYear),
    );

    const maxScroll = container.scrollWidth - container.clientWidth;
    let targetIndex = -1;
    let clampedLeft;

    if (direction > 0) {
      targetIndex = positions.findIndex(
        (pos) => pos > currentCenter + JUMP_EPSILON_PX,
      );
      if (targetIndex === -1) {
        // No event ahead of the current view — snap to the literal end
        // rather than re-targeting the last event's own position, which
        // could already be behind the current view and cause no movement.
        targetIndex = events.length - 1;
        clampedLeft = maxScroll;
      } else {
        clampedLeft = Math.max(
          0,
          Math.min(
            maxScroll,
            positions[targetIndex] - container.clientWidth / 2,
          ),
        );
      }
    } else {
      for (let i = positions.length - 1; i >= 0; i--) {
        if (positions[i] < currentCenter - JUMP_EPSILON_PX) {
          targetIndex = i;
          break;
        }
      }
      if (targetIndex === -1) {
        // No event behind the current view (e.g. the initial view sits
        // before the first event chronologically) — snap to the literal
        // start rather than the first event's position, which could
        // already be ahead of the current view.
        targetIndex = 0;
        clampedLeft = 0;
      } else {
        clampedLeft = Math.max(
          0,
          Math.min(
            maxScroll,
            positions[targetIndex] - container.clientWidth / 2,
          ),
        );
      }
    }

    container.scrollTo({ left: clampedLeft, behavior: scrollBehavior });

    return events[targetIndex];
  }

  return { ...scrollState, jumpToAdjacentEvent };
}
