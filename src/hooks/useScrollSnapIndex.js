import { useEffect, useState } from 'react';

const SCROLL_EDGE_TOLERANCE_PX = 1;

/**
 * Tracks which direct child of a scroll container is currently snapped to
 * the leading edge of the visible area, plus whether the container is at
 * the very start/end of its scrollable range. Works on whichever axis is
 * actually scrollable (horizontal on desktop, vertical on the mobile
 * stacked fallback). Driven by scroll position rather than
 * IntersectionObserver thresholds so it stays accurate at the track's
 * boundaries, where the viewport can show more cards than fit one "step"
 * away from the edge.
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {number} itemCount
 * @returns {{ activeIndex: number, atStart: boolean, atEnd: boolean }}
 */
export function useScrollSnapIndex(containerRef, itemCount) {
  const [state, setState] = useState({
    activeIndex: 0,
    atStart: true,
    atEnd: itemCount <= 1,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || itemCount === 0) return;

    function update() {
      const items = Array.from(container.children);
      const isHorizontal = container.scrollWidth > container.clientWidth;
      const scrollPos = isHorizontal
        ? container.scrollLeft
        : container.scrollTop;
      const maxScroll = isHorizontal
        ? container.scrollWidth - container.clientWidth
        : container.scrollHeight - container.clientHeight;

      let closestIndex = 0;
      let closestDistance = Infinity;
      items.forEach((item, index) => {
        const itemStart = isHorizontal ? item.offsetLeft : item.offsetTop;
        const distance = Math.abs(itemStart - scrollPos);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Mandatory scroll-snap rests at the first card's own offset (which
      // includes the track's leading padding), not literally 0, so compare
      // against that instead of a hardcoded edge value.
      const firstItemStart = isHorizontal
        ? (items[0]?.offsetLeft ?? 0)
        : (items[0]?.offsetTop ?? 0);

      setState({
        activeIndex: closestIndex,
        atStart: scrollPos <= firstItemStart + SCROLL_EDGE_TOLERANCE_PX,
        atEnd: scrollPos >= maxScroll - SCROLL_EDGE_TOLERANCE_PX,
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
  }, [containerRef, itemCount]);

  return state;
}
