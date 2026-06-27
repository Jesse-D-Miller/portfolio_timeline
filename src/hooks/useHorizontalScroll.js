import { useEffect, useRef } from 'react';

/**
 * Wires a scrollable container so vertical mouse-wheel input and
 * mouse/pen drag both translate into horizontal scrolling. Trackpad
 * horizontal swipes and touch scrolling are left untouched since the
 * browser already handles those natively via CSS scroll-snap.
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {{ enabled: boolean }} options
 */
export function useHorizontalScroll(containerRef, { enabled }) {
  const dragState = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    function handleWheel(event) {
      const isVerticalWheelInput =
        Math.abs(event.deltaY) > Math.abs(event.deltaX);
      if (!isVerticalWheelInput) return;

      event.preventDefault();
      container.scrollBy({ left: event.deltaY, behavior: 'auto' });
    }

    function handlePointerDown(event) {
      if (event.pointerType === 'touch') return;
      // Let links inside cards behave normally instead of starting a drag.
      if (event.target.closest('a, button')) return;
      // Prevents native image drag-and-drop / text selection from
      // hijacking the gesture when the pointer starts over an <img> or text.
      event.preventDefault();
      dragState.current = {
        startX: event.clientX,
        startScrollLeft: container.scrollLeft,
      };
      container.setPointerCapture(event.pointerId);
      container.dataset.dragging = 'true';
    }

    function handlePointerMove(event) {
      if (!dragState.current) return;
      const { startX, startScrollLeft } = dragState.current;
      container.scrollLeft = startScrollLeft - (event.clientX - startX);
    }

    function endDrag(event) {
      if (!dragState.current) return;
      dragState.current = null;
      delete container.dataset.dragging;
      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointerleave', endDrag);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', endDrag);
      container.removeEventListener('pointerleave', endDrag);
    };
  }, [containerRef, enabled]);
}
