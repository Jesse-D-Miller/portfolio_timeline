import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import TimelineEventCard from '../TimelineEventCard/TimelineEventCard';
import styles from './EventPopover.module.css';

const POPOVER_MARGIN = 8;
const ESTIMATED_WIDTH = 320;
const ESTIMATED_HEIGHT = 200;

function computePosition(anchorEl, popoverEl) {
  const anchorRect = anchorEl.getBoundingClientRect();
  const width = popoverEl?.offsetWidth ?? ESTIMATED_WIDTH;
  const height = popoverEl?.offsetHeight ?? ESTIMATED_HEIGHT;

  let left = anchorRect.left + anchorRect.width / 2 - width / 2;
  let top = anchorRect.top - height - POPOVER_MARGIN;

  // Flip below the marker if there's no room above it.
  if (top < POPOVER_MARGIN) {
    top = anchorRect.bottom + POPOVER_MARGIN;
  }

  // Clamp within the viewport so markers near the track's edges never push
  // the popover off-screen.
  left = Math.max(
    POPOVER_MARGIN,
    Math.min(left, window.innerWidth - width - POPOVER_MARGIN),
  );
  top = Math.max(
    POPOVER_MARGIN,
    Math.min(top, window.innerHeight - height - POPOVER_MARGIN),
  );

  return { top, left };
}

export default function EventPopover({
  event,
  anchorEl,
  containerRef,
  onClose,
}) {
  const popoverRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  // Seeded with an estimate-based position (rather than null) so the
  // popover is never visibility:hidden — a hidden element can't receive
  // focus, which would silently break the focus-on-open behavior below.
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    if (!event || !anchorEl) return;

    function updatePosition() {
      setPosition(computePosition(anchorEl, popoverRef.current));
    }

    updatePosition();

    const scrollContainer = containerRef.current;
    window.addEventListener('resize', updatePosition);
    scrollContainer?.addEventListener('scroll', updatePosition, {
      passive: true,
    });

    return () => {
      window.removeEventListener('resize', updatePosition);
      scrollContainer?.removeEventListener('scroll', updatePosition);
    };
  }, [event, anchorEl, containerRef]);

  useEffect(() => {
    if (!event) return;

    previouslyFocusedRef.current = document.activeElement;
    // preventScroll: the popover is already positioned where it needs to
    // be (position: fixed, anchored via getBoundingClientRect) — without
    // this, focusing the close button can trigger the browser's native
    // scroll-into-view, which fights the track's intended scroll position.
    popoverRef.current?.querySelector('button')?.focus({ preventScroll: true });

    function handleKeyDown(keyboardEvent) {
      if (keyboardEvent.key === 'Escape') onClose();
    }

    function handlePointerDown(pointerEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(pointerEvent.target) &&
        pointerEvent.target !== anchorEl
      ) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      // Same preventScroll reasoning as above — restoring focus to the
      // triggering marker shouldn't be allowed to silently re-scroll the
      // track out from under the user.
      previouslyFocusedRef.current?.focus?.({ preventScroll: true });
    };
  }, [event, anchorEl, onClose]);

  if (!event) return null;

  // Fall back to a synchronous estimate on the very first render of a given
  // open, before the layout effect above has measured the popover's real
  // size — keeps the element visible (and therefore focusable) immediately
  // rather than hiding it until the precise position is known.
  const renderPosition =
    position ??
    (anchorEl ? computePosition(anchorEl, null) : { top: 0, left: 0 });

  return createPortal(
    <div
      ref={popoverRef}
      className={styles.popover}
      style={{ top: renderPosition.top, left: renderPosition.left }}
      role="dialog"
      aria-modal="false"
      aria-label={event.title}
    >
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <TimelineEventCard event={event} asListItem={false} />
    </div>,
    document.body,
  );
}
