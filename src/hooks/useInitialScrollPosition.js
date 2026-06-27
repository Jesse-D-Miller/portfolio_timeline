import { useLayoutEffect, useRef } from 'react';
import { FOCUS_YEAR, dateToPixels } from '../utils/timelineScale';

/**
 * Scrolls the track to bring FOCUS_YEAR into view on first mount, before
 * the browser paints, so the user never sees a frame at scrollLeft 0.
 * Runs exactly once — later re-renders (resize, breakpoint flips) must not
 * re-snap the view if the user has since scrolled elsewhere.
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {number} pixelsPerYear
 */
export function useInitialScrollPosition(containerRef, pixelsPerYear) {
  const hasScrolledRef = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || hasScrolledRef.current) return;

    const targetLeft =
      dateToPixels(`${FOCUS_YEAR}-01`, pixelsPerYear) -
      container.clientWidth / 2;
    container.scrollLeft = Math.max(0, targetLeft);
    hasScrolledRef.current = true;
  }, [containerRef, pixelsPerYear]);
}
